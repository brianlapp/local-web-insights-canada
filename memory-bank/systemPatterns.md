# System Patterns: LocalWebsiteAudit.ca Admin Panel

## Architecture Overview

### Frontend Architecture
```mermaid
flowchart TD
    App[App.tsx] --> Auth[AdminAuthProvider]
    Auth --> Routes[Protected Routes]
    Routes --> Layout[AdminLayout]
    Layout --> Components[Admin Components]
    Components --> Dashboard[DashboardPage]
    Components --> Business[BusinessList]
    Components --> Petitions[PetitionList]
    Components --> Settings[Settings]
```

## Key Design Patterns

### 1. Authentication Pattern
- Supabase Auth integration
- Protected route wrapper
- Session management
- Password reset flow

### 2. Layout Pattern
```mermaid
flowchart LR
    AdminLayout --> Sidebar[Navigation Sidebar]
    AdminLayout --> Content[Content Area]
    Content --> Outlet[Route Outlet]
```

### 3. Data Management
- React Query for server state
- Supabase real-time subscriptions
- Optimistic updates
- Error boundary handling

### 4. Component Architecture
- Shared UI components (shadcn/ui)
- Form management patterns
- Modal/dialog patterns
- Toast notifications

## Technical Decisions

### State Management
- React Query for server state
- React Context for auth state
- Local state for UI components

### Routing Structure
- Nested routes for admin section
- Protected route wrapper
- Dynamic route parameters

### Form Handling
- React Hook Form
- Zod validation
- File upload management

### API Integration
- Supabase client
- TypeScript types
- Error handling patterns

## Component Relationships

### Admin Layout
```mermaid
flowchart TD
    Layout[AdminLayout] --> Nav[Navigation]
    Layout --> Main[Main Content]
    Nav --> Links[Nav Links]
    Nav --> User[User Menu]
    Main --> Header[Page Header]
    Main --> Content[Page Content]
```

### Form Components
```mermaid
flowchart LR
    Form[Form Container] --> Inputs[Form Inputs]
    Form --> Validation[Validation]
    Form --> Submit[Submit Handler]
    Form --> Feedback[User Feedback]
``` 