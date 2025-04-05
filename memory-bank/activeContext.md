# Active Development Context

# Current Task
Implementing a standardized, consistent testing approach for the scraper service.

# Mode
PLAN mode only unless ACT is typed.

# Testing Focus
We want fast, reliable tests on **critical components** that power the scraper service:

- `gridSearch.ts` → grid logic, API calls, job creation
- `websiteAudit.ts` → Lighthouse logic, screenshot handling, Supabase updates
- `jobsController.ts` → key API endpoints for job creation/status
- Error handling logic for Supabase and Lighthouse failures

# Testing Strategy
We've established a standardized testing approach with the following principles:

1. **Consistent Mocking Strategy**: Use Jest's automatic mocking with a `__mocks__` directory structure
2. **Single Source of Truth**: All mock implementations are defined in the `__mocks__` directory
3. **ESM Support**: Jest configuration supports ES Modules for dynamic imports (Lighthouse)
4. **Clean Separation**: No competing mock implementations between global setup and test files

## Key Mock Files:
- `__mocks__/@googlemaps/google-maps-services-js.ts` - Google Maps API mocks
- `__mocks__/@supabase/supabase-js.ts` - Supabase client mocks
- `__mocks__/lighthouse.ts` - Lighthouse module mocks

# What to skip
- Overly verbose BDD-style specs
- Full mocking boilerplate unless it's unavoidable
- UI-focused tests (admin dashboard is already manually verified)

Cursor should:
- Suggest test plans only for the above files
- Keep tests focused and fast
- Prioritize reliability and readability over exhaustive edge case coverage

## Current Focus
- Implemented the complete scraper service with business discovery and website auditing capabilities
- Service is containerized and ready for deployment
- Standardized testing approach to ensure reliable test execution

## Recent Changes
- Created the scraper service with the following components:
  - Grid-based business discovery using Google Places API
  - Website auditing with Lighthouse
  - Screenshot capture for desktop and mobile views
  - Queue-based job processing with Redis
  - REST API for job management
- Implemented TypeScript-based service architecture
- Set up Docker configuration for both the scraper and Redis services
- Configured logging and error handling
- Added comprehensive API documentation
- Standardized mocking approach for consistent, reliable tests

## Current Architecture
- Microservices:
  - Scraper Service (Node.js/TypeScript)
    - Business discovery module
    - Website audit module
    - Queue processing system
  - Redis for job queues
- Infrastructure:
  - Docker containers
  - Supabase for data storage
  - Google Places API for business discovery
  - Lighthouse for website auditing

## Next Steps
1. Implement standardized testing approach:
   - Create proper `__mocks__` directory structure
   - Implement consistent mock files for external dependencies
   - Update Jest configuration for ESM support
   - Clean up test setup and individual test files
2. Test the scraper service:
   - Unit tests for processors
   - Integration tests for API endpoints
   - Load testing for queue processing
3. Set up monitoring and alerting
4. Deploy to staging environment
5. Integrate with the main application

## Dependencies
- Node.js 18
- Redis 6
- Google Chrome (for Lighthouse)
- Google Maps API
- Supabase
- Docker

## Environment Configuration
Required environment variables:
- PORT
- NODE_ENV
- REDIS_URL
- GOOGLE_MAPS_API_KEY
- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- LOG_LEVEL

## Active Decisions
1. Scraper Architecture
   - Distributed vs. monolithic processing
   - Job queue implementation
   - Error handling strategy
   - Data storage approach

2. API Integration
   - Rate limiting strategy
   - Data source prioritization
   - Error recovery approach
   - Caching implementation

3. Infrastructure
   - Deployment architecture
   - Scaling approach
   - Monitoring solution
   - Backup strategy

4. Testing Approach
   - Standardized mocking with `__mocks__` directory
   - Jest configuration for ESM support
   - Focus on critical component testing
   - Clear separation of mock implementations

## Current Challenges
1. Technical
   - API rate limit management
   - Distributed job processing
   - Data deduplication
   - Error recovery

2. Infrastructure
   - Service scaling
   - Resource allocation
   - Monitoring setup
   - Deployment pipeline

3. Data Quality
   - Source reliability
   - Data normalization
   - Validation rules
   - Update frequency

## Recent Feedback
- Need for automated business discovery
- Importance of reliable website auditing
- Request for better geographic coverage
- Focus on data quality and freshness

## Questions to Resolve
1. Technical
   - Best approach for geographic grid system?
   - Optimal job queue configuration?
   - Error handling strategy?
   - Data storage optimization?

2. Business
   - Priority of data sources?
   - Audit frequency requirements?
   - Coverage area definition?
   - Success metrics?

3. Infrastructure
   - Resource requirements?
   - Scaling thresholds?
   - Monitoring needs?
   - Backup strategy? 