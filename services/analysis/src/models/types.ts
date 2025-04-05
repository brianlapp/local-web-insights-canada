// Base database types matching our schema
export interface GeoGrid {
  id: string;
  name: string;
  city: string;
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  last_scraped: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  source_id: string;
  external_id: string | null;
  image_url: string | null;
  status: string;
  is_upgraded: boolean;
  overall_score: number | null;
  latest_audit_id: string | null;
  last_scanned: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebsiteAudit {
  id: string;
  business_id: string;
  lighthouse_data: any;
  technology_stack: string[] | null;
  screenshots: {
    desktop?: string;
    mobile?: string;
  } | null;
  scores: {
    overall: number;
    performance: number;
    accessibility: number;
    seo: number;
    best_practices: number;
  };
  recommendations: string[];
  error: string | null;
  audit_date: string;
  created_at: string;
  updated_at: string;
}

// Analysis types
export interface BusinessDensityData {
  grid_id: string;
  grid_name: string;
  city: string;
  total_businesses: number;
  businesses_per_sqkm: number;
  top_categories: Array<{category: string, count: number}>;
  average_score: number | null;
  bounds: GeoGrid['bounds'];
}

export interface CategoryPerformanceData {
  category: string;
  businesses_count: number;
  average_score: number;
  average_performance: number;
  average_seo: number;
  average_accessibility: number;
  average_best_practices: number;
  top_performers: Array<{
    business_id: string;
    name: string;
    overall_score: number;
  }>;
  improvement_areas: Array<{
    area: string;
    frequency: number;
    average_impact: number;
  }>;
}

export interface CityInsightsData {
  city: string;
  total_businesses: number;
  average_score: number;
  category_distribution: Array<{category: string, count: number, percentage: number}>;
  top_performers: Array<{
    business_id: string;
    name: string;
    category: string;
    overall_score: number;
  }>;
  improvement_opportunities: Array<{
    area: string;
    affected_businesses: number;
    percentage: number;
  }>;
  historical_trends: Array<{
    month: string;
    average_score: number;
    businesses_scanned: number;
  }>;
}

export interface BusinessComparisonData {
  business_id: string;
  name: string;
  category: string;
  overall_score: number;
  category_rank: number;
  city_rank: number;
  percentile: number;
  scores: WebsiteAudit['scores'];
  category_averages: Omit<WebsiteAudit['scores'], 'overall'> & { overall: number };
  strengths: Array<{area: string, score: number, category_average: number}>;
  weaknesses: Array<{area: string, score: number, category_average: number}>;
}

export interface HistoricalPerformanceData {
  business_id: string;
  name: string;
  audits: Array<{
    audit_date: string;
    overall_score: number;
    performance: number;
    accessibility: number;
    seo: number;
    best_practices: number;
  }>;
  trend: {
    overall: number;
    performance: number;
    accessibility: number;
    seo: number;
    best_practices: number;
  };
}

export interface RecommendationImpactData {
  recommendation: string;
  impact_level: 'high' | 'medium' | 'low';
  affected_businesses_count: number;
  average_score_impact: number;
  implementation_difficulty: 'easy' | 'medium' | 'complex';
  categories_most_affected: Array<{category: string, count: number}>;
}

export interface GeographicInsightsData {
  region: string;
  type: 'city' | 'postal_code' | 'neighborhood';
  business_count: number;
  business_density: number;
  top_categories: Array<{category: string, count: number}>;
  average_scores: WebsiteAudit['scores'] & { overall: number };
  performance_heatmap: Array<{
    lat: number;
    lng: number;
    score: number;
    count: number;
  }>;
}

// Report types
export interface Report {
  id: string;
  name: string;
  description: string;
  created_at: string;
  report_type: 'city' | 'category' | 'business' | 'comparison';
  filters: {
    city?: string;
    category?: string;
    business_id?: string;
    date_range?: {
      start: string;
      end: string;
    };
  };
  data: any;
  chart_configs: any[];
} 