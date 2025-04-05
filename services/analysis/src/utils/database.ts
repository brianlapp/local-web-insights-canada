import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Business, WebsiteAudit, GeoGrid, Report } from '../models/types';

dotenv.config();

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY || '';

// Initialize singleton Supabase client
let supabaseClient: SupabaseClient | null = null;

/**
 * Get the Supabase client instance (creates one if it doesn't exist)
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    if (!SUPABASE_URL || !SUPABASE_API_KEY) {
      throw new Error('Missing required environment variables: SUPABASE_URL and SUPABASE_API_KEY');
    }
    
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_API_KEY);
  }
  
  return supabaseClient;
};

/**
 * Fetches businesses from the database with optional filters
 */
export const fetchBusinesses = async (filters: {
  city?: string;
  category?: string;
  limit?: number;
  hasWebsite?: boolean;
  minScore?: number;
}): Promise<Business[]> => {
  const supabase = getSupabaseClient();
  let query = supabase.from('businesses').select('*');
  
  if (filters.city) {
    query = query.eq('city', filters.city);
  }
  
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters.hasWebsite) {
    query = query.not('website', 'is', null);
  }
  
  if (filters.minScore && typeof filters.minScore === 'number') {
    query = query.gte('overall_score', filters.minScore);
  }
  
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Error fetching businesses: ${error.message}`);
  }
  
  return data as Business[];
};

/**
 * Fetches website audits with optional filters
 */
export const fetchWebsiteAudits = async (filters: {
  business_id?: string;
  latest_only?: boolean;
  limit?: number;
  date_from?: string;
  date_to?: string;
}): Promise<WebsiteAudit[]> => {
  const supabase = getSupabaseClient();
  let query = supabase.from('website_audits').select('*');
  
  if (filters.business_id) {
    query = query.eq('business_id', filters.business_id);
  }
  
  if (filters.date_from) {
    query = query.gte('audit_date', filters.date_from);
  }
  
  if (filters.date_to) {
    query = query.lte('audit_date', filters.date_to);
  }
  
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters.latest_only && filters.business_id) {
    query = query.order('audit_date', { ascending: false }).limit(1);
  } else {
    query = query.order('audit_date', { ascending: false });
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Error fetching website audits: ${error.message}`);
  }
  
  return data as WebsiteAudit[];
};

/**
 * Fetches geo grids with optional filters
 */
export const fetchGeoGrids = async (filters: {
  city?: string;
  has_businesses?: boolean;
}): Promise<GeoGrid[]> => {
  const supabase = getSupabaseClient();
  let query = supabase.from('geo_grids').select('*');
  
  if (filters.city) {
    query = query.eq('city', filters.city);
  }
  
  // This requires a join - we'd implement this in actual code
  // Just a placeholder for the concept
  if (filters.has_businesses) {
    // Would require a join with businesses table
    // query = query...
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Error fetching geo grids: ${error.message}`);
  }
  
  return data as GeoGrid[];
};

/**
 * Saves analysis report to the database
 */
export const saveReport = async (report: Omit<Report, 'id' | 'created_at'>): Promise<Report> => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('analysis_reports')
    .insert({
      name: report.name,
      description: report.description,
      report_type: report.report_type,
      filters: report.filters,
      data: report.data,
      chart_configs: report.chart_configs
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error saving report: ${error.message}`);
  }
  
  return data as Report;
};

/**
 * Fetches saved reports from the database
 */
export const fetchReports = async (filters: {
  report_type?: string;
  limit?: number;
}): Promise<Report[]> => {
  const supabase = getSupabaseClient();
  let query = supabase.from('analysis_reports').select('*');
  
  if (filters.report_type) {
    query = query.eq('report_type', filters.report_type);
  }
  
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Error fetching reports: ${error.message}`);
  }
  
  return data as Report[];
}; 