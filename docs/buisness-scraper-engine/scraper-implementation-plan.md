# Business Scraper & Audit Engine Implementation Plan

## Overview
This document outlines the implementation plan for the automated business scraping and website auditing engine that powers LocalWebsiteAudit.ca. This system will:

1. Scrape business data from various sources
2. Audit their websites using Lighthouse and other tools
3. Store results in our Supabase database
4. Provide an admin interface to manage this data

## Technical Components

### 1. Data Collection Service

#### Google Places API Strategy
To work around the 60 listing limitation:
- Implement geographic grid system for Ottawa (divide into smaller areas)
- Use multiple specific search queries per grid (e.g., "restaurants", "retail stores", "professional services")
- Store unique business IDs to prevent duplication
- Implement rate limiting and pagination handling
- Use place_id as unique identifier

#### Additional Data Sources
- Yelp Fusion API (to supplement Google Places)
- Yellow Pages scraper module
- Canada411 business directory scraper
- Local chamber of commerce data
- City business license records (if publicly available)

#### Implementation Approach
- Create a Node.js service with modular scrapers for each source
- Implement queuing system (Bull.js) to manage API rate limits
- Set up scheduled jobs to refresh data periodically
- Build de-duplication logic based on phone numbers, addresses and names

### 2. Website Discovery & Validation

- Extract website URLs from business listings
- Validate URLs (check if they resolve)
- Handle redirects and normalize URLs 
- Check for common website patterns when URLs missing (e.g., businessname.ca)
- Flag businesses with no discoverable website

### 3. Website Audit Engine

#### Audit Components
- Google Lighthouse API integration (performance, accessibility, SEO, best practices)
- Mobile responsiveness testing 
- "Made With" API integration to detect technologies
- Schema validation
- SSL certificate check
- Contact information verification
- Basic content analysis (readability, keyword presence)

#### Processing Pipeline
- Queue system for audit jobs (high concurrency, distributed workload)
- Caching layer to prevent unnecessary re-auditing (TTL: 30 days)
- Error handling and retry logic
- Screenshot capture service (desktop and mobile views)

### 4. Admin Interface Enhancements

#### Scraper Control Panel
- Manual trigger options for specific areas or categories
- Schedule configuration
- Rate limit settings and monitoring
- Error logs and status dashboard

#### Audit Queue Management
- View pending, in-progress, and completed audits
- Manually trigger re-audits
- Prioritize specific businesses
- Audit history and comparison views

#### Data Enrichment Tools
- Manual data correction/enrichment forms
- Bulk import/export capabilities
- Business categorization tools
- Geographic area management

## Database Schema Updates

```sql
-- New tables needed for the scraper and audit engine

-- Source tracking table
CREATE TABLE scraper_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'google_places', 'yelp', 'manual', etc.
  last_run TIMESTAMP WITH TIME ZONE,
  config JSONB, -- Holds source-specific configuration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraper job history
CREATE TABLE scraper_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES scraper_sources(id),
  status TEXT NOT NULL, -- 'pending', 'running', 'completed', 'failed'
  stats JSONB, -- Stats about the run (items found, processed, etc)
  error TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Raw business data (before processing)
CREATE TABLE raw_business_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES scraper_sources(id),
  external_id TEXT, -- ID from external source (place_id etc)
  raw_data JSONB, -- Complete raw data from source
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extend existing businesses table with source fields
ALTER TABLE businesses ADD COLUMN source_id UUID REFERENCES scraper_sources(id);
ALTER TABLE businesses ADD COLUMN external_id TEXT;
ALTER TABLE businesses ADD COLUMN last_scanned TIMESTAMP WITH TIME ZONE;

-- Website audit history 
CREATE TABLE website_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id),
  lighthouse_data JSONB,
  technology_stack JSONB,
  screenshots JSONB, -- URLs to stored screenshots
  scores JSONB, -- Calculated scores for different categories
  recommendations TEXT[],
  audit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Geographic grid for strategic scraping
CREATE TABLE geo_grids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  bounds JSONB NOT NULL, -- lat/lng bounds
  last_scraped TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Implementation Phases

### Phase 1: Core Scraper Infrastructure
1. Set up basic Google Places API integration
2. Implement geographic grid system for Ottawa
3. Build the database schema for storing raw business data
4. Create basic admin UI for viewing scraped data

### Phase 2: Website Discovery & Basic Auditing
1. Implement website URL extraction and validation
2. Set up Lighthouse API integration
3. Build screenshot capture service
4. Create audit storage and basic scoring system

### Phase 3: Enhanced Data Sources
1. Add additional data sources (Yelp, Yellow Pages, etc.)
2. Implement deduplication logic
3. Build data enrichment tools in admin panel

### Phase 4: Advanced Auditing & Reporting
1. Add technology stack detection
2. Implement content analysis features
3. Create comprehensive scoring algorithms
4. Build audit history and comparison tools

### Phase 5: Automation & Monitoring
1. Set up scheduled scraping jobs
2. Implement monitoring and alerting
3. Create dashboard for system health
4. Build analytics for audit data

## Best Practices & Considerations

### Rate Limiting & Ethical Scraping
- Respect robots.txt and terms of service for all sources
- Implement appropriate delays between requests
- Use caching to minimize unnecessary requests
- Consider API costs in the architecture decisions

### Data Storage & Privacy
- Store only necessary business information
- Implement proper data retention policies
- Ensure PIPEDA compliance for Canadian data

### Performance Optimization
- Use distributed processing for audit jobs
- Implement efficient caching strategies
- Consider serverless functions for burst capacity

### Scalability Path
- Design with multiple cities in mind from the start
- Create modular components that can be reused across regions
- Set up infrastructure that can scale horizontally
