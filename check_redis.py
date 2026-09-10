# check_redis.py
import asyncio
from src.services.redis_client import redis_client

USER_ID = "google-oauth2|115306916308283978502"

async def main():
    await redis_client.connect()
    val = await redis_client.get(f"user_mcp_config:{USER_ID}")
    print("Stored value:", val)
    await redis_client.disconnect()

asyncio.run(main())