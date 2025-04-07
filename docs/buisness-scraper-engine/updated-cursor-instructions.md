# Instructions for Cursor: Admin Panel & Business Scraper Implementation

Hi Cursor! I need your help implementing an admin panel and business scraper engine for the LocalWebsiteAudit.ca project. This system will automatically collect business data, audit their websites, and allow me to manage this content through an admin panel.

## What We Already Have
- We've already implemented test files for the public-facing components
- Supabase connection is set up
- Basic site structure is in place
- shadcn/ui components are installed and working

## What We Need Now

### 1. Admin Panel
I need an admin panel implementation that includes:

- **Admin Authentication**
   - A simple login page that connects to Supabase Auth
   - Protected admin routes

- **Business Management**
   - Forms to create/edit business audits
   - Upload functionality for screenshots
   - Fields for all audit data (scores, recommendations, etc.)

- **Petition Management**
   - View and export petition signatures
   - Filter signatures by business

- **Dashboard**
   - Simple statistics and overview

### 2. Business Scraper Engine (NEW)
This is the critical "brains" of the operation that will:

- **Collect Business Data**
   - Implement Google Places API integration with geographic grid system (to overcome the 60 listing limit)
   - Add support for additional data sources (Yelp, Yellow Pages, etc.)
   - Create deduplication logic 
   - Store business metadata (name, address, phone, etc.)

- **Website Discovery**
   - Extract and validate website URLs from business listings
   - Handle missing websites with lookup strategies
   - Normalize and store URLs

- **Automated Website Auditing**
   - Google Lighthouse API integration for performance metrics
   - Mobile responsiveness testing
   - Technology stack detection ("Made With" API)
   - Screenshot capture for desktop and mobile
   - Scoring system based on multiple factors
   - Generate improvement recommendations

- **Scraper Management UI**
   - Control panel for running scraper jobs
   - Geographic area management
   - Job status monitoring
   - Audit queue management
   - Error logs and reporting

## Technical Approach

### Database Schema
- Create necessary tables for scraper sources, jobs, raw data, and audit history
- Extend the existing business tables with scraper-related fields

### Implementation Architecture
- Build modular Node.js services for scraping and auditing
- Implement queuing system for rate limiting and distributed processing
- Create admin UI components for managing the entire pipeline
- Set up scheduled jobs for regular data refresh

## Implementation Roadmap

### Phase 1: Core Infrastructure
1. Set up admin authentication
2. Create database schema for scraper system
3. Implement basic Google Places API integration
4. Build simple admin UI for viewing raw data

### Phase 2: Website Auditing
1. Implement website URL extraction and validation
2. Set up Lighthouse API integration
3. Build screenshot capture service
4. Create audit storage and scoring system

### Phase 3: Admin Tools & Refinement
1. Build complete business management UI
2. Create petition management tools
3. Implement scraper control panel
4. Add data enrichment capabilities

### Phase 4: Automation & Expansion
1. Set up scheduled scraping jobs
2. Add additional data sources
3. Implement geographic grid system for Ottawa
4. Create comprehensive dashboard

## Next Steps
Let's start with:
1. Creating a detailed roadmap document
2. Setting up the admin authentication
3. Building the core database schema
4. Implementing the first Google Places API integration

Please create a roadmap that outlines how we'll build both the admin panel and scraper engine, then we'll start implementation.
