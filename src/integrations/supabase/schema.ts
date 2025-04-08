
// Define Supabase database schema types

export type Tables = {
  businesses: {
    id: string;
    name: string;
    city: string;
    category: string;
    description: string;
    website: string;
    address: string;
    image: string;
    mobileScreenshot: string;
    desktopScreenshot: string;
    scores: {
      seo: number;
      performance: number;
      accessibility: number;
      design: number;
      overall: number;
    };
    suggestedImprovements: string[];
    isUpgraded: boolean;
    auditDate: string;
    created_at?: string;
    source_id?: string;
    external_id?: string;
    phone?: string;
  };
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
  scraper_runs: {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    location: string;
    businessesFound?: number;
    error?: string;
    created_at: string;
  };
}

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: Tables['businesses'];
        Insert: Tables['businesses'];
        Update: Partial<Tables['businesses']>;
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
      scraper_runs: {
        Row: Tables['scraper_runs'];
        Insert: Tables['scraper_runs'];
        Update: Partial<Tables['scraper_runs']>;
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
