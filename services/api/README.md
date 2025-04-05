# Local Web Insights Canada - API Service

This is the API and Integration layer service for the Local Web Insights Canada platform.

## Features

- RESTful API endpoints for businesses, analyses, and webhooks
- JWT and API key authentication
- Integration with Supabase for database operations
- Error handling and validation middleware
- Logging and monitoring
- Webhook delivery and subscription management

## Technology Stack

- Node.js and Express
- TypeScript
- Supabase (PostgreSQL)
- Express Validator
- Winston for logging
- JWT for authentication
- Axios for HTTP requests

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Supabase account (for database)

### Setup

1. Clone the repository
2. Navigate to the API service directory:

```bash
cd services/api
```

3. Run the setup script:

```bash
./setup.sh
```

This script will:
- Install dependencies
- Create a `.env` file (if it doesn't exist)
- Generate secure values for environment variables
- Check for existing tables in your Supabase database
- Create necessary directories
- Build the project

4. Connect to your existing Supabase project:
   - Update your `.env` file with your Supabase URL and keys
   - Find these values in your Supabase dashboard > Settings > API
   - You need the Project URL, anon public key, and service_role key

### Working with Existing Supabase Project

If you already have a Supabase project with authentication and a dashboard:

1. The API service can integrate with your existing tables
2. Run `npm run check:tables` to verify which tables exist and which need to be created
3. For missing tables, apply only the necessary migrations from the `migrations` directory
4. Adjust controllers as needed to match your existing table structure

### Database Migrations

The API service requires several database tables. You can create them by:

1. Going to the SQL Editor in your Supabase dashboard
2. Loading and executing the SQL files from the `migrations` directory in sequence:
   - `01_create_tables.sql` - Creates all required tables
   - `02_create_admin_user.sql` - Creates an admin user and API key

### Environment Variables

The following environment variables need to be configured:

```
# Server Configuration
PORT=3002                        # Server port
NODE_ENV=development             # Environment (development, production, test)
API_VERSION=1.0.0                # API version

# Supabase Configuration
SUPABASE_URL=your_supabase_url   # Supabase project URL
SUPABASE_KEY=your_supabase_key   # Supabase API key
SUPABASE_SERVICE_ROLE_KEY=...    # Supabase service role key

# Authentication
JWT_SECRET=your_secret_key       # Secret for JWT token generation
JWT_EXPIRES_IN=24h               # Token expiration time
API_KEY_HEADER=X-API-Key         # API key header name

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001  # Allowed origins
```

You can generate secure values for JWT_SECRET using the provided script:

```bash
node scripts/generate_env_values.js
```

### Running the Service

For development:

```bash
npm run dev
```

For production:

```bash
npm run build
npm start
```

## API Documentation

### Main Endpoints

- `/api/businesses` - Business management
- `/api/analyses` - Analysis management
- `/api/webhooks` - Webhook subscription management

### Authentication

Most endpoints require authentication using either:

1. JWT token in the Authorization header:
   ```
   Authorization: Bearer <token>
   ```

2. API key in the x-api-key header (for external integrations):
   ```
   x-api-key: <api-key>
   ```

## Development

### Folder Structure

```
src/
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/          # Route definitions
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

### Testing

Run tests with:

```bash
npm test
```

## Webhooks

The API service supports both outgoing webhooks (to notify external systems of events) and incoming webhooks (to receive events from external systems).

### Outgoing Webhooks

Subscribers can register to receive the following events:

- `business.created` - When a new business is added
- `business.updated` - When a business is updated
- `analysis.completed` - When an analysis is completed
- `scraper.completed` - When a scraper job is completed
- And more...

### Incoming Webhooks

External systems can trigger events by using the external webhook endpoint with an API key.

## License

[Proprietary] 