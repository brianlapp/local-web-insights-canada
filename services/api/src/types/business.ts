export interface Business {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessMetrics {
  id: string;
  business_id: string;
  timestamp: string;
  website_traffic?: number;
  search_ranking?: number;
  review_count?: number;
  average_rating?: number;
  social_mentions?: number;
  conversion_rate?: number;
  bounce_rate?: number;
  page_load_time?: number;
  mobile_friendliness?: number;
  seo_score?: number;
}

export interface BusinessInsight {
  id: string;
  business_id: string;
  title: string;
  description: string;
  source?: string;
  confidence: number;
  created_at: string;
  type?: 'opportunity' | 'risk' | 'information' | 'action';
  status?: 'pending' | 'acknowledged' | 'completed' | 'dismissed';
}

export interface BusinessRecommendation {
  id: string;
  business_id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  category?: string;
  created_at: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}

export interface WebsiteAudit {
  id: string;
  business_id: string;
  url: string;
  created_at: string;
  performance_score?: number;
  accessibility_score?: number;
  best_practices_score?: number;
  seo_score?: number;
  pwa_score?: number;
  audit_data?: Record<string, any>;
}

export interface IndustryBenchmark {
  id: string;
  industry: string;
  date: string;
  website_traffic?: number;
  search_ranking?: number;
  review_count?: number;
  average_rating?: number;
  social_mentions?: number;
  conversion_rate?: number;
  bounce_rate?: number;
  page_load_time?: number;
}

export interface AnalyticsSummary {
  business: string;
  currentMetrics: BusinessMetrics | null;
  trends: Record<string, any>;
  insights: BusinessInsight[];
}

export interface PerformanceData {
  business: string;
  timeframe: string;
  performanceData: BusinessMetrics[];
  benchmarks: IndustryBenchmark[];
  performanceIndicators: Record<string, any>;
}

export interface RecommendationsResponse {
  business: string;
  recommendations: Record<string, BusinessRecommendation[]>;
  websiteAudit: WebsiteAudit | null;
}

export interface ComparisonResponse {
  business: {
    id: string;
    name: string;
    metrics: BusinessMetrics | null;
  };
  competitors: Array<{
    id: string;
    name: string;
    metrics: BusinessMetrics;
  }>;
  comparison: Record<string, any>;
}

export interface CompetitorSuggestionResponse {
  business: {
    id: string;
    name: string;
  };
  suggestedCompetitors: Business[];
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
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
  has_website?: boolean;
  has_email?: boolean;
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