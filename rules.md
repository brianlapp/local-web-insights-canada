# LocalWebsiteAudit.ca Project Rules

## Project Structure
- `/src` - Main source code directory
  - `/assets` - Static files (images, icons)
  - `/components` - Reusable UI components
  - `/features` - Domain-specific logic
  - `/hooks` - Global reusable hooks
  - `/lib` - API clients and utilities
  - `/pages` - Route-level components
  - `/routes` - React Router definitions
  - `/styles` - Tailwind and global CSS
  - `/types` - TypeScript types/interfaces

## Testing Framework
- Vitest + React Testing Library for unit and integration tests
- Test files should be co-located with components
- Follow AAA pattern (Arrange, Act, Assert)

## API Integration
- Use TanStack React Query for all data fetching
- API endpoints defined in `/src/features/*/api.ts`
- Implement proper error handling and loading states
- Use TypeScript interfaces for API responses

## Context Documents
- `/docs` - Project documentation
  - Technical specifications
  - API documentation
  - Component documentation
  - Setup guides

## Coding Style Guidelines
- Follow SOLID principles
- Use TypeScript strict mode
- Implement proper error boundaries
- Follow React best practices and hooks rules
- Use functional components with hooks
- Implement proper prop typing
- Use proper naming conventions:
  - PascalCase for components
  - camelCase for functions and variables
  - kebab-case for file names
  - UPPER_CASE for constants

## Component Guidelines
- Use shadcn/ui components as base
- Extend components through composition
- Implement responsive design using Tailwind
- Follow accessibility best practices
- Use Lucide icons consistently

## State Management
- Use React Query for server state
- Use React Context for global UI state
- Implement proper loading and error states
- Use optimistic updates where appropriate

## Performance Guidelines
- Implement code splitting
- Use proper image optimization
- Implement proper caching strategies
- Monitor bundle size
- Use proper lazy loading

## Git Workflow
- Use feature branches
- Follow conventional commits
- Implement proper PR reviews
- Keep commits atomic and focused

## Documentation Requirements
- Document all components
- Document API endpoints
- Document environment variables
- Keep README up to date
- Document breaking changes

## Security Guidelines
- Never commit sensitive data
- Use environment variables for secrets
- Implement proper input validation
- Follow security best practices
- Regular security audits

## Deployment Rules
- Netlify for hosting
- Implement proper CI/CD
- Use proper environment variables
- Monitor deployment health
- Implement proper rollback procedures