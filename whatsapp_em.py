#!/usr/bin/env python3
"""
whatsapp_emulator.py  --  TEMPORARY terminal stand-in for the WhatsApp Cloud API.

Pure Python standard library. No pip install needed.

HOW IT WORKS
    you type a message
        -> emulator POSTs a Meta-style webhook to your app   (POST /webhook)
    your app replies
        -> app calls "graph.facebook.com"  (redirected to this emulator by
           WHATSAPP_GRAPH_BASE) -> reply is printed in this terminal

USAGE
    python whatsapp_emulator.py
    python whatsapp_emulator.py --phone 911111111111 --app-url http://127.0.0.1:8000/webhook
"""
import argparse
import json
import os
import random
import re
import string
import sys
import threading
import time
import urllib.error
import urllib.request
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

try:
    import readline  # optional: nicer line editing on Linux/macOS
except ImportError:
    readline = None

if os.name == "nt":
    os.system("")  # enables ANSI escape codes in Windows 10+ terminals

PROMPT = "you > "
GRAPH_PATH = re.compile(r"^/v\d+(?:\.\d+)?/([^/]+)/messages/?$")
TTY = sys.stdout.isatty()

lock = threading.Lock()
state = {"phone": "911111111111", "raw": False, "typing": False}


# ----------------------------------------------------------------- printing --
def now():
    return datetime.now().strftime("%H:%M:%S")


def say(text=""):
    """Print from the main thread."""
    with lock:
        print(text, flush=True)


def say_async(text):
    """Print from the server thread without wrecking the line being typed."""
    with lock:
        if TTY and state["typing"]:
            typed = readline.get_line_buffer() if readline else ""
            sys.stdout.write("\r\033[K" + text + "\n" + PROMPT + typed)
        else:
            sys.stdout.write(text + "\n")
        sys.stdout.flush()


def new_wamid():
    return "wamid." + "".join(random.choices(string.ascii_letters + string.digits, k=40))


# ---------------------------------------------------- fake Graph API (replies) --
def show_bot_message(to, body, headers):
    if body.get("type") == "text":
        text = body.get("text", {}).get("body", "")
    else:
        text = json.dumps(body, indent=2, ensure_ascii=False)

    lines = [f"[{now()}] BOT -> {to}"]
    lines += ["    " + ln for ln in (text.splitlines() or [""])]
    if state["raw"]:
        lines.append("    --- raw request from app ---")
        lines.append("    Authorization: " + ("present" if headers.get("Authorization") else "MISSING"))
        lines += ["    " + ln for ln in json.dumps(body, indent=2, ensure_ascii=False).splitlines()]
    lines.append("")
    say_async("\n".join(lines))


class FakeGraph(BaseHTTPRequestHandler):
    """Accepts POST /v18.0/<phone_number_id>/messages like Meta does."""

    def log_message(self, *args):  # keep the terminal quiet
        pass

    def _reply(self, code, obj):
        data = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b""

        if not GRAPH_PATH.match(self.path.split("?")[0]):
            say_async(f"[{now()}] (emulator) unexpected request: POST {self.path}")
            return self._reply(404, {"error": {"message": f"Unknown path {self.path}", "code": 404}})

        try:
            body = json.loads(raw or b"{}")
        except ValueError:
            return self._reply(400, {"error": {"message": "Invalid JSON", "code": 100}})

        to = body.get("to", "?")
        show_bot_message(to, body, self.headers)
        self._reply(200, {
            "messaging_product": "whatsapp",
            "contacts": [{"input": to, "wa_id": to}],
            "messages": [{"id": new_wamid()}],
        })


# ------------------------------------------------- send "incoming" to your app --
def build_payload(phone, name, text, phone_number_id):
    """Same shape Meta sends to your webhook for an incoming text message."""
    return {
        "object": "whatsapp_business_account",
        "entry": [{
            "id": "100000000000000",
            "changes": [{
                "field": "messages",
                "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {
                        "display_phone_number": "15550000000",
                        "phone_number_id": phone_number_id,
                    },
                    "contacts": [{"profile": {"name": name}, "wa_id": phone}],
                    "messages": [{
                        "from": phone,
                        "id": new_wamid(),
                        "timestamp": str(int(time.time())),
                        "type": "text",
                        "text": {"body": text},
                    }],
                },
            }],
        }],
    }


def post_to_app(app_url, payload):
    """Returns (status_code or None, response_text)."""
    req = urllib.request.Request(
        app_url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status, r.read().decode(errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(errors="replace")
    except urllib.error.URLError as e:
        return None, str(e.reason)
    except Exception as e:  # timeouts etc.
        return None, str(e)


def app_is_up(app_url):
    p = urlparse(app_url)
    try:
        urllib.request.urlopen(f"{p.scheme}://{p.netloc}/health", timeout=3).read()
        return True
    except urllib.error.HTTPError:
        return True  # server answered, just not on /health
    except Exception:
        return False


# --------------------------------------------------------------------- main --
HELP = """\
  <text>          send a message as you
  /from <number>  switch sender number (e.g. test an unlinked number)
  /raw            toggle raw JSON view of what your app sends back
  /help           show this
  /quit           exit  (Ctrl+C / Ctrl+D also work)"""


def main():
    ap = argparse.ArgumentParser(description="Temporary WhatsApp emulator for terminal testing.")
    ap.add_argument("--phone", default="911111111111", help="your number, digits only, no '+' (default: 911111111111)")
    ap.add_argument("--name", default="Me", help="profile name sent in the webhook")
    ap.add_argument("--app-url", default="http://127.0.0.1:8000/webhook", help="your app's webhook URL")
    ap.add_argument("--listen-port", type=int, default=9000, help="port for the fake Graph API (default: 9000)")
    ap.add_argument("--phone-number-id", default="100000000000001", help="phone_number_id placed in webhook metadata")
    args = ap.parse_args()
    state["phone"] = args.phone.lstrip("+").replace(" ", "")

    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.listen_port), FakeGraph)
    except OSError as e:
        sys.exit(f"Can't listen on port {args.listen_port}: {e}\nTry: --listen-port 9001 "
                 f"(and set WHATSAPP_GRAPH_BASE to match)")
    threading.Thread(target=server.serve_forever, daemon=True).start()

    up = app_is_up(args.app_url)
    say("=" * 60)
    say(" WhatsApp Emulator  (temporary, local only)")
    say("=" * 60)
    say(f" You        : {state['phone']}")
    say(f" Your app   : {args.app_url}   [{'reachable' if up else 'NOT reachable - is it running?'}]")
    say(f" Fake Graph : http://127.0.0.1:{args.listen_port}")
    say(f"              (your app needs WHATSAPP_GRAPH_BASE=http://127.0.0.1:{args.listen_port})")
    say("-" * 60)
    say(HELP)
    say("-" * 60)

    while True:
        state["typing"] = True
        try:
            line = input(PROMPT)
        except (EOFError, KeyboardInterrupt):
            state["typing"] = False
            say("\nbye")
            if not sys.stdin.isatty():
                time.sleep(5)  # piped input: give the app a moment to answer
            break
        state["typing"] = False
        line = line.strip()
        if not line:
            continue

        if line.startswith("/"):
            cmd, _, rest = line.partition(" ")
            cmd = cmd.lower()
            if cmd in ("/quit", "/exit", "/q"):
                say("bye")
                break
            elif cmd == "/help":
                say(HELP)
            elif cmd == "/raw":
                state["raw"] = not state["raw"]
                say(f"raw view: {'ON' if state['raw'] else 'OFF'}")
            elif cmd == "/from":
                num = rest.strip().lstrip("+").replace(" ", "")
                if num.isdigit():
                    state["phone"] = num
                    say(f"now sending as {num}")
                else:
                    say("usage: /from 911111111111   (digits only)")
            else:
                say(f"unknown command {cmd}  (try /help)")
            continue

        payload = build_payload(state["phone"], args.name, line, args.phone_number_id)
        if state["raw"]:
            say("--- raw webhook sent to app ---\n" + json.dumps(payload, indent=2))
        status, text = post_to_app(args.app_url, payload)
        if status is None:
            say(f"[{now()}] x could not reach app: {text}")
        elif 200 <= status < 300:
            say(f"[{now()}] ok delivered to app (HTTP {status}) - waiting for reply...")
        else:
            say(f"[{now()}] x app returned HTTP {status}: {text[:300]}")

    server.shutdown()


if __name__ == "__main__":
    main()