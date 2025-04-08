#!/bin/bash

# Setup script for Railway project
echo "Setting up Railway project for Local Web Insights Canada"
echo "This script will help you configure the Railway deployment"

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

echo "Creating new Railway project..."
railway init

echo "Adding Redis service..."
railway plugin add redis

echo "Creating environment variables..."
echo "Please enter your environment variables when prompted"

# Prompt for required environment variables
read -p "SUPABASE_URL: " SUPABASE_URL
railway variable set SUPABASE_URL="$SUPABASE_URL"

read -p "SUPABASE_SERVICE_KEY: " SUPABASE_SERVICE_KEY
railway variable set SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY"

read -p "GOOGLE_MAPS_API_KEYS (comma-separated): " GOOGLE_MAPS_API_KEYS
railway variable set GOOGLE_MAPS_API_KEYS="$GOOGLE_MAPS_API_KEYS"

read -p "GCS_BUCKET_NAME: " GCS_BUCKET_NAME
railway variable set GCS_BUCKET_NAME="$GCS_BUCKET_NAME"

echo "For GCS_CREDENTIALS, you'll need to provide the JSON content of your service account credentials"
echo "Please paste the contents below (press Ctrl+D when done):"
GCS_CREDENTIALS=$(cat)
railway variable set GCS_CREDENTIALS="$GCS_CREDENTIALS"

read -p "MADEWITH_API_KEY: " MADEWITH_API_KEY
railway variable set MADEWITH_API_KEY="$MADEWITH_API_KEY"

# Set other required variables
railway variable set NODE_ENV="production"
railway variable set LOG_LEVEL="info"

echo "Environment variables set successfully!"
echo "Deploying project..."
railway up

echo "Setup complete! Your project is now deployed on Railway."
echo "You can view your project using: railway open" 