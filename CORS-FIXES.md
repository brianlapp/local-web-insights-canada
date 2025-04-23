# CORS Configuration Fixes

## Issue
The frontend was experiencing CORS errors when trying to access the API from a different domain:

```
Access to fetch at 'https://local-web-insights-canada-production.up.railway.app/api/health?t=1744822671485' 
from origin 'https://e55484c1-8897-447e-adf9-c06d2f9ee0f3.lovableproject.com' 
has been blocked by CORS policy
```

## Changes Made

### 1. Enhanced CORS Middleware
- Replaced the previous CORS implementation with a more robust version
- Added explicit setHeader calls instead of using header method
- Added Access-Control-Max-Age header to cache preflight responses
- Positioned CORS middleware before any other middleware
- Removed duplicate CORS middleware that was causing confusion

### 2. Improved OPTIONS Response
- Changed response code for OPTIONS requests to 204 (No Content)
- Added more detailed logging for OPTIONS requests to help diagnose issues

### 3. Added CORS Test Endpoint
- Created a `/cors-test` endpoint that returns detailed information
- Shows both request and response headers
- Helps diagnose any remaining CORS issues

## Testing the CORS Configuration

1. **Basic CORS Test**
   ```
   curl -v https://local-web-insights-canada-production.up.railway.app/cors-test
   ```

2. **Simulated CORS Request**
   ```
   curl -v -H "Origin: https://e55484c1-8897-447e-adf9-c06d2f9ee0f3.lovableproject.com" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type, Authorization" \
        -X OPTIONS \
        https://local-web-insights-canada-production.up.railway.app/api/health
   ```

3. **From the Frontend**
   - Open your frontend application
   - Check browser console for any CORS-related errors
   - Try accessing the `/cors-test` endpoint first
   - Then test actual API endpoints

## CORS Best Practices

For production:
1. Limit the CORS origins to specific domains rather than using '*'
2. Only expose necessary HTTP methods 
3. Be specific about which headers can be sent

To further restrict CORS for production, modify the middleware like this:
```javascript
// Production-ready CORS configuration
app.use((req, res, next) => {
  // Allow only specific origins
  const allowedOrigins = [
    'https://e55484c1-8897-447e-adf9-c06d2f9ee0f3.lovableproject.com',
    'https://localwebaudit.ca'
  ];
  
  const origin = req.get('Origin');
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Other CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});
```
