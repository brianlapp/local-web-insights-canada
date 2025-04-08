#!/bin/bash

# Simplified Railway deployment script using config files
echo "Deploying to Railway using config files"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Railway CLI is not installed. Please install it first:"
    echo "npm i -g @railway/cli"
    exit 1
fi

# Check if user is logged in to Railway
railway whoami || {
    echo "Please login to Railway first:"
    echo "railway login"
    exit 1
}

# Link to an existing project or create a new one
echo "Creating or connecting to Railway project..."
railway init

echo "Deploying services using railway.toml configuration..."
railway up

echo "You can view your project using: railway open"

# Note: Environment variables need to be set in the Railway dashboard
echo "IMPORTANT: Make sure to set these environment variables in the Railway dashboard:"
echo "- SUPABASE_URL"
echo "- SUPABASE_SERVICE_KEY"
echo "- GOOGLE_MAPS_API_KEYS"
echo "- GCS_BUCKET_NAME"
echo "- GCS_CREDENTIALS"
echo "- MADEWITH_API_KEY"
echo "- NODE_ENV=production"
echo "- LOG_LEVEL=info" 