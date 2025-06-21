#!/bin/bash

REPO="dev-tools"
echo "$HOME/$REPO"
cd "$HOME/$REPO"
sudo su

APP_NAME="opengig"
WEB_DIR="./web"
API_DIR="./server"


echo "📥 Pulling latest code..."
git pull

echo "🔨 Pulling latest env..."
./pull-env.sh

echo "🔨 Building Docker images..."
docker build -t ${APP_NAME}-web:latest $WEB_DIR || { echo "❌ Web build failed"; exit 1; }
docker build -t ${APP_NAME}-api:latest $API_DIR || { echo "❌ API build failed"; exit 1; }

echo "🚀 Deploying stack..."
docker stack deploy -c docker-compose.yml ${APP_NAME}

echo "♻️ Forcing service update with start-first strategy..."
docker service update --force ${APP_NAME}_web
docker service update --force ${APP_NAME}_api

echo "✅ Deployment Complete! (Minimal/Zero Downtime)"
docker system prune -a -f
