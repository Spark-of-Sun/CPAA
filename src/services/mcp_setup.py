"""
MCP Setup Utility
=================
One-time setup and upgrade script for Composio MCP server.

Usage:
    # Create MCP server (run once)
    python3 -m src.services.mcp_setup create

    # List existing MCP servers
    python3 -m src.services.mcp_setup list

    # Add more apps to existing server
    python3 -m src.services.mcp_setup update --id YOUR_SERVER_UUID --apps gmail googlecalendar slack

    # Show server details
    python3 -m src.services.mcp_setup info --id YOUR_SERVER_UUID

    # tested on cli
    # List servers
python3 -m src.services.mcp_setup list

# Update with more apps
python3 -m src.services.mcp_setup update --id COMPOSIO_MCP_SERVER_ID --apps gmail googlecalendar

# Show info
python3 -m src.services.mcp_setup info --id COMPOSIO_MCP_SERVER_ID

NOTE:
    After creating a server, copy the UUID to your .env file:
    COMPOSIO_MCP_SERVER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
"""

import os
import sys
import argparse
from dotenv import load_dotenv
from composio import Composio

load_dotenv()


def get_client() -> Composio:
    api_key = os.getenv("COMPOSIO_API_KEY", "")
    if not api_key:
        print("❌ COMPOSIO_API_KEY not set in .env")
        sys.exit(1)
    return Composio(api_key=api_key)


def cmd_create(args):
    """Create a new MCP server"""
    c = get_client()
    toolkits = args.apps or ["gmail"]

    print(f"🔧 Creating MCP server '{args.name}' with toolkits: {toolkits}")
    server = c.mcp.create(
        name=args.name,
        toolkits=toolkits,
        manually_manage_connections=False
    )

    server_id = server.id if hasattr(server, 'id') else server.get('id')
    server_name = server.name if hasattr(server, 'name') else server.get('name')

    print(f"\n✅ MCP Server created!")
    print(f"   Name : {server_name}")
    print(f"   ID   : {server_id}")
    print(f"\n👉 Add this to your .env file:")
    print(f"   COMPOSIO_MCP_SERVER_ID={server_id}")


def cmd_list(args):
    """List all MCP servers"""
    c = get_client()
    result = c.mcp.list()
    items = result.get('items', []) if isinstance(result, dict) else result

    if not items:
        print("📭 No MCP servers found.")
        return

    print(f"📋 Found {len(items)} MCP server(s):\n")
    for s in items:
        sid = s.id if hasattr(s, 'id') else s.get('id')
        sname = s.name if hasattr(s, 'name') else s.get('name')
        print(f"  • {sname} → {sid}")


def cmd_update(args):
    """Update MCP server with new apps"""
    if not args.id:
        print("❌ --id is required for update")
        sys.exit(1)
    if not args.apps:
        print("❌ --apps is required for update")
        sys.exit(1)

    c = get_client()
    print(f"🔄 Updating MCP server {args.id} with toolkits: {args.apps}")
    server = c.mcp.update(server_id=args.id, toolkits=args.apps)

    print(f"✅ MCP Server updated!")
    print(f"   {server}")


def cmd_info(args):
    """Show MCP server details"""
    if not args.id:
        # Use from .env if not provided
        args.id = os.getenv("COMPOSIO_MCP_SERVER_ID", "")
    if not args.id:
        print("❌ --id is required or set COMPOSIO_MCP_SERVER_ID in .env")
        sys.exit(1)

    c = get_client()
    server = c.mcp.get(server_id=args.id)
    print(f"📋 MCP Server Info:")
    print(f"   {server}")


def main():
    parser = argparse.ArgumentParser(
        description="CPAA MCP Server Setup Utility"
    )
    subparsers = parser.add_subparsers(dest="command")

    # create
    p_create = subparsers.add_parser("create", help="Create a new MCP server")
    p_create.add_argument("--name", default="cpaa-agent", help="Server name")
    p_create.add_argument("--apps", nargs="+", default=["gmail"], help="Apps to include")

    # list
    subparsers.add_parser("list", help="List all MCP servers")

    # update
    p_update = subparsers.add_parser("update", help="Update MCP server apps")
    p_update.add_argument("--id", help="MCP server UUID")
    p_update.add_argument("--apps", nargs="+", help="New list of apps")

    # info
    p_info = subparsers.add_parser("info", help="Show MCP server details")
    p_info.add_argument("--id", help="MCP server UUID (or uses .env)")

    args = parser.parse_args()

    if args.command == "create":
        cmd_create(args)
    elif args.command == "list":
        cmd_list(args)
    elif args.command == "update":
        cmd_update(args)
    elif args.command == "info":
        cmd_info(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()