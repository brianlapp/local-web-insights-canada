export interface Business {
  id: string;
  name: string;
  website_url: string;
  industry: string;
  location: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'pending';
  owner_id: string;
  last_analyzed_at?: string;
}

export interface CreateBusinessDTO {
  name: string;
  website_url: string;
  industry: string;
  location: string;
}

export interface UpdateBusinessDTO {
  name?: string;
  website_url?: string;
  industry?: string;
  location?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface BusinessQueryParams {
  search?: string;
  industry?: string;
  location?: string;
  status?: 'active' | 'inactive' | 'pending';
  page?: number;
  limit?: number;
  sort_by?: keyof Business;
  sort_order?: 'asc' | 'desc';
}

export interface BusinessAnalytics {
  total_insights: number;
  average_score: number;
  last_analysis_date: string;
  performance_trend: {
    date: string;
    score: number;
  }[];
} 