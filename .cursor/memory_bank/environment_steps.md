# Environment Setup Plan

## Setup Steps

1. **Initialize Environment Files**
   - Create `.env` file in `services/api/` directory
   - Base it on the `.env.example` template
   - Update values for your local environment

2. **Supabase Configuration**
   - Create/access a Supabase project
   - Get the project URL: `https://[your-project-id].supabase.co`
   - Get the API key from the Supabase dashboard
   - Get the service role key for administrative operations

3. **Security Configuration**
   - Generate a secure JWT secret 
   - Set appropriate JWT expiration time
   - Configure allowed CORS origins

4. **Install Type Definitions**
   - Run `cd services/api && npm install`
   - Install TypeScript type definitions to resolve linting errors
   - Use the provided setup script: `services/api/setup.sh`

5. **Configure Database Tables**
   - Ensure all required tables exist in Supabase
   - Check for proper relationships between tables
   - Verify table columns match expected fields in the API service

## Environment Variables Reference

| Variable | Description | Example Value |
|----------|-------------|---------------|
| PORT | Server port number | 3002 |
| NODE_ENV | Environment mode | development |
| API_VERSION | API version | 1.0.0 |
| LOG_LEVEL | Logging detail level | debug |
| SUPABASE_URL | Supabase project URL | https://abc123.supabase.co |
| SUPABASE_KEY | Supabase API key | eyJa... |
| SUPABASE_SERVICE_ROLE_KEY | Supabase admin key | eyJh... |
| JWT_SECRET | Secret for JWT tokens | complex-secret-key-here |
| JWT_EXPIRES_IN | JWT expiration time | 24h |
| API_KEY_HEADER | API key header name | X-API-Key |
| CORS_ORIGIN | Allowed origins | http://localhost:3000 |

## Local Development Tips

1. Use debug log level during development
2. Set longer JWT expiration for ease of testing
3. Include your development frontend in CORS_ORIGIN
4. Use environment-specific .env files (.env.development, .env.test) for different scenarios
5. Never commit .env files to the repository 