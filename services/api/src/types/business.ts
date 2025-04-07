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
  original_url?: string;
  audit_date: string;
  created_at: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    mobile: number;
    technical: number;
  };
  overall_score: number;
  detailed_metrics?: {
    desktop: {
      performance: {
        score: number;
        metrics: Record<string, number | null>;
      };
      accessibility: {
        score: number;
        failingItems: Array<{ title: string; impact: string }>;
      };
      bestPractices: {
        score: number;
        failingItems: Array<{ title: string; impact: string }>;
      };
      seo: {
        score: number;
        failingItems: Array<{ title: string; impact: string }>;
      };
    };
    mobile: {
      performance: {
        score: number;
        metrics: Record<string, number | null>;
      };
      accessibility: {
        score: number;
        failingItems: Array<{ title: string; impact: string }>;
      };
      bestPractices: {
        score: number;
        failingItems: Array<{ title: string; impact: string }>;
      };
      seo: {
        score: number;
        failingItems: Array<{ title: string; impact: string }>;
      };
    };
  };
  device_comparison?: {
    performanceDiff: number;
    isMobileWorse: boolean;
    speedMetricsDiff: Record<string, number | null>;
    mobileOnlyIssues: Array<{ title: string; impact: string }>;
  };
  recommendations?: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    category: 'performance' | 'accessibility' | 'best-practices' | 'seo';
  }>;
  technologies?: Array<{
    name: string;
    technologies: Array<{
      name: string;
      confidence: number;
      version?: string;
      website?: string;
      categories?: string[];
    }>;
  }>;
  screenshots?: {
    desktop?: string;
    mobile?: string;
  };
  url_validation?: {
    isValid: boolean;
    normalizedUrl: string;
    originalUrl: string;
    redirectUrl?: string;
    statusCode?: number;
    responseTime?: number;
    error?: string;
    isDomain?: boolean;
  };
  audit_status?: 'queued' | 'in-progress' | 'completed' | 'failed' | 'validated' | 'tech-detected';
  audit_error?: string;
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