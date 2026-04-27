from fastapi import FastAPI, Request

app = FastAPI()

VERIFY_TOKEN = "EAALXm0CEifEBPpOuIrdfoH3FbFgroamFXfKo6ZBiqLLZAZCWkFX5kUZAQVovudA1qIt9u9naIrr4Ppv4eZA5WCOH82xzVkIXDAht6QibKpDngkfoG6Mu1B9ZCgSVTXkwGZAfRefiTBK0c6LwtkBv54XKtWa7ZCdqIdk5V5LZCWTc9DttkjWZAxTRzIh0yMt06NmBx4TGmGZCqVRVmYZAEwvnMuyNWaxMAZCHaoHLQLXB8PhsmgeTJOpJndigladnf4AZDZD"  # must match what you set in Meta dashboard

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
