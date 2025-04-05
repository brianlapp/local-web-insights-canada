# Environment Setup

## Environment Variables

The API service requires the following environment variables to function properly:

### Server Configuration
- `PORT` - The port number for the server (default: 3000)
- `NODE_ENV` - Environment mode (development, production, test)
- `API_VERSION` - Version number for the API

### Logging
- `LOG_LEVEL` - Logging level (error, warn, info, http, debug)

### Supabase Configuration
- `SUPABASE_URL` - URL of the Supabase project
- `SUPABASE_KEY` - Supabase API key for client operations
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for privileged operations

### Authentication
- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_EXPIRES_IN` - JWT token expiration time
- `API_KEY_HEADER` - Custom header name for API key authentication

### CORS Configuration
- `CORS_ORIGIN` - Comma-separated list of allowed origins

## Development Dependencies

To resolve TypeScript linter errors, the following dependencies need to be installed:

```bash
npm install -D @types/express @types/compression @types/cors @types/morgan @types/jsonwebtoken @types/express-validator @types/axios
```

## Database Schema Requirements

The API service expects the following tables in the Supabase database:

1. `users` - User accounts
2. `businesses` - Business listings
3. `business_insights` - Business analysis insights
4. `business_metrics` - Historical metrics for businesses
5. `website_audits` - Website audit results
6. `website_screenshots` - Screenshots from website audits
7. `analyses` - Analysis configurations
8. `analysis_businesses` - Many-to-many relationship between analyses and businesses
9. `analysis_queue` - Queue of analyses to be processed
10. `analysis_results` - Results of completed analyses
11. `analysis_metadata` - Metadata about analyses
12. `webhooks` - Webhook subscriptions
13. `webhook_logs` - Webhook delivery logs
14. `external_webhooks` - External webhook events
15. `api_keys` - API keys for external access 