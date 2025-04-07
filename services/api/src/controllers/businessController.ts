import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../utils/database';
import logger from '../utils/logger';
import { ApiError } from '../middleware/errorMiddleware';
import { BusinessService } from '../services/businessService';
import { CreateBusinessDTO, UpdateBusinessDTO, BusinessQueryParams } from '../types/business';

/**
 * Get all businesses with filtering and pagination
 */
export const getAllBusinesses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy as string || 'created_at';
    const sortOrder = req.query.sortOrder as string || 'desc';
    
    // Build query
    let query = supabase
      .from('businesses')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (req.query.name) {
      query = query.ilike('name', `%${req.query.name}%`);
    }
    
    if (req.query.city) {
      query = query.ilike('city', `%${req.query.city}%`);
    }
    
    if (req.query.category) {
      query = query.contains('categories', [req.query.category]);
    }
    
    if (req.query.minRating) {
      query = query.gte('rating', req.query.minRating);
    }
    
    if (req.query.maxRating) {
      query = query.lte('rating', req.query.maxRating);
    }
    
    if (req.query.hasWebsite !== undefined) {
      if (req.query.hasWebsite === 'true') {
        query = query.not('website', 'is', null);
      } else {
        query = query.is('website', null);
      }
    }
    
    // Execute query with pagination and sorting
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);
    
    if (error) {
      logger.error('Error fetching businesses:', error);
      return next(new ApiError('Failed to fetch businesses', 500));
    }
    
    res.status(200).json({
      success: true,
      count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      data
    });
  } catch (error) {
    logger.error('Error in getAllBusinesses:', error);
    next(new ApiError('An unexpected error occurred', 500));
  }
};

/**
 * Get business by ID
 */
export const getBusinessById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return next(new ApiError('Business not found', 404));
      }
      logger.error('Error fetching business by ID:', error);
      return next(new ApiError('Failed to fetch business', 500));
    }
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error in getBusinessById:', error);
    next(new ApiError('An unexpected error occurred', 500));
  }
};

/**
 * Get business insights
 */
export const getBusinessInsights = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    
    // First check if business exists
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('id', id)
      .single();
    
    if (businessError) {
      if (businessError.code === 'PGRST116') {
        return next(new ApiError('Business not found', 404));
      }
      logger.error('Error fetching business:', businessError);
      return next(new ApiError('Failed to fetch business', 500));
    }
    
    // Get the latest analysis results for this business
    const { data: insights, error: insightsError } = await supabase
      .from('business_insights')
      .select('*')
      .eq('business_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (insightsError && insightsError.code !== 'PGRST116') {
      logger.error('Error fetching business insights:', insightsError);
      return next(new ApiError('Failed to fetch business insights', 500));
    }
    
    // Get historical metrics
    const { data: historicalMetrics, error: metricsError } = await supabase
      .from('business_metrics')
      .select('*')
      .eq('business_id', id)
      .order('timestamp', { ascending: false })
      .limit(30);
    
    if (metricsError) {
      logger.error('Error fetching business metrics:', metricsError);
      return next(new ApiError('Failed to fetch business metrics', 500));
    }
    
    res.status(200).json({
      success: true,
      data: {
        business,
        insights: insights || null,
        historicalMetrics: historicalMetrics || []
      }
    });
  } catch (error) {
    logger.error('Error in getBusinessInsights:', error);
    next(new ApiError('An unexpected error occurred', 500));
  }
};

/**
 * Get business website audit data
 */
export const getBusinessWebsiteAudit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    
    // First check if business exists
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, website')
      .eq('id', id)
      .single();
    
    if (businessError) {
      if (businessError.code === 'PGRST116') {
        return next(new ApiError('Business not found', 404));
      }
      logger.error('Error fetching business:', businessError);
      return next(new ApiError('Failed to fetch business', 500));
    }
    
    if (!business.website) {
      return next(new ApiError('Business does not have a website', 404));
    }
    
    // Get the latest website audit for this business
    const { data: latestAudit, error: auditError } = await supabase
      .from('website_audits')
      .select('*')
      .eq('business_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (auditError && auditError.code !== 'PGRST116') {
      logger.error('Error fetching website audit:', auditError);
      return next(new ApiError('Failed to fetch website audit', 500));
    }
    
    // Get audit screenshots if available
    let screenshots = [];
    if (latestAudit) {
      const { data: screenshotData, error: screenshotError } = await supabase
        .from('website_screenshots')
        .select('*')
        .eq('audit_id', latestAudit.id)
        .order('created_at', { ascending: true });
      
      if (screenshotError) {
        logger.error('Error fetching screenshots:', screenshotError);
      } else {
        screenshots = screenshotData || [];
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        business,
        audit: latestAudit || null,
        screenshots
      }
    });
  } catch (error) {
    logger.error('Error in getBusinessWebsiteAudit:', error);
    next(new ApiError('An unexpected error occurred', 500));
  }
};

/**
 * Update business
 */
export const updateBusiness = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, website, notes, isMonitored } = req.body;
    const supabase = getSupabaseClient();
    
    // Check if business exists
    const { data: existingBusiness, error: checkError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return next(new ApiError('Business not found', 404));
      }
      logger.error('Error checking business existence:', checkError);
      return next(new ApiError('Failed to update business', 500));
    }
    
    // Update business
    const updateData: Record<string, any> = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (website !== undefined) updateData.website = website;
    if (notes !== undefined) updateData.notes = notes;
    if (isMonitored !== undefined) updateData.is_monitored = isMonitored;
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      logger.error('Error updating business:', error);
      return next(new ApiError('Failed to update business', 500));
    }
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error in updateBusiness:', error);
    next(new ApiError('An unexpected error occurred', 500));
  }
};

export class BusinessController {
  private businessService: BusinessService;

  constructor() {
    this.businessService = new BusinessService();
  }

  createBusiness = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        next(new ApiError('Unauthorized', 401));
        return;
      }
      const business = await this.businessService.createBusiness(req.body, userId);
      res.status(201).json(business);
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError('Failed to create business', 500, error));
      }
    }
  };

  getBusiness = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const business = await this.businessService.getBusiness(req.params.id);
      if (!business) {
        next(new ApiError('Business not found', 404));
        return;
      }
      res.json(business);
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError('Failed to get business', 500, error));
      }
    }
  };

  updateBusiness = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const business = await this.businessService.updateBusiness(req.params.id, req.body);
      if (!business) {
        next(new ApiError('Business not found', 404));
        return;
      }
      res.json(business);
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError('Failed to update business', 500, error));
      }
    }
  };

  deleteBusiness = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.businessService.deleteBusiness(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError('Failed to delete business', 500, error));
      }
    }
  };

  listBusinesses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = req.query as BusinessQueryParams;
      const businesses = await this.businessService.listBusinesses(queryParams);
      res.json(businesses);
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError('Failed to list businesses', 500, error));
      }
    }
  };

  async getBusinessAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const analytics = await this.businessService.getBusinessAnalytics(id);
      res.json(analytics);
    } catch (error) {
      logger.error('Error in getBusinessAnalytics controller:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch business analytics' });
      }
    }
  }
} 