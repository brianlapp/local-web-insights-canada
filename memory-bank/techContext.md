# Technical Context: LocalWebsiteAudit.ca Admin Panel

## Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui components

### Backend
- Supabase
  - Authentication
  - Database
  - Storage
  - Real-time subscriptions

### State Management
- React Query
- React Context
- Zustand (optional)

### Form Management
- React Hook Form
- Zod validation

### Testing
- Vitest
- Testing Library
- Playwright (e2e)

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