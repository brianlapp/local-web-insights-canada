#!/bin/bash

# Deployment script for the API service
echo "🚀 Deploying Local Web Insights API Service..."

# Ensure we're in the project root
cd "$(dirname "$0")/.."

# Check environment
if [ -z "$NODE_ENV" ]; then
  echo "⚠️  NODE_ENV is not set. Defaulting to 'production'."
  export NODE_ENV=production
fi

echo "🌍 Deploying to $NODE_ENV environment"

# Load environment variables
if [ -f ".env.$NODE_ENV" ]; then
  echo "📝 Loading environment from .env.$NODE_ENV"
  export $(grep -v '^#' ".env.$NODE_ENV" | xargs)
elif [ -f ".env" ]; then
  echo "📝 Loading environment from .env"
  export $(grep -v '^#' .env | xargs)
else
  echo "❌ No .env file found. Aborting deployment."
  exit 1
fi

# Install production dependencies
echo "📦 Installing production dependencies..."
npm ci --production

# Build the project
echo "🔨 Building the project..."
npm run build

# Test database connection
echo "🔄 Testing database connection..."
node scripts/test_supabase_connection.js

# Start or restart the service
if command -v pm2 &> /dev/null; then
  echo "🔄 Restarting service using PM2..."
  pm2 restart local-web-insights-api 2>/dev/null || pm2 start dist/server.js --name local-web-insights-api
else
  echo "⚠️  PM2 not found. Starting service using Node..."
  echo "   For production, consider using PM2 or another process manager."
  node dist/server.js
fi

echo "✅ Deployment complete!" 