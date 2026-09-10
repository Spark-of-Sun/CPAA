#!/bin/bash

echo " CPAA OAuth Testing Script"
echo "=" * 40

# Check if server is running
echo "Checking if server is running..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "   Server is running"
else
    echo "   Server is not running. Start it with:"
    echo "   cd /home/khushwant/CPAA/src/backend && python3 main.py"
    exit 1
fi

# Check providers
echo -e "\n📋 Available OAuth providers:"
curl -s "http://localhost:8000/oauth/providers" | jq -r '.[] | "   • \(.display_name) (\(.name)) - \(.scopes | length) scopes"'

# Check authentication status
echo -e "\n🔐 Authentication status:"
AUTH_STATUS=$(curl -s -c cookies.txt -b cookies.txt "http://localhost:8000/auth/status")
echo "   $AUTH_STATUS"

if echo "$AUTH_STATUS" | grep -q "Authentication required"; then
    echo -e "\n❗ You need to authenticate first:"
    echo "   1. Open browser: http://localhost:8000/auth/login"
    echo "   2. Complete Auth0 login"
    echo "   3. Run this script again"
    echo ""
    echo "🌐 Opening login page..."
    if command -v xdg-open > /dev/null; then
        xdg-open "http://localhost:8000/auth/login"
    elif command -v open > /dev/null; then
        open "http://localhost:8000/auth/login"
    else
        echo "   Please manually open: http://localhost:8000/auth/login"
    fi
else
    echo "   You are authenticated!"
    
    echo -e "\n🔗 Starting Google OAuth flow..."
    OAUTH_RESPONSE=$(curl -s -c cookies.txt -b cookies.txt \
      -X POST \
      -H "Content-Type: application/json" \
      "http://localhost:8000/oauth/google/authorize")
    
    echo "$OAUTH_RESPONSE" | jq .
    
    # Extract and display auth URL
    AUTH_URL=$(echo "$OAUTH_RESPONSE" | jq -r '.auth_url // empty')
    if [ ! -z "$AUTH_URL" ]; then
        echo -e "\n🌐 Complete OAuth by opening this URL:"
        echo "$AUTH_URL"
        echo ""
        echo " Opening OAuth page..."
        if command -v xdg-open > /dev/null; then
            xdg-open "$AUTH_URL"
        elif command -v open > /dev/null; then
            open "$AUTH_URL"
        else
            echo "   Please manually open the URL above"
        fi
    fi
fi

# Cleanup
rm -f cookies.txt

echo -e "\n💡 After completing OAuth, check your session:"
echo "   curl -s http://localhost:8000/oauth/session"