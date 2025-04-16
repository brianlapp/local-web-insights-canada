# API Routes Debugging Guide

## Available API Endpoints

### Root Endpoints
- `GET /health` - Basic health check
- `GET /super-debug` - Enhanced debugging info
- `POST /start` - Direct start endpoint for testing
- `POST /direct-start` - Alternative direct start endpoint
- `GET /api-test` - Simple API test endpoint
- `GET /debug-routes` - List available routes

### API Endpoints
- `GET /api/health` - API health check
- `GET /api/health-detailed` - Detailed health check
- `GET /api/test-minimal` - Simple API test
- `GET /api/test-places-api` - Test Google Places API
- `POST /api/test-start` - Test start scraper
- `GET /api/start` - GET info about scraper endpoint
- `POST /api/start` - Start scraper job
- `POST /api/audit` - Start website audit

## Testing Steps

1. **Check Basic Health**
   ```
   curl https://local-web-insights-canada-production.up.railway.app/health
   ```

2. **Check Super Debug**
   ```
   curl https://local-web-insights-canada-production.up.railway.app/super-debug
   ```

3. **Test Direct Start Endpoint**
   ```
   curl -X POST https://local-web-insights-canada-production.up.railway.app/start \
     -H "Content-Type: application/json" \
     -d '{"location":"Ottawa","jobId":"test-123"}'
   ```

4. **Test API Start Endpoint**
   ```
   curl -X POST https://local-web-insights-canada-production.up.railway.app/api/start \
     -H "Content-Type: application/json" \
     -d '{"location":"Toronto","jobId":"test-456"}'
   ```

5. **Check API Available Routes**
   ```
   curl https://local-web-insights-canada-production.up.railway.app/debug-routes
   ```

## Common Issues

1. **404 Not Found**: The requested endpoint doesn't exist. Check the URL and make sure it matches one of the available endpoints.

2. **500 Internal Server Error**: Something went wrong on the server side. Check the logs for more details.

3. **503 Service Unavailable**: The service is temporarily unavailable, possibly due to maintenance or capacity issues.

## Troubleshooting

1. **Check Railway Logs**
   - Look for any error messages or warnings
   - Check for environment variable issues

2. **Verify Service Health**
   - Use the `/health` and `/super-debug` endpoints
   - Check if Redis and Queues are properly initialized

3. **Test Direct Routes**
   - If API routes fail, try direct routes at the root
   - Compare responses between different endpoints
