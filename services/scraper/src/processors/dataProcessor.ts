import { logger } from '../utils/logger.js';
import { getSupabaseClient, markRawBusinessDataProcessed, saveBusiness } from '../utils/database.js';
import Queue from 'bull';
import { SupabaseClient } from '@supabase/supabase-js';
import { Job, JobId } from 'bull';
import { QUEUE_NAMES } from '../queues/index.js';

// Data processing queue name
const DATA_PROCESSING_QUEUE = 'data-processing';

// Log Redis connection info
const redisUrl = process.env.REDIS_URL || '';
logger.info(`Data processor Redis URL configured: ${redisUrl.replace(/\/\/.*@/, '//***@')}`);
logger.info(`Data processor Redis hostname: ${redisUrl.match(/@([^:]+):/)?.[1] || 'not-found'}`);

// Initialize the data processing queue
const dataProcessingQueue = new Queue(DATA_PROCESSING_QUEUE, process.env.REDIS_URL as string);

// Configure queue settings
dataProcessingQueue.on('error', (error) => {
  logger.error(`Data processing queue error: ${error.message}`, { error });
});

dataProcessingQueue.on('failed', (job, error) => {
  logger.error(`Data processing job ${job.id} failed: ${error.message}`, { error });
  // Schedule retry with exponential backoff if under max retries
  const maxRetries = 3;
  if (job.attemptsMade < maxRetries) {
    const backoffDelay = Math.pow(2, job.attemptsMade) * 1000; // Exponential backoff: 2s, 4s, 8s
    logger.info(`Scheduling retry #${job.attemptsMade + 1} for job ${job.id} in ${backoffDelay}ms`);
    job.retry();
  } else {
    logger.error(`Job ${job.id} exceeded maximum retries (${maxRetries})`);
  }
});

dataProcessingQueue.on('completed', (job) => {
  logger.info(`Data processing job ${job.id} completed successfully`);
});

/**
 * Process raw business data from the database
 */
export async function processRawBusinessData(job: any) {
  const { id } = job.data;
  const startTime = Date.now();
  let metrics = {
    processingTimeMs: 0,
    status: 'failed',
    errorType: null,
  };

  logger.info(`Processing raw business data with ID: ${id}`);
  
  try {
    const supabase = getSupabaseClient();
    
    // Fetch the raw business data
    const { data: rawData, error: fetchError } = await supabase
      .from('raw_business_data')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (fetchError) {
      throw new Error(`Failed to fetch raw business data: ${fetchError.message}`);
    }
    
    if (!rawData) {
      throw new Error(`Raw business data with ID ${id} not found`);
    }
    
    // Process the data
    const processedData = await transformBusinessData(rawData, supabase);
    
    // Save the processed data
    const savedBusiness = await saveBusiness(processedData);
    
    // Mark the raw data as processed
    await markRawBusinessDataProcessed(id, true);
    
    // Update metrics
    metrics.processingTimeMs = Date.now() - startTime;
    metrics.status = 'success';
    
    // Return the processing result
    return {
      businessId: savedBusiness.id,
      metrics,
    };
  } catch (error: any) {
    // Update metrics
    metrics.processingTimeMs = Date.now() - startTime;
    metrics.status = 'failed';
    metrics.errorType = error.name || 'UnknownError';
    
    // Log the error
    logger.error(`Error processing raw business data: ${error.message}`, { 
      error,
      rawDataId: id,
      metrics,
    });
    
    // Mark as processed with error
    try {
      await markRawBusinessDataProcessed(id, false, error.message);
    } catch (markError) {
      logger.error(`Failed to mark raw data as processed with error: ${markError}`);
    }
    
    // Rethrow to trigger the failed event
    throw error;
  }
}

/**
 * Transform raw business data into processed business data
 */
async function transformBusinessData(rawData: any, supabase: SupabaseClient) {
  const { raw_data, source_id, external_id } = rawData;
  
  // Get source information
  const { data: sourceData, error: sourceError } = await supabase
    .from('scraper_sources')
    .select('name, type')
    .eq('id', source_id)
    .maybeSingle();
  
  if (sourceError) {
    throw new Error(`Failed to fetch source information: ${sourceError.message}`);
  }
  
  if (!sourceData) {
    throw new Error(`Source with ID ${source_id} not found`);
  }
  
  logger.info(`Transforming business data from source: ${sourceData.name} (${sourceData.type})`);
  
  // Different transformation logic based on source type
  switch (sourceData.type) {
    case 'google_places':
      return transformGooglePlacesData(raw_data, source_id, external_id);
    case 'yelp':
      return transformYelpData(raw_data, source_id, external_id);
    default:
      return transformGenericData(raw_data, source_id, external_id);
  }
}

/**
 * Transform Google Places data
 */
function transformGooglePlacesData(rawData: any, sourceId: string, externalId: string) {
  // Extract the relevant fields from the Google Places data
  const {
    name,
    formatted_address,
    formatted_phone_number,
    website,
    types,
    geometry,
    business_status,
    opening_hours,
    photos,
    rating,
    user_ratings_total,
  } = rawData;
  
  // Transform to our business schema
  const transformedData = {
    name: name,
    address: formatted_address,
    phone: formatted_phone_number || null,
    website: website || null,
    categories: types || [],
    location: geometry?.location ? {
      lat: geometry.location.lat,
      lng: geometry.location.lng,
    } : null,
    status: business_status || 'OPERATIONAL',
    hours: opening_hours?.weekday_text || null,
    photo_urls: photos?.map((photo: any) => photo.photo_reference) || [],
    rating: rating || null,
    rating_count: user_ratings_total || 0,
    source_id: sourceId,
    external_id: externalId,
    last_scanned: new Date().toISOString(),
    raw_data: rawData, // Store the original data for reference
  };
  
  logger.debug(`Transformed Google Places data: ${JSON.stringify(transformedData, null, 2)}`);
  
  return transformedData;
}

/**
 * Transform Yelp data
 */
function transformYelpData(rawData: any, sourceId: string, externalId: string) {
  // Extract the relevant fields from the Yelp data
  const {
    name,
    location,
    phone,
    url,
    categories,
    coordinates,
    is_closed,
    hours,
    photos,
    rating,
    review_count,
  } = rawData;
  
  // Format address from Yelp location object
  const address = location?.display_address?.join(', ') || '';
  
  // Transform to our business schema
  const transformedData = {
    name: name,
    address: address,
    phone: phone || null,
    website: url || null,
    categories: categories?.map((cat: any) => cat.alias) || [],
    location: coordinates ? {
      lat: coordinates.latitude,
      lng: coordinates.longitude,
    } : null,
    status: is_closed ? 'CLOSED' : 'OPERATIONAL',
    hours: hours?.[0]?.open?.map((h: any) => 
      `${h.day}: ${h.start} - ${h.end}`
    ) || null,
    photo_urls: photos || [],
    rating: rating || null,
    rating_count: review_count || 0,
    source_id: sourceId,
    external_id: externalId,
    last_scanned: new Date().toISOString(),
    raw_data: rawData, // Store the original data for reference
  };
  
  logger.debug(`Transformed Yelp data: ${JSON.stringify(transformedData, null, 2)}`);
  
  return transformedData;
}

/**
 * Transform generic business data
 */
function transformGenericData(rawData: any, sourceId: string, externalId: string) {
  // Basic transformation for generic data sources
  // Use raw properties directly if they match our schema
  const transformedData = {
    name: rawData.name || rawData.business_name || 'Unknown Business',
    address: rawData.address || rawData.formatted_address || null,
    phone: rawData.phone || rawData.phone_number || null,
    website: rawData.website || rawData.url || null,
    categories: rawData.categories || rawData.types || [],
    location: rawData.location || rawData.coordinates || null,
    status: rawData.status || 'OPERATIONAL',
    hours: rawData.hours || null,
    photo_urls: rawData.photos || rawData.photo_urls || [],
    rating: rawData.rating || null,
    rating_count: rawData.rating_count || rawData.review_count || 0,
    source_id: sourceId,
    external_id: externalId,
    last_scanned: new Date().toISOString(),
    raw_data: rawData, // Store the original data for reference
  };
  
  logger.debug(`Transformed generic data: ${JSON.stringify(transformedData, null, 2)}`);
  
  return transformedData;
}

/**
 * Queue raw business data for processing
 */
export async function queueRawBusinessDataProcessing(rawDataId: string, priority = 'normal') {
  logger.info(`Queueing raw business data processing for ID: ${rawDataId} with priority: ${priority}`);
  
  try {
    const job = await dataProcessingQueue.add(
      'process-raw-data',
      { id: rawDataId },
      { 
        priority: priority === 'high' ? 1 : priority === 'low' ? 10 : 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: true,
        removeOnFail: false
      }
    );
    
    return {
      jobId: job.id as string,
      status: 'queued'
    };
  } catch (error: any) {
    logger.error(`Failed to queue data processing job: ${error.message}`, { error });
    throw error;
  }
}

/**
 * Set up the data processing queue
 */
export function setupDataProcessingQueue() {
  logger.info(`Setting up data processing queue: ${DATA_PROCESSING_QUEUE}`);
  
  // Register processor
  dataProcessingQueue.process('process-raw-data', processRawBusinessData);
  
  return dataProcessingQueue;
}

/**
 * Get metrics for the data processing queue
 */
export async function getDataProcessingMetrics() {
  try {
    // Queue statistics
    const [
      activeCount,
      completedCount,
      failedCount,
      delayedCount,
      waitingCount,
      jobCounts,
    ] = await Promise.all([
      dataProcessingQueue.getActiveCount(),
      dataProcessingQueue.getCompletedCount(),
      dataProcessingQueue.getFailedCount(),
      dataProcessingQueue.getDelayedCount(),
      dataProcessingQueue.getWaitingCount(),
      dataProcessingQueue.getJobCounts(),
    ]);
    
    return {
      queueName: DATA_PROCESSING_QUEUE,
      active: activeCount,
      completed: completedCount,
      failed: failedCount,
      delayed: delayedCount,
      waiting: waitingCount,
      jobCounts,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error(`Failed to get data processing metrics: ${error}`);
    throw error;
  }
}

// Export the queue for use in other modules
export { dataProcessingQueue };
