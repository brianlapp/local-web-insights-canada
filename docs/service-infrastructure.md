# Service Infrastructure

## Overview
The scraper system consists of several microservices that work together to collect and process business data:

```
┌─ API Gateway (Next.js API Routes)
│
├─ Business Discovery Service
│  ├─ Google Places Scraper
│  ├─ Yelp Scraper (planned)
│  └─ Yellow Pages Scraper (planned)
│
├─ Website Audit Service
│  ├─ Lighthouse Runner
│  ├─ Screenshot Capture
│  └─ Tech Stack Detector
│
├─ Job Processing
│  ├─ Bull Queue Manager
│  ├─ Redis Cache
│  └─ Error Handler
│
└─ Storage Services
   ├─ Supabase Database
   └─ Google Cloud Storage
```

## Service Components

### 1. API Gateway
- Next.js API routes for admin panel interaction
- Authentication middleware
- Request validation
- Rate limiting
- Error handling

### 2. Business Discovery Service
- Grid-based location system
- Multi-source data collection
- Deduplication logic
- Data normalization
- Queue management

### 3. Website Audit Service
- Lighthouse integration
- Screenshot capture
- Technology detection
- Score calculation
- Recommendation generation

### 4. Job Processing
- Distributed job queues
- Priority management
- Retry logic
- Progress tracking
- Error recovery

### 5. Storage Services
- Database operations
- File storage management
- Caching layer
- Backup system

## Infrastructure Requirements

### Hardware Requirements
- CPU: 4 cores minimum
- RAM: 8GB minimum
- Storage: 100GB SSD minimum
- Network: High bandwidth, low latency

### Software Requirements
- Node.js 18+
- Redis 6+
- Docker & Docker Compose
- Chrome/Chromium (for Lighthouse)
- Puppeteer dependencies

### External Services
- Supabase
- Google Cloud Storage
- Google Places API
- Yelp API (planned)
- "Made With" API

## Deployment Architecture

### Development Environment
```bash
docker-compose.yml
├─ api-gateway
├─ business-discovery
├─ website-audit
├─ redis
└─ chrome-runner
```

### Production Environment
- Containerized services
- Load balancing
- Auto-scaling
- Health monitoring
- Error tracking

## Configuration

### Environment Variables
```env
# API Keys
GOOGLE_MAPS_API_KEY=
YELP_API_KEY=
MADEWITH_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

# Storage
GCS_BUCKET_NAME=
GCS_CREDENTIALS=

# Redis
REDIS_URL=

# Service Config
NODE_ENV=
PORT=
LOG_LEVEL=
```

### Rate Limiting
- Google Places: 600 requests/minute
- Lighthouse: 100 audits/hour
- Screenshot capture: 200/hour
- API endpoints: 1000 requests/minute

## Monitoring & Logging

### Metrics
- Job success/failure rates
- Processing times
- API response times
- Error rates
- Resource usage

### Logging
- Structured JSON logs
- Error tracking
- Audit trails
- Performance metrics

### Alerts
- Service downtime
- Error thresholds
- Queue backlogs
- Rate limit warnings

## Scaling Strategy

### Horizontal Scaling
- Multiple scraper instances
- Load-balanced audit runners
- Distributed job processing

### Vertical Scaling
- CPU optimization
- Memory management
- Storage expansion
- Network capacity

## Error Handling

### Recovery Procedures
1. Job failure recovery
2. API error handling
3. Rate limit management
4. Data consistency checks

### Backup Systems
1. Database backups
2. File storage redundancy
3. Service failover
4. Queue persistence

## Security

### Access Control
- API authentication
- Service-to-service auth
- Rate limiting
- IP restrictions

### Data Protection
- Encryption at rest
- Secure transmission
- Access logging
- Regular audits 