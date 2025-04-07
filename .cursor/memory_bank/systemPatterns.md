# System Patterns: Local Web Insights Canada

## Microservices Architecture

The system follows a microservices architecture with distinct services that communicate via API calls and job queues:

```
┌─ API Service ─────────────────────┐   ┌─ Scraper Service ────────────────┐
│                                   │   │                                   │
│  ┌─ Controllers                   │   │  ┌─ Queue Processors              │
│  │  ├─ Business Controller        │◄──┼──┤  ├─ Grid Search                │
│  │  ├─ Analytics Controller       │   │  │  ├─ Website Audit              │
│  │  ├─ User Controller            │   │  │  └─ Data Processor             │
│  │  └─ Webhook Controller         │   │  │                                │
│  │                                │   │  └─ API Routes                    │
│  ├─ Services                      │   │     ├─ Job Management             │
│  │  ├─ Business Service           │   │     └─ Status Routes              │
│  │  ├─ Analytics Service          │   │                                   │
│  │  └─ User Service               │   └───────────────────────────────────┘
│  │                                │                     ▲
│  ├─ Middleware                    │                     │
│  │  ├─ Auth Middleware            │                     │
│  │  ├─ Validation Middleware      │                     │
│  │  └─ Error Middleware           │                     │
│  │                                │                     │
│  └─ Routes                        │                     │
│     ├─ Business Routes            │                     │
│     ├─ Analytics Routes           │                     │
│     └─ User Routes                │                     │
│                                   │                     │
└───────────────────────────────────┘                     │
                ▲                                         │
                │                                         │
                │                                         │
                ▼                                         │
┌─ Frontend ────────────────────────┐                     │
│                                   │                     │
│  ┌─ Admin Layout                  │                     │
│  │  ├─ Sidebar Navigation         │                     │
│  │  └─ Main Content Area          │                     │
│  │     ├─ Dashboard               │                     │
│  │     ├─ Business Management     │                     │
│  │     ├─ Scraper Control Panel   │                     │
│  │     ├─ Analytics Dashboard     │                     │
│  │     └─ User Management         │                     │
│  │                                │                     │
│  └─ Auth Wrapper                  │                     │
│                                   │                     │
└───────────────────────────────────┘                     │
                ▲                                         │
                │                                         │
                │                                         │
                ▼                                         ▼
┌─ Analysis Service ───────────────────────────────────────┐
│                                                          │
│  ┌─ Data Aggregators                                     │
│  │  ├─ Geographic Insights                               │
│  │  │  ├─ Business Density Calculator                    │
│  │  │  ├─ Performance Heatmap Generator                  │
│  │  │  └─ Regional Metrics Analyzer                      │
│  │  │                                                    │
│  │  ├─ Category Analysis                                 │
│  │  │  ├─ Industry Benchmarker                           │
│  │  │  ├─ Improvement Area Detector                      │
│  │  │  └─ Category Ranker                                │
│  │  │                                                    │
│  │  └─ Business Comparison                               │
│  │     ├─ Competitive Ranker                             │
│  │     ├─ Strength/Weakness Analyzer                     │
│  │     └─ Historical Trend Tracker                       │
│  │                                                       │
│  ├─ Report Generation                                    │
│  │  ├─ Report Builder                                    │
│  │  ├─ Chart Configuration                               │
│  │  ├─ Data Formatter                                    │
│  │  └─ Template Engine                                   │
│  │                                                       │
│  └─ Processing System                                    │
│     ├─ Job Queue                                         │
│     ├─ Scheduled Tasks                                   │
│     ├─ Progress Tracking                                 │
│     └─ Error Recovery                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Scraper Architecture (Priority Focus)

The Business Scraper Engine is the core data acquisition component:

```
┌─ Scraper Control Panel (UI)
├─── Job Management
│    ├─── Queue Control
│    ├─── Status Monitoring
│    └─── Error Handling
│
├─ Business Discovery Service
│    ├─── Geographic Grid System
│    ├─── API Integration Layer
│    │    ├─── Google Places
│    │    ├─── Yelp
│    │    └─── Yellow Pages
│    └─── Data Normalization
│
├─ Website Audit Service
│    ├─── URL Validation
│    ├─── Lighthouse Testing
│    ├─── Screenshot Capture
│    ├─── Tech Detection
│    └─── Score Calculator
│
└─ Data Pipeline
     ├─── Job Queue
     ├─── Rate Limiter
     ├─── Error Recovery
     └─── Results Processing
```

## API Service Architecture

The API Service provides the core business logic and data access:

```
┌─ API Service
├─── Controllers
│    ├─── Business Controller
│    │    ├─── CRUD Operations
│    │    ├─── Search & Filtering
│    │    └─── Analytics Integration
│    │
│    ├─── Analytics Controller
│    │    ├─── Summary Endpoint
│    │    ├─── Performance Data
│    │    ├─── Recommendations
│    │    └─── Competitor Comparison
│    │
│    └─── User Controller
│         ├─── Authentication
│         ├─── Profile Management
│         └─── Role Management
│
├─── Middleware
│    ├─── Auth Middleware
│    │    ├─── JWT Validation
│    │    ├─── Role Verification
│    │    └─── API Key Handling
│    │
│    ├─── Validation Middleware
│    │    ├─── Request Validation
│    │    ├─── Schema Enforcement
│    │    └─── Error Formatting
│    │
│    └─── Error Middleware
│         ├─── Error Handling
│         ├─── Logging
│         └─── Response Formatting
│
├─── Services
│    ├─── Business Service
│    │    ├─── Data Operations
│    │    ├─── Business Logic
│    │    └─── External Integration
│    │
│    ├─── Analytics Service
│    │    ├─── Data Processing
│    │    ├─── Insight Generation
│    │    └─── Report Building
│    │
│    └─── User Service
│         ├─── Authentication Logic
│         ├─── Profile Operations
│         └─── Permission Management
│
└─── Routes
     ├─── Business Routes
     ├─── Analytics Routes
     ├─── User Routes
     └─── System Routes
```

## Key Design Patterns

### Service Layer Pattern
- Clear separation between controllers and data access
- Business logic encapsulation
- Reusable service methods
- Testable components

### Repository Pattern
- Database access abstraction
- Query building
- Transaction management
- Data mapping

### Middleware Chain Pattern
- Sequential processing
- Request/response modification
- Early termination
- Error propagation

### Factory Pattern
- Client instantiation
- Configuration management
- Dependency injection

### Observer Pattern
- Event emitting
- Subscriber notification
- Asynchronous processing

### Strategy Pattern
- Pluggable algorithms
- Runtime behavior selection
- Configurable processing

### Decorator Pattern
- Route protection
- Logging enhancement
- Response formatting
- Cache implementation

### Geographic Grid Pattern
- Area subdivision
- Coverage tracking
- Overlap handling
- Efficient data collection

### Job Queue Pattern
- Distributed processing
- Priority queuing
- Retry mechanism
- Rate limiting

### Data Aggregator Pattern
- Specialized modules for different analysis types
- Data filtering and transformation
- Statistical calculation
- Insight extraction

### Report Generation Pattern
- Standardized report structure
- Customizable parameters
- Chart configuration
- Template-based formatting

## Data Flow Patterns

### Business Discovery Flow
1. Grid area selection
2. API query execution
3. Data normalization
4. Deduplication check
5. Storage in raw data
6. Queue website audit

### Website Audit Flow
1. URL validation
2. Lighthouse testing
3. Screenshot capture
4. Tech stack detection
5. Score calculation
6. Results storage

### Business API Flow
1. Client request with search/filter parameters
2. Request validation 
3. Authentication & authorization
4. Service processing
5. Database query execution
6. Response formatting
7. Client delivery

### Data Analysis Flow
1. Data aggregation request
2. Parameter validation
3. Data retrieval from database
4. Processing through aggregators
5. Insight generation
6. Report formatting
7. Storage in analysis tables

### Authentication Flow
1. Credential submission
2. Supabase authentication
3. JWT generation
4. Role association
5. Token delivery
6. Subsequent request validation

## Error Handling Patterns

### API Error Handling
- Centralized error middleware
- Standardized error objects
- HTTP status mapping
- Contextual error messages
- Logging integration

### Job Processing Errors
- Retry strategies
- Dead-letter queues
- Error notification
- Recovery mechanisms
- Failure analysis

### Validation Errors
- Schema-based validation
- Early request validation
- Descriptive error messages
- Field-level error mapping

## Database Patterns

### Table Structure
- Normalized schema design
- Relationship modeling
- Index optimization
- Constraint enforcement

### Query Patterns
- Parameterized queries
- Transaction management
- Connection pooling
- Query building

### Data Access
- Repository abstraction
- Service encapsulation
- Pagination implementation
- Filtering optimization

## Current Implementation Focus

The project is currently implementing:

1. API Service (In Progress)
   - Business management endpoints
   - Analytics endpoints
   - Search and filtering
   - Testing infrastructure

2. Business Scraper Engine (Priority)
   - Google Places grid scraper
   - Business data processing
   - Website audit implementation

3. Analysis Service
   - Data aggregation system
   - Report generation
   - Scheduled processing 