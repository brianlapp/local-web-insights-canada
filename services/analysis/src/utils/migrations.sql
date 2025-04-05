-- Analysis service tables

-- Table for storing analysis reports
CREATE TABLE IF NOT EXISTS analysis_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL, -- 'city', 'category', 'business', 'comparison'
    filters JSONB, -- { city, category, business_id, date_range }
    data JSONB NOT NULL, -- Report data
    chart_configs JSONB, -- Visualization configurations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing aggregated geographic insights
CREATE TABLE IF NOT EXISTS geographic_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region VARCHAR(100) NOT NULL, -- city name, postal code, etc.
    region_type VARCHAR(50) NOT NULL, -- 'city', 'postal_code', 'neighborhood'
    data JSONB NOT NULL, -- Aggregated insights data
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(region, region_type, analysis_date)
);

-- Table for storing aggregated category insights
CREATE TABLE IF NOT EXISTS category_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    data JSONB NOT NULL, -- Aggregated category data
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, city, analysis_date)
);

-- Table for storing business comparison data
CREATE TABLE IF NOT EXISTS business_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id),
    comparison_data JSONB NOT NULL, -- Comparison metrics
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, analysis_date)
);

-- Table for storing historical trend data
CREATE TABLE IF NOT EXISTS performance_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'business', 'category', 'city'
    entity_id VARCHAR(255) NOT NULL, -- business_id, category name, or city name
    metric VARCHAR(50) NOT NULL, -- 'overall', 'performance', 'seo', etc.
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    data_points JSONB NOT NULL, -- { date: value, date: value, ... }
    trend_value DECIMAL, -- calculated trend value
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entity_type, entity_id, metric, start_date, end_date)
);

-- Table for storing scheduled report configurations
CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL, -- 'city', 'category', 'business', 'comparison'
    parameters JSONB NOT NULL, -- Same as report job parameters
    schedule VARCHAR(50) NOT NULL, -- cron schedule expression
    is_active BOOLEAN DEFAULT true,
    last_run TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_reports_type ON analysis_reports(report_type);
CREATE INDEX idx_reports_created ON analysis_reports(created_at);
CREATE INDEX idx_geographic_insights_region ON geographic_insights(region, region_type);
CREATE INDEX idx_category_insights_category ON category_insights(category, city);
CREATE INDEX idx_business_comparisons_business ON business_comparisons(business_id);
CREATE INDEX idx_trends_entity ON performance_trends(entity_type, entity_id);
CREATE INDEX idx_report_schedules_type ON report_schedules(report_type);

-- Add timestamps trigger for all tables
DO $$ 
DECLARE
    tables TEXT[] := ARRAY['analysis_reports', 'geographic_insights', 'category_insights', 'business_comparisons', 'performance_trends', 'report_schedules'];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%s_updated_at
            BEFORE UPDATE ON %s
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t, t);
    END LOOP;
END $$; 