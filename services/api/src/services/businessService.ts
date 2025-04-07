import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '../utils/database';
import { Business, CreateBusinessDTO, UpdateBusinessDTO, BusinessQueryParams, BusinessAnalytics } from '../types/business';
import { ApiError } from '../middleware/errorMiddleware';
import logger from '../utils/logger';

export class BusinessService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async createBusiness(data: CreateBusinessDTO, userId: string): Promise<Business> {
    try {
      const { data: business, error } = await this.supabase
        .from('businesses')
        .insert([{ ...data, owner_id: userId, status: 'pending' }])
        .select()
        .single();

      if (error) throw error;
      return business;
    } catch (error) {
      logger.error('Error creating business:', error);
      throw new ApiError('Failed to create business', 500);
    }
  }

  async getBusiness(id: string): Promise<Business> {
    try {
      const { data: business, error } = await this.supabase
        .from('businesses')
        .select()
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!business) throw new ApiError('Business not found', 404);
      return business;
    } catch (error) {
      logger.error('Error fetching business:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to fetch business', 500);
    }
  }

  async updateBusiness(id: string, data: UpdateBusinessDTO): Promise<Business> {
    try {
      const { data: business, error } = await this.supabase
        .from('businesses')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!business) throw new ApiError('Business not found', 404);
      return business;
    } catch (error) {
      logger.error('Error updating business:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to update business', 500);
    }
  }

  async deleteBusiness(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('businesses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      logger.error('Error deleting business:', error);
      throw new ApiError('Failed to delete business', 500);
    }
  }

  async listBusinesses(params: BusinessQueryParams): Promise<{ businesses: Business[]; total: number; facets?: Record<string, any> }> {
    try {
      // First get available facets for filtering
      const facets = await this.getFilterFacets();
      
      // Build the main query
      let query = this.supabase.from('businesses').select('*', { count: 'exact' });

      // Apply text search (across multiple fields)
      if (params.search) {
        // Clean the search term to prevent SQL injection
        const searchTerm = params.search.replace(/['";]/g, '');
        
        // Search across multiple fields with ilike
        query = query.or(
          `name.ilike.%${searchTerm}%,` +
          `description.ilike.%${searchTerm}%,` +
          `website.ilike.%${searchTerm}%,` +
          `email.ilike.%${searchTerm}%,` +
          `city.ilike.%${searchTerm}%,` +
          `state.ilike.%${searchTerm}%,` +
          `industry.ilike.%${searchTerm}%`
        );
      }
      
      // Apply exact match filters
      if (params.industry) {
        query = query.eq('industry', params.industry);
      }
      
      // Apply location filters with city and state
      if (params.location) {
        // Check if location contains state abbreviation (e.g., "New York, NY")
        const parts = params.location.split(',').map(part => part.trim());
        if (parts.length > 1) {
          // If we have city and state
          query = query
            .ilike('city', `%${parts[0]}%`)
            .ilike('state', `%${parts[1]}%`);
        } else {
          // If just one location term, search in both city and state
          query = query.or(`city.ilike.%${params.location}%,state.ilike.%${params.location}%`);
        }
      }
      
      // Apply status filter
      if (params.status) {
        query = query.eq('status', params.status);
      }
      
      // Apply date range filters if provided
      if (params.created_after) {
        query = query.gte('created_at', params.created_after);
      }
      
      if (params.created_before) {
        query = query.lte('created_at', params.created_before);
      }
      
      if (params.updated_after) {
        query = query.gte('updated_at', params.updated_after);
      }
      
      if (params.updated_before) {
        query = query.lte('updated_at', params.updated_before);
      }
      
      // Filter by field existence (not null)
      if (params.has_website !== undefined) {
        if (params.has_website) {
          query = query.not('website', 'is', null);
        } else {
          query = query.is('website', null);
        }
      }
      
      if (params.has_email !== undefined) {
        if (params.has_email) {
          query = query.not('email', 'is', null);
        } else {
          query = query.is('email', null);
        }
      }
      
      // Apply sorting
      const sortBy = params.sort_by || 'created_at';
      const sortOrder = params.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const start = (page - 1) * limit;
      query = query.range(start, start + limit - 1);

      // Execute the query
      const { data: businesses, error, count } = await query;

      if (error) throw error;
      
      return { 
        businesses: businesses || [], 
        total: count || 0,
        facets
      };
    } catch (error) {
      logger.error('Error listing businesses:', error);
      throw new ApiError('Failed to list businesses', 500);
    }
  }
  
  /**
   * Get facets for filtering businesses
   * This provides available options for dropdown filters
   */
  private async getFilterFacets(): Promise<Record<string, any>> {
    try {
      // Get distinct industries
      const { data: industries, error: industriesError } = await this.supabase
        .from('businesses')
        .select('industry')
        .not('industry', 'is', null)
        .order('industry');
        
      if (industriesError) throw industriesError;
      
      // Get distinct states
      const { data: states, error: statesError } = await this.supabase
        .from('businesses')
        .select('state')
        .not('state', 'is', null)
        .order('state');
        
      if (statesError) throw statesError;
      
      // Get distinct cities (limit to top 50 for performance)
      const { data: cities, error: citiesError } = await this.supabase
        .from('businesses')
        .select('city')
        .not('city', 'is', null)
        .order('city')
        .limit(50);
        
      if (citiesError) throw citiesError;
      
      return {
        industries: [...new Set(industries.map(item => item.industry))],
        states: [...new Set(states.map(item => item.state))],
        cities: [...new Set(cities.map(item => item.city))],
        statuses: ['active', 'inactive', 'pending']
      };
    } catch (error) {
      logger.error('Error fetching filter facets:', error);
      return {
        industries: [],
        states: [],
        cities: [],
        statuses: ['active', 'inactive', 'pending']
      };
    }
  }

  async getBusinessAnalytics(id: string): Promise<BusinessAnalytics> {
    try {
      const { data: insights, error: insightsError } = await this.supabase
        .from('business_insights')
        .select('*')
        .eq('business_id', id)
        .order('created_at', { ascending: false });

      if (insightsError) throw insightsError;

      const total_insights = insights?.length || 0;
      const average_score = insights?.reduce((acc, insight) => acc + insight.score, 0) / total_insights || 0;
      const last_analysis_date = insights?.[0]?.created_at || null;

      const performance_trend = insights?.slice(0, 10).map(insight => ({
        date: insight.created_at,
        score: insight.score
      })) || [];

      return {
        total_insights,
        average_score,
        last_analysis_date,
        performance_trend
      };
    } catch (error) {
      logger.error('Error fetching business analytics:', error);
      throw new ApiError('Failed to fetch business analytics', 500);
    }
  }
} 