import asyncio
from src.database import init_db

# 🔥 ADD THIS LINE
from src.models import *

async def main():
    await init_db()
    print("✅ Tables created")

asyncio.run(main())