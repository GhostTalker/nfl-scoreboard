#!/bin/bash
# NFL Scoreboard - Quick Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🏈 NFL Scoreboard Deployment"
echo "=============================="
echo ""

echo "📥 Pulling latest code..."
git pull origin master

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building production bundle..."
npm run build

echo ""
echo "🔄 Restarting PM2..."
pm2 restart ecosystem.config.cjs

echo ""
echo "✅ Deployment complete!"
echo ""
pm2 list
echo ""
echo "🌐 App running at: http://10.1.0.51:3001"
