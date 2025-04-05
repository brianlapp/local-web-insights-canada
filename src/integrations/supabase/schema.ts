
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
    Tables: Tables;
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
