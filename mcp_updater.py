import os


def get_toolkits_from_env():
    """
    Reads all COMPOSIO_AUTH_* variables from .env/environment.

    Example:
        COMPOSIO_AUTH_GMAIL=ac_xxx
        COMPOSIO_AUTH_GITHUB=ac_yyy

    Returns:
        [
            {
                "toolkit": "gmail",
                "auth_config_id": "ac_xxx"
            },
            {
                "toolkit": "github",
                "auth_config_id": "ac_yyy"
            }
        ]
    """
    toolkits = []

    for env_name, value in os.environ.items():
        if not env_name.startswith("COMPOSIO_AUTH_"):
            continue

        value = value.strip()
        if not value:
            continue

        toolkit = env_name[len("COMPOSIO_AUTH_"):].lower()

        toolkits.append(
            {
                "toolkit": toolkit,
                "auth_config_id": value,
            }
        )

    return sorted(toolkits, key=lambda x: x["toolkit"])