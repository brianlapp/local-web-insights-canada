# Docker Setup for Local Web Insights Canada

## Overview

The project uses Docker and Docker Compose to containerize its services, enabling consistent deployment across different environments. This document outlines the Docker configuration, encountered issues, and solutions.

## Docker Components

### 1. Services

The `docker-compose.yml` file defines the following services:

- **Redis**: Message queue and caching service
  - Uses the official Redis image
  - Persists data to a named volume
  - Exposes port 6379

- **Scraper**: Business data collection service
  - Uses a pre-built Puppeteer Docker image that includes Chrome
  - Runs in development mode for now
  - Connects to Redis and Supabase

### 2. Environment Files

- **`services/.env`**: Main environment variables file for Docker Compose
  - Contains service-level environment variables
  - Includes Redis configuration

- **`services/scraper/.env`**: Scraper-specific environment variables
  - Contains Google Maps API keys
  - Includes Supabase credentials
  - Contains service configuration

### 3. Configuration

The Docker environment is configured through:

1. **docker-compose.yml**:
   ```yaml
   version: '3'
   services:
     redis:
       image: redis:6-alpine
       ports:
         - "6379:6379"
       volumes:
         - redis-data:/data
     
     scraper:
       platform: linux/amd64
       build: ./scraper
       depends_on:
         - redis
       env_file:
         - ./scraper/.env
       environment:
         - NODE_ENV=development
         - REDIS_URL=redis://redis:6379
   
   volumes:
     redis-data:
   ```

2. **Scraper Dockerfile**:
   ```dockerfile
   # Use a pre-built image that already includes Chrome/Chromium
   FROM ghcr.io/puppeteer/puppeteer:latest
   
   # Set working directory
   WORKDIR /usr/src/app
   
   # By default, the puppeteer image runs as non-root user 'pptruser'
   # We need to make sure this user has permissions for our files
   COPY --chown=pptruser:pptruser package*.json ./
   
   # Install dependencies
   RUN npm install
   
   # Copy source code with correct ownership
   COPY --chown=pptruser:pptruser . .
   
   # Skip build for now to run in development mode
   # RUN npm run build
   
   # Expose port
   EXPOSE 3000
   
   # Use development mode to avoid needing the build
   CMD ["npm", "run", "dev"]
   ```

## Environment Variable Fix

### Issue
The scraper service couldn't find the `GOOGLE_MAPS_API_KEYS` environment variable when running in Docker.

### Solution
1. Created a proper `services/.env` file with all required environment variables
2. Updated `docker-compose.yml` to use the correct env file:
   ```yaml
   scraper:
     build: ./scraper
     depends_on:
       - redis
     env_file:
       - ./scraper/.env
   ```

## Architecture Issue with Chrome

### Problem
When building the scraper service on an M1/M2 Mac (ARM architecture), Chrome installation failed because the Docker image expected an AMD64 architecture.

### Solution Implemented
Used the official Puppeteer Docker image that comes with Chrome pre-installed and supports ARM architecture:
```dockerfile
# Use a pre-built image that already includes Chrome/Chromium
FROM ghcr.io/puppeteer/puppeteer:latest
```

Additional changes to make it work:
1. Added proper user permissions with `--chown=pptruser:pptruser` since the Puppeteer image uses a non-root user
2. Modified the command to run in development mode to avoid TypeScript build issues
3. Added `platform: linux/amd64` in docker-compose.yml to support ARM architecture

### Benefits of this approach:
- Eliminates the need to manually install Chrome
- Works consistently across different architectures
- Reduces build time
- Includes all necessary browser dependencies

## Lighthouse Integration Fix

### Problem
Lighthouse was failing to run due to module import issues between ESM and CommonJS modules, resulting in the error "lighthouse is not a function".

### Solution Implemented
Created a compatibility wrapper (`lighthouseWrapper.ts`) that handles different module systems:
```typescript
export async function runLighthouse(url: string, options: any): Promise<RunnerResult> {
  // Attempt to load Lighthouse using different approaches
  try {
    // First, try dynamic import (ESM)
    const lighthouseModule = await import('lighthouse');
    if (typeof lighthouseModule.default === 'function') {
      return lighthouseModule.default(url, options);
    }
    
    // Fall back to CommonJS require
    const lighthouse = require('lighthouse');
    return lighthouse(url, options);
  } catch (error) {
    // Handle errors and provide detailed logging
    logger.error(`Failed to load Lighthouse: ${error}`);
    throw error;
  }
}
```

Additional improvements:
1. Enhanced error logging for better debugging
2. Proper type definitions for TypeScript
3. Support for both module systems in one wrapper

## Current Status

- ✅ Redis container is running successfully
- ✅ Scraper service is running successfully in development mode
- ✅ Environment variables are configured correctly
- ✅ Communication between services is working
- ✅ Job queuing and processing is functioning correctly
- ✅ Lighthouse integration is working with module compatibility wrapper
- ⚠️ Supabase storage configuration needed for screenshots

## Development vs. Production

Currently, the scraper service is running in development mode (`npm run dev`), which:
- Uses ts-node-dev to run TypeScript code directly
- Avoids having to build the code
- Has fast feedback during development
- Has potential performance limitations

For a production setup, we would need to:
1. Fix TypeScript build issues related to module imports
2. Modify the Dockerfile to build TypeScript code
3. Run the built code with Node.js in production mode
4. Implement proper error handling and logging

## Docker Commands

### Starting all services:
```bash
docker-compose up -d
```

### Starting only Redis:
```bash
docker-compose up redis -d
```

### Starting the scraper service:
```bash
docker-compose up scraper -d
```

### Viewing logs:
```bash
docker-compose logs scraper --tail 50
```

### Checking container status:
```bash
docker-compose ps
```

## Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Buildx for Multi-platform Images](https://docs.docker.com/buildx/working-with-buildx/)
- [Running Chrome Headless in Docker](https://developers.google.com/web/updates/2017/04/headless-chrome) 