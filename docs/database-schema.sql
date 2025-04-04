-- Scraper System Tables

-- Geographic grid areas for scraping
CREATE TABLE geo_grids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    bounds JSONB NOT NULL, -- {northeast: {lat, lng}, southwest: {lat, lng}}
    last_scraped TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data sources (Google Places, Yelp, etc.)
CREATE TABLE scraper_sources (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'google-places', 'yelp'
    name VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    config JSONB, -- API keys, rate limits, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraper job runs
CREATE TABLE scraper_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id VARCHAR(50) REFERENCES scraper_sources(id),
    status VARCHAR(50) NOT NULL, -- 'running', 'completed', 'failed'
    stats JSONB, -- {grids_total, grids_processed, businesses_found}
    error TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Raw business data from scrapers
CREATE TABLE raw_business_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id VARCHAR(50) REFERENCES scraper_sources(id),
    external_id VARCHAR(255) NOT NULL, -- e.g., Google Place ID
    raw_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_id, external_id)
);

-- Processed business records
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    category VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    source_id VARCHAR(50) REFERENCES scraper_sources(id),
    external_id VARCHAR(255), -- Reference to original source
    image_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    is_upgraded BOOLEAN DEFAULT false,
    overall_score INTEGER,
    latest_audit_id UUID,
    last_scanned TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Website audit results
CREATE TABLE website_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id),
    lighthouse_data JSONB, -- Full Lighthouse report
    technology_stack JSONB, -- Detected technologies
    screenshots JSONB, -- {desktop: url, mobile: url}
    scores JSONB NOT NULL, -- {overall, performance, accessibility, seo, etc.}
    recommendations TEXT[], -- Array of improvement suggestions
    error TEXT,
    audit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit errors and issues
CREATE TABLE audit_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id),
    url TEXT NOT NULL,
    error TEXT NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_source ON businesses(source_id, external_id);
CREATE INDEX idx_raw_data_processed ON raw_business_data(processed);
CREATE INDEX idx_website_audits_date ON website_audits(audit_date);
CREATE INDEX idx_scraper_runs_status ON scraper_runs(status);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_geo_grids_updated_at
    BEFORE UPDATE ON geo_grids
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraper_sources_updated_at
    BEFORE UPDATE ON scraper_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraper_runs_updated_at
    BEFORE UPDATE ON scraper_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_raw_business_data_updated_at
    BEFORE UPDATE ON raw_business_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_audits_updated_at
    BEFORE UPDATE ON website_audits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_errors_updated_at
    BEFORE UPDATE ON audit_errors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update scraper run stats
CREATE OR REPLACE FUNCTION update_scraper_run_stats(
    run_id UUID,
    businesses_found INTEGER
)
RETURNS void AS $$
BEGIN
    UPDATE scraper_runs
    SET stats = jsonb_set(
        COALESCE(stats, '{}'::jsonb),
        '{businesses_found}',
        to_jsonb(
            COALESCE(
                (stats->>'businesses_found')::integer, 0
            ) + businesses_found
        )
    )
    WHERE id = run_id;
END;
$$ LANGUAGE plpgsql; 