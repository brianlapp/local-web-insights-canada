#!/bin/bash

# Script to extract the scraper service into its own repository
echo "Extracting scraper service into its own repository..."

# Create temp directory
TEMP_DIR=~/temp-scraper-repo
echo "Creating directory: $TEMP_DIR"
mkdir -p $TEMP_DIR

# Copy scraper files
echo "Copying scraper files..."
cp -r ~/Documents/GitHub/local-web-insights-canada/services/scraper/* $TEMP_DIR/

# Initialize git repository
echo "Initializing git repository..."
cd $TEMP_DIR
git init

# Create proper .gitignore
echo "Creating .gitignore..."
cat > .gitignore << EOL
node_modules/
dist/
.env
*.log
EOL

# Update railway.toml
echo "Creating railway.toml..."
cat > railway.toml << EOL
# Railway configuration for scraper service

[build]
builder = "nixpacks"
buildCommand = "npm install"

[deploy]
startCommand = "npm run dev"
restartPolicyType = "ON_FAILURE"

[variables]
NODE_ENV = "production"
PORT = "8080"
# REDIS_URL will be set via the Railway dashboard
EOL

# Update README.md
echo "Creating README.md..."
cat > README.md << EOL
# Local Website Audit Scraper Service

This service is responsible for scraping business information and performing website audits for the Local Website Audit project.

## Environment Variables

The following environment variables are required:

- \`REDIS_URL\`: URL for Redis connection
- \`NODE_ENV\`: Set to "production" for deployment
- \`PORT\`: The port number (default: 8080)
- \`LOG_LEVEL\`: Logging level (info, error, debug)
- \`SUPABASE_URL\`: Supabase project URL
- \`SUPABASE_SERVICE_KEY\`: Supabase service key
- \`GOOGLE_MAPS_API_KEYS\`: Comma-separated API keys
- \`GCS_BUCKET_NAME\`: Google Cloud Storage bucket name
- \`GCS_CREDENTIALS\`: Google Cloud Service account JSON
- \`MADEWITH_API_KEY\`: MadeWith API key

## Deployment

This service is deployed on Railway. After creating a new service in Railway, connect this repository and set the required environment variables.
EOL

# Add files to git
echo "Adding files to git..."
git add .
git commit -m "Initial commit of scraper service"

echo ""
echo "====================================================="
echo "Repository created at: $TEMP_DIR"
echo ""
echo "Next steps:"
echo "1. Create a new GitHub repository for the scraper service"
echo "2. Run the following commands to push the code:"
echo ""
echo "   cd $TEMP_DIR"
echo "   git remote add origin YOUR_GITHUB_REPO_URL"
echo "   git push -u origin main"
echo ""
echo "3. Create a new service in Railway connected to this GitHub repository"
echo "4. Set the required environment variables in Railway"
echo "=====================================================" 