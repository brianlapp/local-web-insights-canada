import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../utils/database';
import logger from '../utils/logger';
import { ApiError } from '../middleware/errorMiddleware';
import { 
  calculateMetricTrends, 
  calculatePerformanceIndicators, 
  generateComparisonData, 
  calculateStartDate 
} from '../utils/analyticsUtils';

/**
 * Get analytics summary for a business
 */
export const getBusinessAnalyticsSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    
    // Check if business exists
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
      return next(new ApiError('Failed to fetch business analytics', 500));
    }
    
    // Get latest metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('business_metrics')
      .select('*')
      .eq('business_id', id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    if (metricsError && metricsError.code !== 'PGRST116') {
      logger.error('Error fetching business metrics:', metricsError);
      return next(new ApiError('Failed to fetch business metrics', 500));
    }
    
    // Get historical metrics for last 90 days (for trends)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const { data: historicalMetrics, error: historyError } = await supabase
      .from('business_metrics')
      .select('*')
      .eq('business_id', id)
      .gte('timestamp', ninetyDaysAgo.toISOString())
      .order('timestamp', { ascending: true });
    
    if (historyError) {
      logger.error('Error fetching historical metrics:', historyError);
      return next(new ApiError('Failed to fetch historical metrics', 500));
    }
    
    // Calculate trends
    const trends = calculateMetricTrends(historicalMetrics || []);
    
    // Get latest insights
    const { data: insights, error: insightsError } = await supabase
      .from('business_insights')
      .select('*')
      .eq('business_id', id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (insightsError) {
      logger.error('Error fetching business insights:', insightsError);
      return next(new ApiError('Failed to fetch business insights', 500));
    }
    
    res.status(200).json({
      success: true,
      data: {
        business: business.name,
        currentMetrics: metrics || null,
        trends,
        insights: insights || []
      }
    });
  } catch (error) {
    logger.error('Error in getBusinessAnalyticsSummary:', error);
    next(new ApiError('An unexpected error occurred', 500));
  }
};

/**
 * Get detailed performance data for a business
 */
export const getBusinessPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const timeframe = req.query.timeframe as string || '30days';
    const supabase = getSupabaseClient();
    
    // Check if business exists
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, industry')
      .eq('id', id)
      .single();
    
    if (businessError) {
      if (businessError.code === 'PGRST116') {
        return next(new ApiError('Business not found', 404));
      }
      logger.error('Error fetching business:', businessError);
      return next(new ApiError('Failed to fetch business performance', 500));
    }
    
    // Calculate date range based on timeframe
    const startDate = calculateStartDate(timeframe);
    const endDate = new Date().toISOString();
    
    // Get metrics for the specified timeframe
    const { data: performanceData, error: performanceError } = await supabase
      .from('business_metrics')
      .select('*')
      .eq('business_id', id)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: true });
    
    if (performanceError) {
      logger.error('Error fetching performance data:', performanceError);
      return next(new ApiError('Failed to fetch performance data', 500));
    }
    
    // Get competitor benchmarks if available
    const { data: benchmarks, error: benchmarkError } = await supabase
      .from('industry_benchmarks')
      .select('*')
      .eq('industry', business.industry)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    
    if (benchmarkError && benchmarkError.code !== 'PGRST116') {
      logger.error('Error fetching industry benchmarks:', benchmarkError);
    }
    
    // Calculate performance indicators
    const performanceIndicators = calculatePerformanceIndicators(
      performanceData || [], 
      benchmarks || []
    );
    
    res.status(200).json({
      success: true,
      data: {
        business: business.name,
        timeframe,
        performanceData: performanceData || [],
        benchmarks: benchmarks || [],
        performanceIndicators
      }
    });
  } catch (error) {
    logger.error('Error in getBusinessPerformance:', error);
    next(new ApiError('An unexpected error occurred', 500));
  }
};

/**
 * Get recommendations for business improvements
 */
export const getBusinessRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    
    // Check if business exists
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, industry, website')
      .eq('id', id)
      .single();
    
    if (businessError) {
      if (businessError.code === 'PGRST116') {
        return next(new ApiError('Business not found', 404));
      }
      logger.error('Error fetching business:', businessError);
      return next(new ApiError('Failed to fetch business recommendations', 500));
    }
    
    // Get latest recommendations
    const { data: recommendations, error: recommendationsError } = await supabase
      .from('business_recommendations')
      .select('*')
      .eq('business_id', id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (recommendationsError) {
      logger.error('Error fetching recommendations:', recommendationsError);
      return next(new ApiError('Failed to fetch recommendations', 500));
    }
    
    // Get latest website audit if available
    const { data: websiteAudit, error: auditError } = await supabase
      .from('website_audits')
      .select('*')
      .eq('business_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (auditError && auditError.code !== 'PGRST116') {
      logger.error('Error fetching website audit:', auditError);
    }
    
    // Group recommendations by category
    const groupedRecommendations = recommendations?.reduce((groups: Record<string, any[]>, item) => {
      const category = item.category || 'general';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {}) || {};
    
    res.status(200).json({
      success: true,
      data: {
        business: business.name,
        recommendations: groupedRecommendations,
        websiteAudit: websiteAudit || null
      }
    });
  } catch (error) {
    logger.error('Error in getBusinessRecommendations:', error);
    next(new ApiError('An unexpected error occurred', 500));
  }
};

/**
 * Compare business with competitors
 */
export const compareWithCompetitors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { competitorIds } = req.body;
    const supabase = getSupabaseClient();
    
    // Check if business exists
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, industry')
      .eq('id', id)
      .single();
    
    if (businessError) {
      if (businessError.code === 'PGRST116') {
        return next(new ApiError('Business not found', 404));
      }
      logger.error('Error fetching business:', businessError);
      return next(new ApiError('Failed to compare business', 500));
    }
    
    // If competitor IDs provided, validate them
    if (competitorIds && competitorIds.length > 0) {
      const { data: competitors, error: competitorError } = await supabase
        .from('businesses')
        .select('id, name')
        .in('id', competitorIds);
      
      if (competitorError) {
        logger.error('Error validating competitors:', competitorError);
        return next(new ApiError('Failed to validate competitor IDs', 500));
      }
      
      if (competitors.length !== competitorIds.length) {
        const foundIds = new Set(competitors.map((c: any) => c.id));
        const invalidIds = competitorIds.filter((id: string) => !foundIds.has(id));
        return next(new ApiError(`Invalid competitor IDs: ${invalidIds.join(', ')}`, 400));
      }
      
      // Get latest metrics for each competitor
      const competitorMetrics: Record<string, any> = {};
      
      for (const competitor of competitors) {
        const { data: metrics, error: metricsError } = await supabase
          .from('business_metrics')
          .select('*')
          .eq('business_id', competitor.id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();
        
        if (!metricsError) {
          competitorMetrics[competitor.id] = {
            ...competitor,
            metrics
          };
        }
      }
      
      // Get primary business metrics
      const { data: businessMetrics, error: metricsError } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('business_id', id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();
      
      if (metricsError && metricsError.code !== 'PGRST116') {
        logger.error('Error fetching business metrics:', metricsError);
      }
      
      // Calculate comparison data
      const comparisonData = generateComparisonData(businessMetrics, competitorMetrics);
      
      res.status(200).json({
        success: true,
        data: {
          business: {
            id: business.id,
            name: business.name,
            metrics: businessMetrics || null
          },
          competitors: Object.values(competitorMetrics),
          comparison: comparisonData
        }
      });
    } else {
      // If no competitors specified, find businesses in same industry
      const { data: sameIndustry, error: industryError } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('industry', business.industry)
        .neq('id', id)
        .limit(5);
      
      if (industryError) {
        logger.error('Error finding industry competitors:', industryError);
        return next(new ApiError('Failed to find industry competitors', 500));
      }
      
      res.status(200).json({
        success: true,
        data: {
          business: {
            id: business.id,
            name: business.name
          },
          suggestedCompetitors: sameIndustry || []
        }
      });
    }
  } catch (error) {
    logger.error('Error in compareWithCompetitors:', error);
    next(new ApiError('An unexpected error occurred', 500));
  }
}; 