"""
Run this after any .env toolkit change (adding/removing COMPOSIO_AUTH_* values).
Forces a clean rebuild of the MCP server so it only contains tools for
toolkits currently enabled in .env — not stale ones from a previous run.

Usage:
    python rebuild_mcp_server.py
"""
import asyncio
from dotenv import load_dotenv
load_dotenv()

from src.services.redis_client import redis_client
from src.services.composio_service import composio_service


async def main():
    await redis_client.connect()

    # 1. Clear the 5-min auth_configs cache so fetch_auth_configs() re-hits Composio API
    await redis_client.delete("composio_auth_configs")
    print("Cleared composio_auth_configs cache")

    # 2. Clear the fingerprint so ensure_mcp_server() can't "reuse" a stale server
    await redis_client.delete("mcp_server_fingerprint")
    print("Cleared mcp_server_fingerprint cache")

    # 3. Show exactly what .env currently enables
    env_toolkits = composio_service._get_env_enabled_toolkits()
    print(f"\n.env enabled toolkits right now: {env_toolkits}\n")

    # 4. Rebuild
    server_id = await composio_service.ensure_mcp_server()
    print(f"\nNew/reused server_id: {server_id}")

    # 5. Inspect the result to confirm the toolkit list matches .env exactly
    server = composio_service.client.mcp.get(server_id)
    print(f"Server toolkits: {server.toolkits}")
    print(f"Server mcp_url:  {server.mcp_url}")
    print(f"Allowed tools count: {len(server.allowed_tools)}")

    # 6. Clear ALL per-user cached MCP URLs so no user keeps hitting an old server
    keys = await redis_client.client.keys("user_mcp_url:*")
    if keys:
        await redis_client.client.delete(*keys)
        print(f"Cleared {len(keys)} cached per-user MCP URLs")


asyncio.run(main())