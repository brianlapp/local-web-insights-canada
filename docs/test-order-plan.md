# Test Implementation Order & AI Prompts

## Implementation Order Logic

I've organized the tests in a dependency-minimizing order, starting with:
1. Basic components and utilities (building blocks)
2. Routing infrastructure
3. API/Supabase integration
4. Main features that build on the above components
5. Edge cases, accessibility, and performance tests

## Test Implementation Plan

### Phase 1: Component Testing
These can be developed in isolation with minimal dependencies.

#### 1. Basic UI Components

```
As a Frontend Test Engineer, specializing in React Testing Library with Vitest and shadcn/ui, it is your goal to write tests for core button component states and accessibility. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, and ensure proper accessibility attributes are tested. Focus specifically on testing different button states (default, hover, disabled), proper aria-labels, and keyboard navigation focus states.
```

#### 2. Form Input Validation

```
As a Frontend Test Engineer, specializing in React Testing Library with Vitest and shadcn/ui form components, it is your goal to write tests for form input validation behavior. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, creating reusable test utilities for validation scenarios, and ensure all validation states are properly tested including invalid data feedback and validation message clearing.
```

#### 3. Audit Score Component

```
As a Frontend Test Engineer, specializing in React Testing Library with Vitest and Tailwind CSS, it is your goal to write tests for the Audit Score Component that displays different visual states based on score thresholds. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, isolate component testing from business logic, and test all color/icon variations at the threshold boundaries (>80%, 50-80%, <50%).
```

### Phase 2: Routing & Navigation

#### 4. Basic Routing Tests

```
As a Frontend Test Engineer, specializing in React Router and Vitest, it is your goal to write tests for basic application routing functionality. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, mock router dependencies appropriately, and test navigation between main sections, URL updates, and active navigation highlighting.
```

#### 5. Deep Linking Tests

```
As a Frontend Test Engineer, specializing in React Router and Vitest, it is your goal to write tests for direct deep linking to specific pages. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, properly mock data fetching dependencies, and test that directly accessing routes like "/petition/business-xyz" loads the correct content and triggers appropriate data fetching.
```

#### 6. 404 Page Tests

```
As a Frontend Test Engineer, specializing in React Router and Vitest, it is your goal to write tests for the application's 404 page behavior. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, create isolated test scenarios, and verify that non-existent routes display the 404 page with appropriate navigation options back to valid sections.
```

### Phase 3: Data Integration

#### 7. API Data Fetching with TanStack Query

```
As a Frontend Test Engineer, specializing in TanStack React Query and Vitest, it is your goal to write tests for API data fetching behavior using React Query hooks. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, properly mock API responses, and test loading states, successful data caching, and UI updates following data fetching.
```

#### 8. Form Submission with useMutation

```
As a Frontend Test Engineer, specializing in TanStack React Query and Vitest, it is your goal to write tests for form submission behavior using React Query's useMutation hook. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, create isolated test environments, and verify that form submissions include all data, trigger optimistic UI updates, and properly invalidate/update caches on success.
```

#### 9. Supabase Authentication Integration

```
As a Frontend Test Engineer, specializing in Supabase Auth and Vitest, it is your goal to write tests for the Supabase authentication flow. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, properly mock Supabase Auth responses, and test authenticated/unauthenticated redirects, protected content access, and token storage/refresh behavior.
```

#### 10. Supabase Real-time Subscription

```
As a Frontend Test Engineer, specializing in Supabase real-time subscriptions and Vitest, it is your goal to write tests for real-time data update behavior. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, create appropriate mocks for subscription events, and test that new petition signatures appear without page refresh and subscriptions are properly cleaned up on unmount.
```

#### 11. Supabase Database Queries with RLS

```
As a Frontend Test Engineer, specializing in Supabase and Row Level Security testing with Vitest, it is your goal to write tests for database queries respecting RLS policies. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, create isolated test environments for different user permissions, and verify that users only see data they're authorized to access.
```

#### 12. Supabase File Storage Operations

```
As a Frontend Test Engineer, specializing in Supabase Storage and Vitest, it is your goal to write tests for file upload and storage operations. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, mock storage APIs appropriately, and test file uploads, permission settings, public URL generation, and UI updates following uploads.
```

### Phase 4: Core Features

#### 13. Website Audit Feature (Happy Path)

```
As a Frontend Test Engineer, specializing in React, TanStack Query, and Supabase with Vitest, it is your goal to write tests for the Website Audit Feature's happy path. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, properly mock data dependencies, and test loading skeletons, API calls with correct parameters, and complete data display with all required audit sections.
```

#### 14. Website Audit Feature (Error Paths)

```
As a Frontend Test Engineer, specializing in React, TanStack Query error handling, and Vitest, it is your goal to write tests for the Website Audit Feature's error paths. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, create comprehensive error scenario mocks, and test behavior for non-existent businesses and database failures, verifying error messages and fallback UI components.
```

#### 15. Petition Feature (Happy Path)

```
As a Frontend Test Engineer, specializing in React forms, TanStack Query, and Supabase with Vitest, it is your goal to write tests for the Petition Feature's happy path. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, create isolated test environments, and verify form field rendering, successful submission behavior, counter increments, and supporter list updates.
```

#### 16. Petition Feature (Error Paths)

```
As a Frontend Test Engineer, specializing in React form validation and error handling with Vitest, it is your goal to write tests for the Petition Feature's error paths. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, create comprehensive validation test scenarios, and verify validation errors for empty/invalid inputs and appropriate error handling for database failures.
```

#### 17. Signup Feature (Happy Paths)

```
As a Frontend Test Engineer, specializing in React forms, email/SMS validation, and Vitest, it is your goal to write tests for the Signup Feature's happy paths for both email and SMS options. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, properly mock confirmation APIs, and test form rendering, successful submissions for both contact methods, and appropriate confirmations.
```

#### 18. Signup Feature (Error Paths)

```
As a Frontend Test Engineer, specializing in React form validation and API error handling with Vitest, it is your goal to write tests for the Signup Feature's error paths. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, create comprehensive test cases for validation failures, and verify error behavior for invalid emails/phone numbers and API submission failures.
```

#### 19. Tools Directory (Happy Paths)

```
As a Frontend Test Engineer, specializing in React, component filtering/searching, and Vitest, it is your goal to write tests for the SEO Tools Directory feature's happy paths. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, create appropriate test fixtures, and verify tool listing displays, category filtering, search functionality, and embedded tool interactions.
```

#### 20. Tools Directory (Error Paths)

```
As a Frontend Test Engineer, specializing in React error handling for external resources with Vitest, it is your goal to write tests for the SEO Tools Directory's error paths. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, create isolated test scenarios, and verify appropriate error messages, fallback instructions, and retry functionality when external tool resources fail to load.
```

### Phase 5: Edge Cases, Accessibility, and Performance

#### 21. Network Resilience Tests

```
As a Frontend Test Engineer, specializing in React network state handling and offline capabilities with Vitest, it is your goal to write tests for application network resilience. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, properly mock network conditions, and test offline notifications, cached data access, reconnection behaviors, and graceful timeout handling.
```

#### 22. Screen Reader Accessibility Tests

```
As an Accessibility Test Engineer, specializing in React accessibility testing with axe-core and Vitest, it is your goal to write tests for screen reader compatibility. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, create comprehensive test suites, and verify proper aria attributes, heading hierarchy, image alternatives, and logical focus order throughout the application.
```

#### 23. Keyboard Navigation Tests

```
As an Accessibility Test Engineer, specializing in React keyboard navigation testing with Testing Library and Vitest, it is your goal to write tests for keyboard accessibility. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, create systematic test procedures, and verify element focusability, visible focus indicators, absence of keyboard traps, and proper shortcut functionality.
```

#### 24. Page Load Performance Tests

```
As a Performance Test Engineer, specializing in React performance testing with Lighthouse CI and Vitest, it is your goal to write tests for initial page load performance. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, establish clear performance baselines, and verify core content visibility timing, First Contentful Paint metrics, and Total Blocking Time within specified thresholds.
```

#### 25. Navigation Performance Tests

```
As a Performance Test Engineer, specializing in React Router and client-side navigation performance with Vitest, it is your goal to write tests for subsequent navigation performance. You will write the test first, then execute 'npm run test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, create appropriate performance measurement utilities, and verify instantaneous page transitions, network request optimization, and appropriate data caching behavior.
```
