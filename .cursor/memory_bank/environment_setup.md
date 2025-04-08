# Environment Setup

This document outlines the environment setup requirements and procedures for the Local Web Insights Canada platform.

## Required External Services

The Local Web Insights platform relies on the following external services:

### 1. Google Cloud Platform
- **Required APIs**: 
  - Places API
  - Maps JavaScript API
- **Pricing**:
  - Places API: $32 per 1,000 calls for Nearby Search, $17 per 1,000 calls for Details
  - Free monthly credit: $200 (approximately 6,250 Nearby searches)
- **Setup Steps**:
  1. Create a Google Cloud Platform account
  2. Create a new project
  3. Enable the required APIs
  4. Create API key(s) with appropriate restrictions
  5. Set up billing

### 2. Supabase
- **Features Used**:
  - PostgreSQL database
  - Storage buckets
  - Authentication (if using admin panel)
- **Setup Steps**:
  1. Create a Supabase account
  2. Create a new project
  3. Obtain the project URL, service key, and anon key

### 3. Redis
- **Usage**:
  - Job queue for scraper and analysis services
  - Rate limiting
  - Caching
- **Setup**:
  - Local development: Install Redis locally
  - Production: Use Redis Cloud or self-hosted Redis

## Environment Variables

Each service requires specific environment variables to function properly. We've created comprehensive templates and a setup script to simplify this process.

### Automated Setup (Recommended)

1. Navigate to the setup directory:
   ```bash
   cd services/scraper/.env-setup
   ```

2. Run the setup script:
   ```bash
   ./setup.sh
   ```

3. Follow the prompts to configure:
   - API keys for service communication
   - Supabase credentials
   - Google Places API keys
   - Redis connection

### Manual Setup

If you prefer to set up manually, create `.env` files for each service based on the templates:

- **Scraper Service**: `services/scraper/.env`
- **API Service**: `services/api/.env`
- **Analysis Service**: `services/analysis/.env`

## Docker Environment Setup

The project uses Docker and Docker Compose for containerization and easy deployment. Key files:

1. **docker-compose.yml**: Defines the services needed for the application
   - Redis service
   - Scraper service

2. **Environment Files**:
   - `services/.env`: Primary environment variables for Docker Compose
   - `services/scraper/.env`: Specific environment variables for the scraper service

3. **Docker Build Considerations**:
   - ARM Architecture (M1/M2 Mac): Requires special handling for Chrome installation
   - AMD64 Architecture: Standard Chrome installation works as expected

4. **Docker Commands**:
   ```bash
   # Build and start all services
   docker-compose up --build -d
   
   # Start only Redis service
   docker-compose up redis -d
   
   # Check running containers
   docker-compose ps
   ```

5. **Known Issues**:
   - Chrome installation fails on ARM architecture (M1/M2 Mac)
   - Potential fix: Use `--platform=linux/amd64` in the Dockerfile or docker-compose.yml

## Scraper Service Configuration

Key environment variables for the scraper service:

```
# Google Maps API
GOOGLE_MAPS_API_KEY=your_single_api_key
# OR
GOOGLE_MAPS_API_KEYS=key1:1000,key2:1000

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

# Redis
REDIS_URL=redis://localhost:6379
```

## API Service Configuration

Key environment variables for the API service:

```
# Security
API_SECRET=your_strong_random_secret

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_ANON_KEY=your_anon_key

# Service URLs
SCRAPER_SERVICE_URL=http://localhost:3000
ANALYSIS_SERVICE_URL=http://localhost:5000
```

## Analysis Service Configuration

Key environment variables for the analysis service:

```
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

# Redis
REDIS_URL=redis://localhost:6379

# Service URLs
SCRAPER_SERVICE_URL=http://localhost:3000
API_SERVICE_URL=http://localhost:4000
```

## Local Development Setup

1. Install Redis:
   ```bash
   # MacOS
   brew install redis
   brew services start redis

   # Ubuntu/Debian
   sudo apt update
   sudo apt install redis-server
   sudo systemctl start redis-server
   ```

2. Verify Redis is running:
   ```bash
   redis-cli ping
   # Should return PONG
   ```

3. Start the services:
   ```bash
   # Start the scraper service
   cd services/scraper
   npm install
   npm run dev

   # Start the API service
   cd ../api
   npm install
   npm run dev

   # Start the analysis service
   cd ../analysis
   npm install
   npm run dev
   ```

## API Key Management Best Practices

1. **Never commit API keys to version control**
2. **Rotate keys periodically** for security
3. **Use API key restrictions** in Google Cloud Platform:
   - HTTP referrer restrictions
   - IP address restrictions
   - API usage restrictions
4. **Monitor usage** to prevent unexpected charges
5. **Use multiple API keys** with the rotation system for higher quotas

## Staging Environment

The staging environment is available at:
- **URL**: [https://local-web-insights-canada.lovable.app/](https://local-web-insights-canada.lovable.app/)

### Staging Configuration:
- Full Supabase integration
- API services are deployed
- Used for testing before production deployment

## Troubleshooting

### Common Issues

1. **Redis Connection Error**:
   - Ensure Redis is running: `redis-cli ping`
   - Check the Redis URL in .env files

2. **Google Places API Errors**:
   - Verify the API is enabled in Google Cloud Console
   - Check for billing issues or quota limits
   - Ensure API key has correct permissions

3. **Supabase Connection Issues**:
   - Verify project URL and keys
   - Check for any IP restrictions on your project

4. **Service Communication Errors**:
   - Ensure all services are running
   - Check the service URLs in .env files
   - Verify internal API keys match across services

   - Verify internal API keys match across services 