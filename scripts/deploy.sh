#!/bin/bash

set -e

echo "🚀 Starting Todo App deployment to Cloudflare..."

# Check if logged in to Cloudflare
echo "Checking Cloudflare authentication..."
if ! wrangler whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to Cloudflare. Please run: wrangler login"
    exit 1
fi

# Build the frontend
echo "📦 Building React Router app..."
npm run build

# Deploy Workers API
echo "☁️  Deploying API to Cloudflare Workers..."
npm run deploy:worker

# Get the Worker URL
WORKER_URL=$(wrangler deployments list | grep -m1 "https://" | awk '{print $2}')
echo "Worker deployed at: $WORKER_URL"

# Update environment variable for Pages
echo "VITE_API_URL=$WORKER_URL" > .env.production

# Rebuild frontend with production API URL
echo "📦 Rebuilding frontend with production API URL..."
npm run build

# Deploy to Cloudflare Pages
echo "📄 Deploying frontend to Cloudflare Pages..."
npm run deploy:pages

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Update the database_id in wrangler.toml with your D1 database ID"
echo "2. Set JWT_SECRET environment variable in Cloudflare Workers dashboard"
echo "3. Configure custom domain if needed"
echo ""
echo "Your app should be available at:"
echo "- API: $WORKER_URL"
echo "- Frontend: Check Cloudflare Pages dashboard for URL"