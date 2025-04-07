# Local Web Insights - Scraper Service

This service is responsible for discovering business data and performing website audits. It consists of two main components:

1. **Business Scraper Engine**: Discovers businesses via Google Places API using a grid-based geographic search system
2. **Website Audit Service**: Analyzes business websites using Lighthouse and other tools

## Features

- **Grid-based Geographic Search**: Optimized algorithm for efficient area coverage
- **API Key Rotation**: Support for multiple Google Maps API keys with quota management
- **Rate Limiting**: Built-in throttling to respect API rate limits
- **Job Queue System**: Background processing using Bull and Redis
- **Website Auditing**: Performance, SEO, accessibility, and best practices scoring
- **REST API**: Endpoints for triggering and monitoring jobs

## Getting Started

### Prerequisites

- Node.js 18 or later
- Redis server
- Google Maps API key(s)
- Supabase account

### Installation

1. Clone the repository
2. Navigate to the scraper service directory:
   ```
   cd services/scraper
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Copy the example environment file:
   ```
   cp .env.example .env
   ```
5. Update the `.env` file with your credentials

### Running the Service

For development:
```
npm run dev
```

For production:
```
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Job Status
```
GET /api/status
```

### API Key Status
```
GET /api/api-keys
```

### Generate Grid
```
POST /api/generate-grid
```
Example request body:
```json
{
  "bounds": {
    "northeast": { "lat": 43.72, "lng": -79.35 },
    "southwest": { "lat": 43.65, "lng": -79.42 }
  }
}
```

### Search Grid
```
POST /api/search
```
Example request body:
```json
{
  "gridId": "grid123",
  "gridName": "Downtown Toronto",
  "bounds": {
    "northeast": { "lat": 43.72, "lng": -79.35 },
    "southwest": { "lat": 43.65, "lng": -79.42 }
  },
  "category": "restaurant",
  "scraperRunId": "run123"
}
```

### Search Point
```
POST /api/search-point
```
Example request body:
```json
{
  "lat": 43.65,
  "lng": -79.38,
  "radius": 1000,
  "category": "restaurant",
  "scraperRunId": "run123"
}
```

### Website Audit
```
POST /api/audit
```
Example request body:
```json
{
  "businessId": "business123",
  "url": "https://example.com"
}
```

### Job Status
```
GET /api/jobs/:jobId
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| REDIS_URL | Redis server URL | redis://localhost:6379 |
| GOOGLE_MAPS_API_KEY | Single API key | - |
| GOOGLE_MAPS_API_KEYS | Multiple API keys with quotas (key1:quota1,key2:quota2) | - |
| SUPABASE_URL | Supabase URL | - |
| SUPABASE_SERVICE_KEY | Supabase service key | - |
| LOG_LEVEL | Logging level | info |

## Architecture

### Business Scraper Engine

The scraper engine uses a grid-based approach to efficiently cover geographic areas:

1. A large area is divided into optimal sub-grids
2. Each sub-grid is processed independently
3. Results are deduplicated and stored in the database
4. Website URLs are extracted and queued for auditing

### Website Audit Service

The audit service analyzes business websites:

1. Uses Lighthouse to analyze performance, SEO, accessibility, and best practices
2. Captures screenshots in both mobile and desktop views
3. Extracts technologies used on the website
4. Generates scores and improvement recommendations

## Development

### Running Tests

```
npm test
```

### Code Style

```
npm run lint
```

## Docker

Build the image:
```bash
docker build -t local-web-insights-scraper .
```

Run with Docker Compose:
```bash
docker-compose up
``` 