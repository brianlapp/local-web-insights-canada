# Technical Context: LocalWebsiteAudit.ca Admin Panel

## Implementation Examples
Key implementation examples are available in:
- `memory-bank/google-grid-scrape-example.md`: Example implementation of the Google Places grid-based scraper
- `docs/complete-lighthouse-audit-example.js`: Example implementation of the website audit service
- `docs/admin-ui-components.txt`: Example UI components for the scraper control panel

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
- Node.js scraper services
- Bull for job queue management
- Redis for caching and job state
- Docker for containerization

### APIs and Services
- Google Places API for business discovery
- Google Lighthouse API for website auditing
- "Made With" API for tech stack detection
- Puppeteer for screenshot capture
- Yelp Business API (planned)
- Yellow Pages API (planned)

### Development Tools
- Vite for development and building
- ESLint and Prettier for code quality
- TypeScript for type safety
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

3. Data Storage
   - Supabase tables
   - Job history tracking
   - Error logging
   - Audit records
   - Raw data storage

## Development Setup

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Git
- Supabase CLI (optional)

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
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
```

## Technical Constraints

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- No IE11 support required

### Performance
- First contentful paint < 2s
- Time to interactive < 3s
- Bundle size < 500KB (main)

### Security
- Supabase RLS policies
- Protected admin routes
- Secure file uploads
- XSS prevention

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

### Development Dependencies
- @types/react
- @types/node
- typescript
- tailwindcss
- postcss
- autoprefixer
- vitest
- @testing-library/react
- @playwright/test

## Build & Deployment

### Build Process
1. TypeScript compilation
2. Vite bundling
3. Asset optimization
4. Environment variable injection

### Deployment
- Hosted on Lovable
- Automatic deployments
- Environment configuration
- Build caching 

## Security Considerations
- API key protection
- Rate limit implementation
- Access control
- Data validation
- Error handling 