import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient, transaction } from '../utils/database';
import logger from '../utils/logger';
import { ApiError } from '../middleware/errorMiddleware';

interface Business {
  id: string;
  name: string;
  city?: string;
  website?: string;
}

/**
 * Get all analyses with filtering and pagination
 */
export const getAllAnalyses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy as string || 'created_at';
    const sortOrder = req.query.sortOrder as string || 'desc';
    
    // Build query
    let query = supabase
      .from('analyses')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (req.query.name) {
      query = query.ilike('name', `%${req.query.name}%`);
    }
    
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }
    
    if (req.query.type) {
      query = query.eq('type', req.query.type);
    }
    
    if (req.query.dateFrom) {
      query = query.gte('created_at', req.query.dateFrom);
    }
    
    if (req.query.dateTo) {
      query = query.lte('created_at', req.query.dateTo);
    }
    
    // Execute query with pagination and sorting
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);
    
    if (error) {
      logger.error('Error fetching analyses:', error);
      return next(new ApiError('Failed to fetch analyses', 500));
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
    logger.error('Error in getAllAnalyses:', error);
    next(new ApiError('An unexpected error occurred', 500));
  }
};

/**
 * Get analysis by ID
 */
export const getAnalysisById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    
    // Get analysis
    const { data: analysis, error } = await supabase
      .from('analyses')
      .select(`
        *,
        analysis_businesses(business_id)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return next(new ApiError('Analysis not found', 404));
      }
      logger.error('Error fetching analysis by ID:', error);
      return next(new ApiError('Failed to fetch analysis', 500));
    }
    
    // Format business IDs
    const businessIds = analysis.analysis_businesses
      ? analysis.analysis_businesses.map((item: { business_id: string }) => item.business_id)
      : [];
    
    // Get related businesses if any
    let businesses: Business[] = [];
    if (businessIds.length > 0) {
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id, name, city, website')
        .in('id', businessIds);
      
      if (businessError) {
        logger.error('Error fetching related businesses:', businessError);
      } else {
        businesses = businessData || [];
      }
    }
    
    // Remove the join data and add formatted business data
    const formattedAnalysis = {
      ...analysis,
      analysis_businesses: undefined,
      businesses
    };
    
    res.status(200).json({
      success: true,
      data: formattedAnalysis
    });
  } catch (error) {
    logger.error('Error in getAnalysisById:', error);
    next(new ApiError('An unexpected error occurred', 500));
  }
};

/**
 * Create a new analysis
 */
export const createAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const client = getSupabaseClient();
  
  try {
    const { name, description, type, parameters, businessIds } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return next(new ApiError('User not authenticated', 401));
    }
    
    // Validate business IDs if provided
    if (businessIds && businessIds.length > 0) {
      const { data: existingBusinesses, error: businessCheckError } = await client
        .from('businesses')
        .select('id')
        .in('id', businessIds);
      
      if (businessCheckError) {
        logger.error('Error checking businesses:', businessCheckError);
        return next(new ApiError('Failed to validate business IDs', 500));
      }
      
      const foundIds = new Set(existingBusinesses.map((b: { id: string }) => b.id));
      const invalidIds = businessIds.filter((id: string) => !foundIds.has(id));
      
      if (invalidIds.length > 0) {
        return next(new ApiError(`Invalid business IDs: ${invalidIds.join(', ')}`, 400));
      }
    }
    
    // Use a transaction to create the analysis and link businesses
    return await transaction(client, async (tx) => {
      // Create analysis
      const { data: analysis, error: analysisError } = await tx
        .from('analyses')
        .insert({
          name,
          description,
          type,
          parameters,
          status: 'pending',
          created_by: userId
        })
        .select()
        .single();
      
      if (analysisError) {
        logger.error('Error creating analysis:', analysisError);
        throw new ApiError('Failed to create analysis', 500);
      }
      
      // Link businesses if provided
      if (businessIds && businessIds.length > 0) {
        const analysisBusinesses = businessIds.map((businessId: string) => ({
          analysis_id: analysis.id,
          business_id: businessId
        }));
        
        const { error: linkError } = await tx
          .from('analysis_businesses')
          .insert(analysisBusinesses);
        
        if (linkError) {
          logger.error('Error linking businesses to analysis:', linkError);
          throw new ApiError('Failed to link businesses to analysis', 500);
        }
      }
      
      // Queue the analysis job
      const { error: queueError } = await tx
        .from('analysis_queue')
        .insert({
          analysis_id: analysis.id,
          priority: 5, // Default priority
          status: 'pending'
        });
      
      if (queueError) {
        logger.error('Error queueing analysis job:', queueError);
        throw new ApiError('Failed to queue analysis job', 500);
      }
      
      res.status(201).json({
        success: true,
        data: analysis
      });
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    
    logger.error('Error in createAnalysis:', error);
    next(new ApiError('An unexpected error occurred', 500));
  }
};

/**
 * Update analysis
 */
export const updateAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const supabase = getSupabaseClient();
    
    // Check if analysis exists and is not completed
    const { data: existingAnalysis, error: checkError } = await supabase
      .from('analyses')
      .select('id, status')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return next(new ApiError('Analysis not found', 404));
      }
      logger.error('Error checking analysis:', checkError);
      return next(new ApiError('Failed to update analysis', 500));
    }
    
    // Validate status update
    if (status && 
        (existingAnalysis.status === 'completed' || existingAnalysis.status === 'failed')) {
      return next(
        new ApiError('Cannot update status of completed or failed analyses', 400)
      );
    }
    
    // Update analysis
    const updateData: Record<string, any> = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('analyses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      logger.error('Error updating analysis:', error);
      return next(new ApiError('Failed to update analysis', 500));
    }
    
    // If status was updated, also update the queue
    if (status !== undefined) {
      const queueStatus = status === 'paused' ? 'paused' : 
                          status === 'cancelled' ? 'cancelled' : 'pending';
                          
      const { error: queueError } = await supabase
        .from('analysis_queue')
        .update({ status: queueStatus, updated_at: new Date().toISOString() })
        .eq('analysis_id', id);
      
      if (queueError) {
        logger.warn('Error updating analysis queue status:', queueError);
        // Continue despite queue update error
      }
    }
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error in updateAnalysis:', error);
    next(new ApiError('An unexpected error occurred', 500));
  }
};

/**
 * Get analysis results
 */
export const getAnalysisResults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    
    // Check if analysis exists
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('id, name, status, type, created_at')
      .eq('id', id)
      .single();
    
    if (analysisError) {
      if (analysisError.code === 'PGRST116') {
        return next(new ApiError('Analysis not found', 404));
      }
      logger.error('Error fetching analysis:', analysisError);
      return next(new ApiError('Failed to fetch analysis results', 500));
    }
    
    // Get analysis results if available
    const { data: results, error: resultsError } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('analysis_id', id)
      .order('created_at', { ascending: false });
    
    if (resultsError) {
      logger.error('Error fetching analysis results:', resultsError);
      return next(new ApiError('Failed to fetch analysis results', 500));
    }
    
    // Get metadata about the analysis
    const { data: metadata, error: metadataError } = await supabase
      .from('analysis_metadata')
      .select('*')
      .eq('analysis_id', id)
      .single();
    
    if (metadataError && metadataError.code !== 'PGRST116') {
      logger.error('Error fetching analysis metadata:', metadataError);
      // Continue despite metadata error
    }
    
    res.status(200).json({
      success: true,
      data: {
        analysis,
        metadata: metadata || null,
        results: results || []
      }
    });
  } catch (error) {
    logger.error('Error in getAnalysisResults:', error);
    next(new ApiError('An unexpected error occurred', 500));
  }
};

/**
 * Re-run analysis
 */
export const rerunAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { parameters } = req.body;
    const userId = req.user?.id;
    const supabase = getSupabaseClient();
    
    if (!userId) {
      return next(new ApiError('User not authenticated', 401));
    }
    
    // Check if analysis exists
    const { data: existingAnalysis, error: checkError } = await supabase
      .from('analyses')
      .select('id, name, type, parameters')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return next(new ApiError('Analysis not found', 404));
      }
      logger.error('Error checking analysis existence:', checkError);
      return next(new ApiError('Failed to re-run analysis', 500));
    }
    
    // Create a new analysis based on the existing one
    const newAnalysisData = {
      name: `${existingAnalysis.name} (Re-run)`,
      type: existingAnalysis.type,
      parameters: parameters || existingAnalysis.parameters,
      status: 'pending',
      parent_analysis_id: id,
      created_by: userId
    };
    
    // Use transaction for creating the new analysis and copying relationships
    return await transaction(supabase, async (tx) => {
      // Create new analysis
      const { data: newAnalysis, error: createError } = await tx
        .from('analyses')
        .insert(newAnalysisData)
        .select()
        .single();
      
      if (createError) {
        logger.error('Error creating new analysis:', createError);
        throw new ApiError('Failed to create new analysis', 500);
      }
      
      // Copy business relationships
      const { data: businessRelations, error: relationsError } = await tx
        .from('analysis_businesses')
        .select('business_id')
        .eq('analysis_id', id);
      
      if (relationsError) {
        logger.error('Error fetching business relations:', relationsError);
        throw new ApiError('Failed to copy business relations', 500);
      }
      
      if (businessRelations && businessRelations.length > 0) {
        const newRelations = businessRelations.map((rel: { business_id: string }) => ({
          analysis_id: newAnalysis.id,
          business_id: rel.business_id
        }));
        
        const { error: insertError } = await tx
          .from('analysis_businesses')
          .insert(newRelations);
        
        if (insertError) {
          logger.error('Error copying business relations:', insertError);
          throw new ApiError('Failed to copy business relations', 500);
        }
      }
      
      // Queue the analysis job
      const { error: queueError } = await tx
        .from('analysis_queue')
        .insert({
          analysis_id: newAnalysis.id,
          priority: 5, // Default priority
          status: 'pending'
        });
      
      if (queueError) {
        logger.error('Error queueing analysis job:', queueError);
        throw new ApiError('Failed to queue analysis job', 500);
      }
      
      res.status(201).json({
        success: true,
        data: newAnalysis
      });
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    
    logger.error('Error in rerunAnalysis:', error);
    next(new ApiError('An unexpected error occurred', 500));
  }
}; 