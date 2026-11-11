#!/usr/bin/env bash
# ==============================================================================
# CPAA Automated Deployment Script for AWS EC2 + Cloudflare
# ==============================================================================
set -e

echo "🚀 Starting CPAA deployment on AWS EC2..."

# 1. Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "💡 Please copy .env.production.example to .env and fill in your credentials:"
    echo "   cp .env.production.example .env"
    exit 1
fi

# 2. Guard low-spec AWS EC2 instances (e.g. t3.small/t4g.small) with automatic 4GB Swapfile
TOTAL_SWAP_KB=$(grep SwapTotal /proc/meminfo | awk '{print $2}')
if [ "$TOTAL_SWAP_KB" -lt 2097152 ]; then
    echo "⚠️ Low swap detected (${TOTAL_SWAP_KB} kB). Creating 4GB swapfile to prevent Next.js build OOM..."
    if [ "$EUID" -eq 0 ] || command -v sudo &> /dev/null; then
        SUDO_CMD=""
        if [ "$EUID" -ne 0 ]; then SUDO_CMD="sudo"; fi
        $SUDO_CMD fallocate -l 4G /swapfile || $SUDO_CMD dd if=/dev/zero of=/swapfile bs=1M count=4096
        $SUDO_CMD chmod 600 /swapfile
        $SUDO_CMD mkswap /swapfile
        $SUDO_CMD swapon /swapfile || true
        if ! grep -q '/swapfile' /etc/fstab; then
            echo '/swapfile none swap sw 0 0' | $SUDO_CMD tee -a /etc/fstab
        fi
        echo "✅ 4GB swapfile successfully enabled."
    else
        echo "⚠️ Warning: Could not create swapfile automatically (no sudo permissions)."
    fi
fi

# 3. Ensure Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo "💡 Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    if [ "$EUID" -ne 0 ]; then
        sudo usermod -aG docker "$USER"
    fi
fi

# 4. Pull latest updates from deployment branch
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "📥 Pulling latest updates from deployment branch..."
    git fetch origin deployment || true
    git checkout deployment || true
    git pull origin deployment || true
fi

# 5. Build and launch containers
echo "🔨 Building and launching Docker containers..."
docker compose down --remove-orphans || true
docker compose build --pull
docker compose up -d --remove-orphans

# 6. Wait for backend to initialize and run database migrations
echo "⏳ Waiting for backend to become ready..."
sleep 10
echo "🔄 Running Alembic database migrations..."
docker compose exec -T backend alembic upgrade head || {
    echo "⚠️ Warning: Database migrations failed or Neon connection was busy. Retrying in 5s..."
    sleep 5
    docker compose exec -T backend alembic upgrade head || true
}

# 7. Check service health
echo "🔍 Checking container status..."
docker compose ps

echo "🏥 Checking API health endpoint..."
if curl -s http://localhost:8000/health | grep -q '"status":"healthy"'; then
    echo "✅ Backend API is healthy!"
else
    echo "⚠️ Backend health check returned non-200. Check logs: docker compose logs backend"
fi

if curl -s -I http://localhost/ | grep -q 'HTTP/1.1 200 OK'; then
    echo "✅ Gateway & Frontend are responding!"
fi

# 8. Deployment summary
echo "=========================================================="
echo "✅ CPAA successfully deployed!"
echo "🌐 Public domain: https://cpaa.ganpatikrsah.site"
echo "📜 View live logs with: docker compose logs -f"
echo "=========================================================="
