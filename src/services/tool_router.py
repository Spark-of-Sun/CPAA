"""
tool_router.py  --  send Gemini only the tools a message actually needs.

Put this file at:  src/services/tool_router.py

Why: all connected toolkits together were ~100,000 tokens PER MODEL CALL.
Now a message like "send an email to Raj" only carries the Gmail tools, and
"hi" carries none.

How it decides:
  * Composio tool names start with the toolkit name:  GMAIL_SEND_EMAIL,
    ZOOM_CREATE_A_MEETING, GITHUB_...   -> we group tools by that first word.
  * A toolkit is switched on when the message contains one of its KEYWORDS.
    Toolkits not listed in KEYWORDS switch on when their own name appears
    ("github", "slack", "notion", ...), so new toolkits work automatically.
  * Follow-ups work: a toolkit stays on for STICKY_SECONDS after it was used,
    so "yes, send it" still has the Gmail tools.

Turn it off any time with the env var  TOOL_ROUTING=off  (needs a restart).
"""
import json
import os
import re
import time

# toolkit prefix (first word of the tool name, upper-case) -> trigger words.
# Matching is "word starts with", so "email" also matches "emails".
KEYWORDS = {
    "GMAIL": ["email", "e-mail", "mail", "gmail", "inbox", "draft", "unread"],
    "GOOGLECALENDAR": ["calendar", "schedule", "event", "meeting", "appointment",
                       "remind", "agenda", "free slot", "free time", "busy", "invite"],
    "GOOGLEDRIVE": ["drive", "file", "folder", "document", "sheet", "slides", "pdf"],
    "ZOOM": ["zoom", "meeting", "video call"],
}

STICKY_SECONDS = 10 * 60  # keep a toolkit on this long after it was used

# Appended to the system prompt so a keyword miss produces a useful reply
# instead of a wrong "I can't do that".
PROMPT_NOTE = (
    "\n\nNOTE: Only the connected apps relevant to the user's current message are loaded. "
    "If the user needs an app that is not available right now, ask them to name it "
    "(for example: email, calendar, zoom) in their message."
)

_recent = {}          # user_id -> {prefix: expires_at}
_printed_breakdown = False


def _name(tool):
    return getattr(tool, "tool_name", None) or getattr(tool, "name", None) or str(tool)


def _prefix(tool):
    return _name(tool).split("_", 1)[0].upper()


def _tokens(tools):
    """Rough estimate: ~4 characters per token."""
    try:
        return sum(len(json.dumps(t.tool_spec, default=str)) for t in tools) // 4
    except Exception:
        return sum(len(str(t)) for t in tools) // 4


def _mentions(words, text):
    return any(re.search(r"\b" + re.escape(w), text) for w in words)


def select_tools(user_id, message, tools):
    """Return only the tools this message needs (plus recently used toolkits)."""
    global _printed_breakdown

    if os.getenv("TOOL_ROUTING", "on").strip().lower() == "off":
        return tools

    by_prefix = {}
    for t in tools:
        by_prefix.setdefault(_prefix(t), []).append(t)

    if not _printed_breakdown:  # once per server start: who costs what
        _printed_breakdown = True
        print("🧮 Tool cost by toolkit (rough tokens, sent on every call if left on):")
        for p, ts in sorted(by_prefix.items(), key=lambda kv: -_tokens(kv[1])):
            print(f"     {p:<18} {len(ts):>4} tools  ≈ {_tokens(ts):>8,}")

    text = (message or "").lower()
    now = time.time()
    expiry = _recent.setdefault(user_id, {})

    for p in by_prefix:
        words = KEYWORDS.get(p, [p.lower()])
        if _mentions(words, text):
            expiry[p] = now + STICKY_SECONDS

    chosen = {p for p, exp in expiry.items() if exp > now and p in by_prefix}
    selected = [t for t in tools if _prefix(t) in chosen]

    print(f"🧮 Sending {len(selected)}/{len(tools)} tools "
          f"≈ {_tokens(selected):,} of ≈ {_tokens(tools):,} tokens "
          f"| toolkits: {sorted(chosen) or 'none'}")
    return selected