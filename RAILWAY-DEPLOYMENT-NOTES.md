# Railway Deployment Notes

## Recent Changes (April 16, 2025)

### Fixed Railway Configuration
1. **Single railway.toml file**
   - Removed railway.toml from scraper directory (backed up as railway.toml.backup)
   - Kept only the root railway.toml file
   - Simplified the configuration to match Railway's expectations

2. **Environment Variable Fixes**
   - Added GOOGLE_PLACES_API_KEY to match with GOOGLE_MAPS_API_KEYS
   - Code now checks for both variable names for compatibility

3. **API Route Improvements**
   - Better error handling in `/start` endpoint
   - Fixed route path naming to avoid conflicts
   - Added better diagnostic endpoints

## Deployment Troubleshooting

If deployment fails:

1. **Check Railway Logs**
   - Look for specific error messages in the logs
   - Verify the build and deploy processes are running

2. **Verify Environment Variables**
   - Make sure all required environment variables are set in Railway
   - Especially check GOOGLE_MAPS_API_KEYS and Redis configuration

3. **Run Health Checks**
   - After deployment, check the `/health` endpoint
   - Try the `/test-minimal` endpoint to verify basic functionality
   - Use `/test-places-api` to check Google API key

4. **Redis Connection**
   - Check if Redis connection is working using the health endpoint
   - Railway should automatically connect the Redis service

## Common Issues

1. **railway.toml location**: Railway is strict about this file - must be in the root directory
2. **Multiple railway.toml files**: Having multiple files can confuse Railway
3. **Google API Key**: Must be correctly set in environment variables
4. **Redis Connection**: May fail if URL format is incorrect

## Railway Reference
Railway looks for a railway.toml file in the root directory of your repository.
This configuration file overrides settings from the dashboard for each deployment.
