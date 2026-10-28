#!/usr/bin/env bash
# ==============================================================================
# CPAA Automated Deployment Script for Azure VM
# ==============================================================================
set -e

echo "🚀 Starting CPAA deployment on Azure VM..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "💡 Please copy .env.production.example to .env and fill in your credentials:"
    echo "   cp .env.production.example .env"
    exit 1
fi

# Ensure Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "📥 Pulling latest updates from deployment branch..."
git fetch origin deployment
git checkout deployment
git pull origin deployment

echo "🔨 Building and launching containers..."
docker compose down --remove-orphans || true
docker compose build --pull
docker compose up -d --remove-orphans

echo "⏳ Waiting for services to become healthy..."
sleep 10

echo "🔍 Service Status:"
docker compose ps

echo "✅ CPAA successfully deployed!"
echo "🌐 Public domain: https://cpaa.ganpatikrsah.site"
echo "📜 View live logs with: docker compose logs -f"
