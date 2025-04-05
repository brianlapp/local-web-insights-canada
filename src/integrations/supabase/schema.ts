
// Define Supabase database schema types

export interface Tables {
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
  };
  audits: {
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

export interface Database {
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
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

// Types for mocking storage errors
export interface StorageErrorMock {
  name: string;
  message: string;
  status?: number;
  statusCode?: number;
  error?: string;
}
