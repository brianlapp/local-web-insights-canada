#!/bin/bash

# Installation script for the API service
echo "🚀 Setting up Local Web Insights API Service..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install dev dependencies for TypeScript types
echo "🔧 Installing TypeScript type definitions..."
npm install -D @types/express @types/compression @types/cors @types/morgan @types/jsonwebtoken @types/express-validator axios @types/axios

# Create env file if it doesn't exist
if [ ! -f .env ]; then
  echo "📝 Creating .env file from example..."
  cp .env.example .env
  echo "⚠️  Please update the .env file with your actual values."
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Generate secure environment values
echo "🔐 Generating secure environment values..."
node scripts/generate_env_values.js

# Check for existing database tables
echo "🗄️  Checking for existing database tables..."
node scripts/check_tables.js

# Build the project
echo "🔨 Building the project..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update any remaining configuration in your .env file"
echo "2. Apply any missing database migrations (if shown above)"
echo "3. Start the development server with: npm run dev"
echo "4. Or start the production server with: npm start" 