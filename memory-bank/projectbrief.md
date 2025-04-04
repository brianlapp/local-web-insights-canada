# LocalWebsiteAudit.ca Admin Panel Project Brief

## Project Overview
Implementation of an admin panel for LocalWebsiteAudit.ca to manage business audits, track petition signatures, and handle site content, powered by an automated business scraper engine.

## Core Requirements

### 1. Admin Authentication
- Secure login system using Supabase Auth
- Protected admin routes
- Password reset functionality

### 2. Business Scraper Engine
- Google Places API integration with geographic grid system
- Multi-source data collection (Yelp, Yellow Pages)
- Automated website discovery and validation
- Website auditing via Google Lighthouse API
- Screenshot capture for desktop and mobile
- Technology stack detection
- Scoring system and improvement recommendations
- Scraper management UI and job control
- Error monitoring and reporting

### 3. Business Management
- CRUD operations for business audits
- Screenshot upload capabilities
- Comprehensive audit data management (scores, recommendations)
- Integration with scraper engine results
- Deduplication and data enrichment tools

### 4. Petition Management
- View and export petition signatures
- Filter and sort capabilities
- Business-specific signature tracking

### 5. Dashboard
- Key statistics overview
- Recent activity tracking
- Performance metrics
- Scraper job status monitoring
- Geographic coverage visualization

## Technical Scope
- Built on existing React/TypeScript codebase
- Integrated with Supabase backend
- Using shadcn/ui components
- Node.js scraper services
- Distributed job processing system
- Google Places API integration
- Google Lighthouse API integration
- Screenshot capture service
- Geographic grid system
- Data deduplication system

## Database Architecture
- Business data tables
- Scraper job management
- Raw data storage
- Audit history
- Geographic grid tracking
- Error logs and reporting

## Success Criteria
- Secure admin access system
- Automated business discovery
- Accurate website auditing
- Complete business audit management
- Efficient petition signature handling
- Intuitive dashboard interface
- Reliable scraper operation
- Comprehensive data coverage

## Constraints
- Maintain existing public site functionality
- Use established Supabase instance
- Utilize existing component library
- API rate limits consideration
- Geographic focus on Ottawa region
- Processing time requirements 