// Define Supabase database schema types

export type Tables = {
  businesses: {
    id: string;
    name: string;
    description?: string;
    city?: string;
    category?: string;
    website?: string;
    address?: string;
    phone?: string;
    source_id?: string;
    external_id?: string;
    image?: string;
    mobile_screenshot?: string;
    desktop_screenshot?: string;
    is_upgraded: boolean;
    scores: {
      seo: number;
      performance: number;
      accessibility: number;
      design: number;
      overall: number;
    };
    suggested_improvements: string[];
    audit_date?: string;
    created_at: string;
    updated_at: string;
  };
  scraper_runs: {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    location: string;
    businessesFound: number;
    error?: string;
    created_at: string;
    updated_at: string;
  };
  scraper_sources: {
    id: string;
    name: string;
    enabled: boolean;
    config?: Record<string, any>;
    created_at: string;
    updated_at: string;
  };
  geo_grids: {
    id: string;
    name: string;
    city: string;
    bounds: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
    last_scraped?: string;
    created_at: string;
    updated_at: string;
  };
  raw_business_data: {
    id: string;
    source_id?: string;
    external_id: string;
    raw_data: Record<string, any>;
    processed: boolean;
    error?: string;
    created_at: string;
    updated_at: string;
  };
  website_audits: {
    id: string;
    business_id: string;
    url: string;
    lighthouse_data?: Record<string, any>;
    technology_stack?: Record<string, any>;
    screenshots?: {
      desktop?: string;
      mobile?: string;
    };
    scores: {
      overall: number;
      performance: number;
      accessibility: number;
      seo: number;
      best_practices: number;
    };
    recommendations: string[];
    error?: string;
    audit_date: string;
    created_at: string;
    updated_at: string;
  };
  audit_errors: {
    id: string;
    business_id?: string;
    url: string;
    error: string;
    occurred_at: string;
    resolved: boolean;
    resolution_notes?: string;
    created_at: string;
    updated_at: string;
  };
  analysis_reports: {
    id: string;
    name: string;
    description?: string;
    report_type: string;
    filters?: Record<string, any>;
    data: Record<string, any>;
    chart_configs?: Record<string, any>;
    created_at: string;
    updated_at: string;
  };
  geographic_insights: {
    id: string;
    region: string;
    region_type: string;
    data: Record<string, any>;
    analysis_date: string;
    created_at: string;
    updated_at: string;
  };
  category_insights: {
    id: string;
    category: string;
    city?: string;
    data: Record<string, any>;
    analysis_date: string;
    created_at: string;
    updated_at: string;
  };
  business_comparisons: {
    id: string;
    business_id?: string;
    comparison_data: Record<string, any>;
    analysis_date: string;
    created_at: string;
    updated_at: string;
  };
  user_profiles: {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    role: string;
    preferences?: Record<string, any>;
    created_at: string;
    updated_at: string;
  };
  // Keep any existing tables not modified in our migration
  audits: {
    id?: string;
    business_slug: string;
    score: number;
    metrics: {
      performance: number;
      accessibility: number;
      seo: number;
      bestPractices: number;
    };
    recommendations: {
      id: number;
      category: string;
      description: string;
    }[];
    lastUpdated: string;
  };
  petition_signatures: {
    id?: string;
    petition_id: string;
    name: string;
    email: string;
    is_local: boolean;
    message: string | null;
    created_at?: string;
  };
}

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: Tables['businesses'];
        Insert: Omit<Tables['businesses'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tables['businesses'], 'id' | 'created_at' | 'updated_at'>>;
      };
      scraper_runs: {
        Row: Tables['scraper_runs'];
        Insert: Omit<Tables['scraper_runs'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tables['scraper_runs'], 'id' | 'created_at' | 'updated_at'>>;
      };
      scraper_sources: {
        Row: Tables['scraper_sources'];
        Insert: Omit<Tables['scraper_sources'], 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tables['scraper_sources'], 'id' | 'created_at' | 'updated_at'>>;
      };
      geo_grids: {
        Row: Tables['geo_grids'];
        Insert: Omit<Tables['geo_grids'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tables['geo_grids'], 'id' | 'created_at' | 'updated_at'>>;
      };
      raw_business_data: {
        Row: Tables['raw_business_data'];
        Insert: Omit<Tables['raw_business_data'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tables['raw_business_data'], 'id' | 'created_at' | 'updated_at'>>;
      };
      website_audits: {
        Row: Tables['website_audits'];
        Insert: Omit<Tables['website_audits'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tables['website_audits'], 'id' | 'created_at' | 'updated_at'>>;
      };
      audit_errors: {
        Row: Tables['audit_errors'];
        Insert: Omit<Tables['audit_errors'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tables['audit_errors'], 'id' | 'created_at' | 'updated_at'>>;
      };
      analysis_reports: {
        Row: Tables['analysis_reports'];
        Insert: Omit<Tables['analysis_reports'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tables['analysis_reports'], 'id' | 'created_at' | 'updated_at'>>;
      };
      geographic_insights: {
        Row: Tables['geographic_insights'];
        Insert: Omit<Tables['geographic_insights'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tables['geographic_insights'], 'id' | 'created_at' | 'updated_at'>>;
      };
      category_insights: {
        Row: Tables['category_insights'];
        Insert: Omit<Tables['category_insights'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tables['category_insights'], 'id' | 'created_at' | 'updated_at'>>;
      };
      business_comparisons: {
        Row: Tables['business_comparisons'];
        Insert: Omit<Tables['business_comparisons'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tables['business_comparisons'], 'id' | 'created_at' | 'updated_at'>>;
      };
      user_profiles: {
        Row: Tables['user_profiles'];
        Insert: Omit<Tables['user_profiles'], 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tables['user_profiles'], 'id' | 'created_at' | 'updated_at'>>;
      };
      audits: {
        Row: Tables['audits'];
        Insert: Tables['audits'];
        Update: Partial<Tables['audits']>;
      };
      petition_signatures: {
        Row: Tables['petition_signatures'];
        Insert: Tables['petition_signatures'];
        Update: Partial<Tables['petition_signatures']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

// Types for mocking storage errors
export type StorageErrorMock = {
  name: string;
  message: string;
  status?: number;
  statusCode?: number;
  error?: string;
}
