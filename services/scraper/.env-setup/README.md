# Local Web Insights - Environment Setup Guide

This directory contains environment file templates for all services in the Local Web Insights platform. Follow this guide to set up your environment.

## Prerequisites

Before you begin, make sure you have:

1. **Google Cloud Platform Account** with:
   - Google Places API enabled
   - One or more API keys with appropriate quotas
   - Billing set up for the project

2. **Supabase Account** with:
   - A new or existing project
   - Service key (admin privileges)
   - Anon key (for client applications)

3. **Redis** installed locally or accessible instance for production

## Setup Instructions

### 1. Create Environment Files

For each service, copy the template to create a `.env` file:

```bash
# For the scraper service
cp scraper.env ../services/scraper/.env

# For the API service
cp api.env ../services/api/.env

# For the analysis service
cp analysis.env ../services/analysis/.env
```

### 2. Configure API Keys

Edit each `.env` file to add your actual API keys and credentials:

#### Google Places API

For the scraper service, you have two options:

- **Single API Key**: Set `GOOGLE_MAPS_API_KEY=your_actual_api_key`
- **Multiple API Keys**: Set `GOOGLE_MAPS_API_KEYS=key1:1000,key2:1000` (recommended for production)

#### Supabase

For all services, add your Supabase credentials:

- `SUPABASE_URL`: Your project URL (e.g., `https://abcdefg.supabase.co`)
- `SUPABASE_SERVICE_KEY`: Your service key for admin operations
- `SUPABASE_ANON_KEY`: Your anon key (API service only)

### 3. Internal Service Communication

For secure communication between services, generate and use consistent API keys:

```bash
# Generate a random key
openssl rand -base64 32

# Use the same key in all services for consistency
```

### 4. Redis Configuration

Make sure Redis is running and accessible. For local development:

```bash
# Install Redis (MacOS)
brew install redis
brew services start redis

# Verify Redis is running
redis-cli ping
```

Update the `REDIS_URL` in each service if needed.

### 5. Test Configuration

Verify your environment setup by starting each service:

```bash
# Start the scraper service
cd ../scraper
npm run dev

# In another terminal, start the API service
cd ../api
npm run dev

# In another terminal, start the analysis service
cd ../analysis
npm run dev
```

## API Key Quotas and Limits

### Google Places API

- **Search Nearby API**: $32 per 1,000 requests
- **Details API**: $17 per 1,000 requests
- **Free monthly credit**: $200 (approximately 6,250 Nearby searches)

Configure `PLACES_API_MAX_REQUESTS_PER_MINUTE` accordingly to stay within your quota.

## Security Best Practices

1. **Never commit `.env` files to version control**
2. **Never expose service keys in client-side code**
3. **Rotate API keys periodically**
4. **Use different API keys for development and production**
5. **Monitor API usage to prevent unexpected billing**

## Troubleshooting

If you encounter issues:

1. **API Key Not Working**: Verify the API is enabled in the Google Cloud Console
2. **Redis Connection Error**: Ensure Redis is running (`redis-cli ping`)
3. **Supabase Connection Error**: Check your project URL and keys

For more help, refer to the full documentation or contact support. 