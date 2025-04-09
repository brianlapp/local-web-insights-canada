# Technical Context: LocalWebsiteAudit.ca Admin Panel

## Implementation Examples
Key implementation examples are available in:
- `memory-bank/google-grid-scrape-example.md`: Example implementation of the Google Places grid-based scraper
- `docs/complete-lighthouse-audit-example.js`: Example implementation of the website audit service
- `docs/admin-ui-components.txt`: Example UI components for the scraper control panel
- `services/analysis/IMPLEMENTATION.md`: Summary of the data analysis service implementation
- `services/scraper/railway.toml`: Example Railway deployment configuration

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
- Node.js scraper services (ESM)
- Node.js analysis services
- Bull for job queue management
- Express for API endpoints
- Redis for caching and job state
- Docker for containerization
- Railway for deployment

### APIs and Services
- Google Places API for business discovery
- Google Lighthouse API for website auditing
- "Made With" API for tech stack detection
- Puppeteer for screenshot capture
- Turf.js for geographic calculations
- Yelp Business API (planned)
- Yellow Pages API (planned)

### Development Tools
- Vite for development and building
- ESLint and Prettier for code quality
- TypeScript with ESM support
- Git for version control
- GitHub Actions for CI/CD

## Architecture Components

### Admin Panel
- Protected routes with Supabase Auth
- React components for UI
- TanStack Query for data management
- Form validation with Zod
- Toast notifications for feedback

### Scraper Engine
- Distributed job processing with Bull
- Geographic grid system for data collection
- Rate limiting and request queuing
- Error handling and retry logic
- Modular service architecture

### Analysis Engine
- Data aggregation modules
- Report generation pipeline
- Scheduled processing system
- Geographic analysis with Turf.js
- Business comparison metrics
- RESTful API endpoints with Express

### Data Pipeline
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
- Railway CLI

### Environment Variables
```env
# Frontend
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Scraper Service
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REDIS_URL=redis://localhost:6379
PORT=3000

# Analysis Service
SUPABASE_URL=your_supabase_url
SUPABASE_API_KEY=your_supabase_service_key
REDIS_URL=redis://localhost:6379
PORT=3001
```

### Railway Configuration
```toml
# Example railway.toml structure
[build]
builder = "NIXPACKS"
buildCommand = "cd services/scraper && npm install && npm run build"

[deploy]
startCommand = "cd services/scraper && node dist/index.js"
healthcheckPath = "/health"
restartPolicyType = "ON_FAILURE"

[variables]
NODE_ENV = "development"
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2020",
    "esModuleInterop": true
  }
}
```

### Package.json Configuration
```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Run database migrations for analysis service
cd services/analysis
npm run migrations
```

## Service Architecture

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

### Security
- Supabase RLS policies
- Protected admin routes
- Secure file uploads
- XSS prevention
- API authentication

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support

## Dependencies

### Core Dependencies
- @supabase/supabase-js
- @tanstack/react-query
- react-router-dom
- @hookform/resolvers
- zod
- lucide-react
- date-fns
- bull
- express
- node-cron
- @turf/turf
- lodash

### Development Dependencies
- @types/react
- @types/node
- @types/express
- typescript
- tailwindcss
- postcss
- autoprefixer
- vitest
- @testing-library/react
- @playwright/test
- jest
- ts-jest

## Build & Deployment

### Build Process
1. TypeScript compilation
2. Vite bundling for frontend
3. Asset optimization
4. Environment variable injection

### Deployment
- Frontend hosted on Lovable
- Services deployed via Docker
- Automatic deployments
- Environment configuration
- Build caching 

## Security Considerations
- API key protection
- Rate limit implementation
- Access control
- Data validation
- Error handling 
- Service authentication 

## New Section: Deployment Configuration

### Railway Deployment
1. Configuration Hierarchy
   - railway.toml is the source of truth
   - UI settings are overridden by TOML
   - Root directory requires careful handling
   - Build detection occurs before TOML application

2. Module System
   - ESM throughout scraper service
   - .js extensions required in imports
   - TypeScript configured for ESM
   - CommonJS compatibility considerations

3. Build Process
   - Nixpacks builder
   - TypeScript compilation
   - Directory context management
   - Environment variable handling

4. Monitoring
   - Health check endpoints
   - Restart policies
   - Log access
   - Error tracking