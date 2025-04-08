# Railway Deployment Guide for Local Web Insights Canada

This guide outlines the steps to deploy the Local Web Insights Canada project on Railway.

## Prerequisites

- [Railway CLI](https://docs.railway.app/develop/cli) installed: `npm i -g @railway/cli`
- Railway account (sign up at [railway.app](https://railway.app/))
- Git repository connected to Railway
- Access to environment variables
- **Note**: Free plan has limited resources. You may need to upgrade or remove existing projects.

## Services Architecture

The Local Web Insights Canada project consists of the following services:

1. **Scraper Service**: The main service that scrapes business data and runs website audits
2. **Analysis Service**: Processes and analyzes the scraped data
3. **Redis Service**: Used for queuing jobs between the services
4. **Web App**: The frontend application (optional for backend-only deployment)

## Deployment Options

### Option 1: Automated Setup (Recommended)

Use the provided setup script to deploy with configuration files:

```bash
# Make the script executable
chmod +x scripts/deploy-railway.sh

# Run the setup script
./scripts/deploy-railway.sh
```

The script will guide you through:
- Creating a new Railway project or connecting to an existing one
- Deploying your application using railway.toml configuration
- Providing instructions for setting up environment variables

### Option 2: Manual Setup

If you prefer to set up the project manually:

1. Login to Railway CLI:
   ```bash
   railway login
   ```

2. Create a new project:
   ```bash
   railway init
   ```

3. Deploy your application:
   ```bash
   railway up
   ```

4. Set environment variables in the Railway dashboard:
   - `NODE_ENV`: "production"
   - `LOG_LEVEL`: "info"
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase key
   - `GOOGLE_MAPS_API_KEYS`: Your Google Maps API keys
   - `GCS_BUCKET_NAME`: Your GCS bucket name
   - `GCS_CREDENTIALS`: Your GCS credentials JSON
   - `MADEWITH_API_KEY`: Your MadeWith API key

## Configuration Files

The project includes the following Railway configuration files:

- **railway.json**: Root configuration file
- **railway.toml**: Main configuration that defines the deployment settings

## Resource Limitations

Railway's free plan has resource limitations that may prevent you from deploying all services. You may need to:

1. Upgrade to a paid plan
2. Delete unused projects/services to free up resources
3. Optimize your application to require fewer resources

## Troubleshooting

If you encounter errors during deployment:

1. Check the build logs in the Railway dashboard
2. Ensure all required environment variables are set
3. Verify your configuration files are correctly formatted

To view your project in the dashboard:
```bash
railway open
```

## Environment Variables

The following environment variables are required:

- `NODE_ENV`: Set to "production"
- `LOG_LEVEL`: Logging level (info, error, debug)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_KEY`: Supabase service key
- `GOOGLE_MAPS_API_KEYS`: Comma-separated API keys
- `GCS_BUCKET_NAME`: Google Cloud Storage bucket name
- `GCS_CREDENTIALS`: Google Cloud Service account JSON (as string)
- `MADEWITH_API_KEY`: MadeWith API key for technology detection 