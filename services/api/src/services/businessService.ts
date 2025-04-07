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

  async listBusinesses(params: BusinessQueryParams): Promise<{ businesses: Business[]; total: number }> {
    try {
      let query = this.supabase.from('businesses').select('*', { count: 'exact' });

      // Apply filters
      if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,website_url.ilike.%${params.search}%`);
      }
      if (params.industry) {
        query = query.eq('industry', params.industry);
      }
      if (params.location) {
        query = query.eq('location', params.location);
      }
      if (params.status) {
        query = query.eq('status', params.status);
      }

      // Apply sorting
      if (params.sort_by) {
        query = query.order(params.sort_by, { ascending: params.sort_order === 'asc' });
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const start = (page - 1) * limit;
      query = query.range(start, start + limit - 1);

      const { data: businesses, error, count } = await query;

      if (error) throw error;
      return { businesses: businesses || [], total: count || 0 };
    } catch (error) {
      logger.error('Error listing businesses:', error);
      throw new ApiError('Failed to list businesses', 500);
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