# Technical Context: Local Web Insights Canada

## Implementation Examples
Key implementation examples are available in:
- `memory-bank/google-grid-scrape-example.md`: Example implementation of the Google Places grid-based scraper
- `docs/complete-lighthouse-audit-example.js`: Example implementation of the website audit service
- `docs/admin-ui-components.txt`: Example UI components for the scraper control panel
- `services/analysis/IMPLEMENTATION.md`: Summary of the data analysis service implementation

## Technology Stack

### Frontend
- React 18 with TypeScript
- React Router v6 for routing
- TanStack Query for data fetching and caching
- Tailwind CSS for styling
- shadcn/ui component library
- React Hook Form for form management
- Zod for schema validation

### Backend
- Supabase for database and authentication
- Node.js for API service (Express)
- Node.js scraper services
- Node.js analysis services
- Bull for job queue management
- Redis for caching and job state
- Docker for containerization

### APIs and Services
- Google Places API for business discovery
- Google Lighthouse API for website auditing
- "Made With" API for tech stack detection
- Puppeteer for screenshot capture
- Turf.js for geographic calculations
- Yelp Business API (planned)
- Yellow Pages API (planned)

### Development Tools
- Vite for frontend development and building
- ESLint and Prettier for code quality
- TypeScript for type safety
- Git for version control
- GitHub Actions for CI/CD
- Jest for testing

## Architecture Components

### API Service
- Express/Node.js RESTful API
- TypeScript for type safety
- Supabase integration
- JWT authentication
- Role-based access control
- Error handling middleware
- Logging system
- Database utilities
- CORS configuration
- Validation middleware
- Business controllers and services
- Analytics endpoints
- Advanced search and filtering

### Admin Panel
- Protected routes with Supabase Auth
- React components for UI
- TanStack Query for data management
- Form validation with Zod
- Toast notifications for feedback

### Scraper Engine (Priority Focus)
- Distributed job processing with Bull
- Geographic grid system for data collection
- Rate limiting and request queuing
- Error handling and retry logic
- Modular service architecture
- Multi-source business discovery
- Business website detection
- Website audit process
- Data normalization and storage

### Analysis Engine
- Data aggregation modules
- Report generation pipeline
- Scheduled processing system
- Geographic analysis with Turf.js
- Business comparison metrics
- RESTful API endpoints with Express

## Data Pipeline
1. Business Discovery
   - Grid-based API queries
   - Data normalization
   - Deduplication logic
   - Website URL extraction

2. Website Auditing
   - Lighthouse performance testing
   - Mobile responsiveness checks
   - Technology detection
   - Screenshot generation
   - Score calculation

3. Data Analysis
   - Geographic insights aggregation
   - Category performance analysis
   - Business comparison metrics
   - Report generation
   - Visualization configuration

4. Data Storage
   - Supabase tables
   - Job history tracking
   - Error logging
   - Audit records
   - Analysis results
   - Report storage

## Development Setup

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Git
- Redis
- Supabase CLI (optional)

### Environment Variables
```env
# API Service
PORT=3000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug

# Frontend
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Scraper Service
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REDIS_URL=redis://localhost:6379
PORT=3002

# Analysis Service
SUPABASE_URL=your_supabase_url
SUPABASE_API_KEY=your_supabase_service_key
REDIS_URL=redis://localhost:6379
PORT=3001
```

### Project Structure
```
/
├── .cursor/
│   └── memory_bank/          # Project memory bank
├── services/
│   ├── api/                  # API service (Express)
│   │   ├── src/
│   │   │   ├── controllers/  # Request handlers
│   │   │   ├── middleware/   # Express middleware
│   │   │   ├── models/       # Data models
│   │   │   ├── routes/       # API routes
│   │   │   ├── services/     # Business logic
│   │   │   ├── types/        # TypeScript type definitions
│   │   │   └── utils/        # Utility functions
│   │   ├── tests/            # API tests
│   │   └── package.json      # API dependencies
│   │
│   ├── scraper/              # Scraper service
│   │   ├── src/
│   │   │   ├── queues/       # Bull queue definitions
│   │   │   ├── processors/   # Queue job processors
│   │   │   ├── routes/       # Scraper API routes
│   │   │   └── utils/        # Utility functions
│   │   └── package.json      # Scraper dependencies
│   │
│   └── analysis/             # Analysis service
│       ├── src/
│       │   ├── aggregators/  # Data aggregation modules
│       │   ├── reports/      # Report generation
│       │   ├── processors/   # Analysis job processors
│       │   └── utils/        # Utility functions
│       └── package.json      # Analysis dependencies
│
├── app/                      # Frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client services
│   │   └── utils/            # Utility functions
│   └── package.json          # Frontend dependencies
│
└── docker-compose.yml        # Docker configuration
```

### Local Development
```bash
# Install API service dependencies
cd services/api
npm install

# Start API service
npm run dev

# Install and start other services similarly
cd ../scraper
npm install
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Service Architecture

### API Service
- `services/api/src/controllers/`: Request handlers
- `services/api/src/middleware/`: Express middleware
- `services/api/src/routes/`: API route definitions
- `services/api/src/services/`: Business logic implementation
- `services/api/src/utils/`: Helper utilities

### Scraper Service
- `services/scraper/src/queues/processors/gridSearch.ts`: Business discovery
- `services/scraper/src/queues/processors/websiteAudit.ts`: Website auditing
- `services/scraper/src/routes/jobs.ts`: Job management API

### Analysis Service
- `services/analysis/src/aggregators/`: Data aggregation modules
- `services/analysis/src/reports/`: Report generation system
- `services/analysis/src/processors/`: Job processing for analysis
- `services/analysis/src/utils/`: Database and utility functions
- `services/analysis/src/models/`: Type definitions and interfaces

## Technical Constraints

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- No IE11 support required

### Performance
- First contentful paint < 2s
- Time to interactive < 3s
- Bundle size < 500KB (main)
- Analysis job processing < 30s
- Report generation < 10s
- API response time < 200ms

### Security
- Supabase RLS policies
- Protected admin routes
- Secure file uploads
- XSS prevention
- API authentication
- JWT token validation

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support

## Dependencies

### API Service Dependencies
- express
- @supabase/supabase-js
- jsonwebtoken
- cors
- morgan
- winston
- joi
- dotenv
- express-validator
- compression
- helmet

### Scraper Dependencies
- bull
- @googlemaps/google-maps-services-js
- puppeteer
- lighthouse
- axios
- cheerio
- node-cron

### Analysis Dependencies
- bull
- @turf/turf
- d3-array
- csv-stringify
- lodash
- node-cron

### Frontend Dependencies
- react
- react-dom
- react-router-dom
- @tanstack/react-query
- @supabase/supabase-js
- zod
- @hookform/resolvers
- tailwindcss
- shadcn/ui
- recharts
- lucide-react
- date-fns

## Current Implementation Status

### API Service (In Progress)
- ✅ Core infrastructure
- ✅ Authentication & security
- ✅ Error handling & logging
- ✅ Database integration
- ✅ Business management endpoints
- ✅ Business analytics endpoints
- ✅ Advanced search and filtering
- 🚧 Testing infrastructure

### Scraper Engine (Priority Focus)
- 🚧 Google Places grid scraper
- 🚧 Business data processing
- ⏳ Website audit implementation
- ⏳ Job management system

### Analysis Service
- 🚧 Data aggregation system
- 🚧 Report generation
- ⏳ Scheduled processing

### Admin Panel
- ⏳ Authentication implementation
- ⏳ Business management UI
- ⏳ Scraper control UI
- ⏳ Analytics dashboard 