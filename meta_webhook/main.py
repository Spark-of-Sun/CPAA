from fastapi import FastAPI, Request

app = FastAPI()

VERIFY_TOKEN = "EAAbk3lOjYzoBSWaE1ct9CgUi5ZBzJ36iKrhGMvaQquEBhtv2XhNBzKBAZCjQ0M4wskAsQiAlayvkWNSQ68EZA8gQmFeVxCuO1NbKPd0vEBxyjXeISyXbBSVa6usZBphlKNrHlocVj70VYlC6l2k8NfxtKWHkXIgZALgUiqDFkZBQ9qczeNbYF2N71lsvY77LLRUw0M4XE6R8241tGRaBiQ6YuBfkg5lwSK9MmUJkzgBMSwpcdvaoa6YQq8QsuCEbu70Dk97MoyLdh3967SUWYOEJIZA"  # must match what you set in Meta dashboard

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
