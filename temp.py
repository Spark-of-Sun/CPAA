from composio import Composio
# Initialize Composio
composio = Composio(api_key="ak_efpNda2jbbr3KEiasIs1")

# Create MCP server with multiple toolkits
server = composio.mcp.create(
name="mcp-config-73840", # Pick a unique name for your MCP server
toolkits=[
    {
        "toolkit": "googledrive",
        "auth_config": "ac_r_U40hf49mwj"  # Your Gmail auth config ID
    },
    {
        "toolkit": "googlemeet",
        "auth_config": "ac_Xzf4PmU_I0wO"  # Your Google Calendar auth config ID
    },
    {
        "toolkit": "slack",
        "auth_config": "ac_LEAR1TmMeO9-"  # Your Google Calendar auth config ID
    },
    {
        "toolkit": "googlecalendar",
        "auth_config": "ac_M6whwOxy2qv2"  # Your Google Calendar auth config ID
    },
    {
        "toolkit": "gmail",
        "auth_config": "ac_EqHxSC1dPkVN"  # Your Google Calendar auth config ID
    }
],
)

print(f"Server created: {server.id}")
