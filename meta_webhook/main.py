import os
from fastapi import FastAPI, Request
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "")  # must match what you set in Meta dashboard

# Step 1: Verification endpoint (Meta calls this once when you set webhook)
@app.get("/webhook")
async def verify(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode == "subscribe" and token == VERIFY_TOKEN:
        return int(challenge)  # send back challenge if token matches
    return {"error": "verification failed"}

# Step 2: Receiver endpoint (Meta will post here for every event)
@app.post("/webhook")
async def webhook(request: Request):
    data = await request.json()
    print("📩 Webhook event received:", data)
    return {"status": "received"}
