# Railway Deployment Troubleshooting Guide

If you're encountering issues deploying to Railway, follow these troubleshooting steps:

## Check the Dashboard

The Railway dashboard is the best place to troubleshoot deployment issues:

1. Open your Railway dashboard:
   ```
   railway open
   ```

2. Navigate to your service
3. Click on the failed deployment to see detailed logs

## Common Issues and Solutions

### 1. Build Failure

If your build is failing, check for:

- **Missing dependencies**: Ensure all dependencies are properly listed in package.json
- **Environment variables**: Make sure all required environment variables are set
- **Build commands**: Verify the build command in railway.toml is correct

Solution: Update railway.toml with the correct configuration and push again.

### 2. Resource Limits

Free plan has limits on the number of services and resources.

Solution:
- Delete unused projects/services
- Upgrade to a paid plan
- Optimize your application to use fewer resources

### 3. Module Import Issues

ESM vs CommonJS issues are common with TypeScript projects.

Solution:
- Check your tsconfig.json settings
- Make sure "type": "module" is set correctly in package.json if using ESM

### 4. Missing Services

If your application requires Redis or other services, they need to be added.

Solution:
- Add required services through the Railway dashboard
- Use the variables format `${{Redis.REDIS_URL}}` to reference them

## Manual Deployment Steps

If automatic deployment via railway.toml isn't working, try these manual steps:

1. Create a new service in the Railway dashboard
2. Push your code using Railway CLI:
   ```
   cd services/scraper
   railway up
   ```
3. Set environment variables in the dashboard
4. Configure service settings manually in the dashboard

## Check Service Configuration

In the Railway dashboard:

1. Go to your service's settings
2. Verify the build settings:
   - Root directory: services/scraper
   - Build command: npm install && npm run build
   - Start command: node dist/index.js
3. Set the environment variables manually
4. Add any required service dependencies

## Contact Railway Support

If all else fails, Railway has helpful support channels:

1. Join the [Railway Discord](https://discord.gg/railway)
2. Check the [Railway documentation](https://docs.railway.app/)
3. Submit a support ticket through the Railway dashboard 