import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger.js';

// Initialize Supabase client
let supabaseClient: SupabaseClient | null = null;

/**
 * Get or initialize the Supabase client
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    logger.info('Initializing Supabase client with config:', { 
      url: supabaseUrl ? 'defined' : 'undefined',
      key: supabaseKey ? 'defined' : 'undefined'
    });
    
    if (!supabaseUrl || !supabaseKey) {
      logger.warn('Supabase URL or service key not provided, using dummy client');
      // Create a dummy client for testing that won't throw errors
      // This allows other parts of the app to work even if Supabase isn't configured
      supabaseClient = {
        from: () => ({
          insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
          update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
          select: () => ({ 
            eq: () => ({ 
              single: () => ({ data: null, error: null }),
              maybeSingle: () => ({ data: null, error: null }),
              order: () => ({ limit: () => ({ data: [], error: null }) })
            }),
            order: () => ({ limit: () => ({ data: [], error: null }) })
          }),
        }),
      } as unknown as SupabaseClient;
    } else {
      // Create real client
      supabaseClient = createClient(supabaseUrl, supabaseKey);
      logger.info('Supabase client initialized successfully');
      
      // Test the connection
      try {
        const testResult = supabaseClient.from('health_checks').select('count(*)', { count: 'exact', head: true });
        logger.info('Supabase connection test initiated');
      } catch (error) {
        logger.error('Error testing Supabase connection:', error);
      }
    }
  }
  
  return supabaseClient;
};

/**
 * Save website audit results to the database
 */
export const saveAuditResults = async (auditData: any) => {
  try {
    const supabase = getSupabaseClient();
    
    // Extract data from the audit result
    const businessId: string = auditData.businessId;
    const url = auditData.url;
    const scores = auditData.scores;
    const lighthouseData = auditData.lighthouseData;
    const technologies = auditData.technologies;
    const screenshots = auditData.screenshots;
    const recommendations = auditData.recommendations;
    
    // Check if we already have an audit entry for this business
    const { data: existingAudits, error: auditQueryError } = await supabase
      .from('website_audits')
      .select('id')
      .eq('business_id', businessId)
      .order('audit_date', { ascending: false })
      .limit(1);
    
    if (auditQueryError) {
      logger.error('Error checking existing audits:', auditQueryError);
      throw auditQueryError;
    }
    
    // Insert the audit record
    const { data: insertedAuditData, error: auditInsertError } = await supabase
      .from('website_audits')
      .insert({
        business_id: businessId,
        lighthouse_data: lighthouseData,
        technology_stack: technologies,
        screenshots: screenshots,
        scores: scores,
        recommendations: recommendations,
      })
      .select()
      .single();
    
    if (auditInsertError) {
      logger.error('Error inserting audit record:', auditInsertError);
      throw auditInsertError;
    }
    
    // Update the business record with the latest audit ID and scores
    const { data: businessData, error: businessUpdateError } = await supabase
      .from('businesses')
      .update({
        website: url,
        overall_score: scores.overall,
        latest_audit_id: insertedAuditData.id,
        last_scanned: new Date().toISOString(),
      })
      .eq('id', businessId)
      .select()
      .single();
    
    if (businessUpdateError) {
      logger.error('Error updating business record:', businessUpdateError);
      throw businessUpdateError;
    }
    
    logger.info(`Successfully saved audit results for business ${businessId}`);
    
    return {
      audit: insertedAuditData,
      business: businessData,
    };
  } catch (error) {
    logger.error('Error saving audit results:', error);
    throw error;
  }
};

/**
 * Get business information by ID
 */
export const getBusinessById = async (businessId: string) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();
    
    if (error) {
      logger.error(`Error fetching business with ID ${businessId}:`, error);
      throw error;
    }
    
    return data;
  } catch (error) {
    logger.error('Error getting business by ID:', error);
    throw error;
  }
};

/**
 * Save business data to the database
 */
export const saveBusiness = async (businessData: any) => {
  try {
    const supabase = getSupabaseClient();
    
    // Check if the business already exists by external_id
    const { data: existingBusiness, error: queryError } = await supabase
      .from('businesses')
      .select('id')
      .eq('external_id', businessData.external_id)
      .eq('source_id', businessData.source_id)
      .maybeSingle();
    
    if (queryError) {
      logger.error('Error checking existing business:', queryError);
      throw queryError;
    }
    
    if (existingBusiness) {
      // Update existing business
      const { data, error } = await supabase
        .from('businesses')
        .update(businessData)
        .eq('id', existingBusiness.id)
        .select()
        .single();
      
      if (error) {
        logger.error('Error updating business:', error);
        throw error;
      }
      
      logger.info(`Updated business with ID ${data.id}`);
      return data;
    } else {
      // Insert new business
      const { data, error } = await supabase
        .from('businesses')
        .insert(businessData)
        .select()
        .single();
      
      if (error) {
        logger.error('Error inserting business:', error);
        throw error;
      }
      
      logger.info(`Inserted new business with ID ${data.id}`);
      return data;
    }
  } catch (error) {
    logger.error('Error saving business:', error);
    throw error;
  }
};

/**
 * Save raw business data from a source
 */
export const saveRawBusinessData = async (sourceId: string, externalId: string, rawData: any) => {
  try {
    const supabase = getSupabaseClient();
    
    // Check if this data already exists
    const { data: existingData, error: queryError } = await supabase
      .from('raw_business_data')
      .select('id')
      .eq('source_id', sourceId)
      .eq('external_id', externalId)
      .maybeSingle();
    
    if (queryError) {
      logger.error('Error checking existing raw data:', queryError);
      throw queryError;
    }
    
    if (existingData) {
      // Update existing record
      const { data, error } = await supabase
        .from('raw_business_data')
        .update({
          raw_data: rawData,
          processed: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingData.id)
        .select()
        .single();
      
      if (error) {
        logger.error('Error updating raw business data:', error);
        throw error;
      }
      
      return data;
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('raw_business_data')
        .insert({
          source_id: sourceId,
          external_id: externalId,
          raw_data: rawData,
          processed: false,
        })
        .select()
        .single();
      
      if (error) {
        logger.error('Error inserting raw business data:', error);
        throw error;
      }
      
      return data;
    }
  } catch (error) {
    logger.error('Error saving raw business data:', error);
    throw error;
  }
};

/**
 * Update the processed status of raw business data
 */
export const markRawBusinessDataProcessed = async (id: string, success: boolean, error?: string) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error: updateError } = await supabase
      .from('raw_business_data')
      .update({
        processed: true,
        error: error || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      logger.error('Error marking raw business data as processed:', updateError);
      throw updateError;
    }
    
    return data;
  } catch (error) {
    logger.error('Error updating raw business data processed status:', error);
    throw error;
  }
};

function doSomethingForBusiness(businessId: string) {
  let auditData: any;  // or a more specific type

  logger.info(`Processing business: ${businessId}`);

  // Make sure auditData is declared before usage
  auditData = { example: 'data' };

  return { businessId, auditData };
}
