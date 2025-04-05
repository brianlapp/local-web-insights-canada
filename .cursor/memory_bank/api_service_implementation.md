# API Service Implementation

## Overview
The API service acts as the central integration layer for the Local Web Insights Canada platform, providing RESTful endpoints for managing businesses, analyses, and webhooks. It integrates with Supabase for data storage and retrieval.

## Architecture
The service follows a modular architecture with dedicated components:

- **Controllers**: Handle business logic and interact with the database
- **Routes**: Define API endpoints and map them to controllers
- **Middleware**: Provide authentication, validation, and error handling
- **Utils**: Offer database connections, logging, and common functions

## Key Features

### Authentication
- JWT-based authentication for user sessions
- API key authentication for external services
- Role-based access control (admin, standard, readonly)

### Business Management
- Retrieve businesses with filtering and pagination
- Get detailed business information
- Fetch business insights and website audit data
- Update business information

### Analysis Management
- Create and manage analyses
- Track analysis status and results
- Re-run analyses with modified parameters
- Retrieve analysis results

### Webhook System
- Register webhook subscriptions for events
- Deliver events to subscribed endpoints
- Test webhook delivery
- Manage webhook logs
- Handle incoming webhooks from external systems

## Technical Implementation

### Routes
- `/api/businesses/*` - Business management endpoints
- `/api/analyses/*` - Analysis management endpoints
- `/api/webhooks/*` - Webhook subscription management

### Database Integration
- Supabase client for PostgreSQL database access
- Transaction support for complex operations
- Pagination, filtering, and sorting utilities

### Error Handling
- Centralized error handling middleware
- Custom ApiError class with operational error support
- Consistent error response format

### Validation
- Request validation using express-validator
- Custom validation for pagination and sorting parameters
- Type checking and parameter sanitization

## Dependencies
- Express for HTTP server
- Supabase for database operations
- Winston for logging
- JWT for authentication
- Express-validator for input validation
- Axios for HTTP requests 