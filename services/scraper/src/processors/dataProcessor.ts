import { logger } from '../utils/logger.js';
import { getSupabaseClient, markRawBusinessDataProcessed, saveBusiness } from '../utils/database.js';
import Queue from 'bull';
import { SupabaseClient } from '@supabase/supabase-js';
import { Job } from 'bull';
import { QUEUE_NAMES } from '../queues/index.js';
import { getRedisClient } from '../config/redis.js';
import { QUEUE_CONFIG, createRedisClientFactory } from '../queues/config.js';

// Define interfaces for our data structures
interface RawBusinessData {
  id: string;
  raw_data: any;
  source_id: string;
  external_id: string;
  processed: boolean;
  error?: string;
  created_at: string;
  updated_at: string;
}

interface ProcessedBusinessData {
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  categories: string[];
  location: {
    lat: number;
    lng: number;
  } | null;
  status: string;
  hours: string[] | null;
  photo_urls: string[];
  rating: number | null;
  rating_count: number;
  source_id: string;
  external_id: string;
  last_scanned: string;
  raw_data: any;
}

interface JobData {
  id: string;
}

interface JobResult {
  businessId: string;
  metrics: {
    processingTimeMs: number;
    status: 'success' | 'failed';
    errorType: string | null;
  };
}

// Use the data processing queue name from centralized configuration
const DATA_PROCESSING_QUEUE = QUEUE_NAMES.DATA_PROCESSING;

// Initialize queue with Redis client from centralized configuration
export async function setupDataProcessingQueue() {
  // Create a Redis client factory for this queue
  const redisClientFactory = createRedisClientFactory();
  
  const queue = new Queue(DATA_PROCESSING_QUEUE, {
    createClient: (type: 'client' | 'subscriber' | 'bclient') => redisClientFactory(type),
    defaultJobOptions: {
      ...QUEUE_CONFIG.defaultJobOptions,
      timeout: 600000 // 10 minutes for data processing
    },
    settings: QUEUE_CONFIG.settings,
    limiter: {
      ...QUEUE_CONFIG.limiter,
      max: 2, // Limit to 2 concurrent data processing jobs
      duration: 10000 // 10 seconds
    }
  });

  // Set up event handlers
  queue.on('error', (error: Error) => {
    logger.error(`Data processing queue error:`, error);
  });

  queue.on('failed', (job: Queue.Job, error: Error) => {
    logger.error(`Data processing job ${job.id} failed:`, {
      jobId: job.id,
      error: error.message,
      stackTrace: error.stack,
      attempts: job.attemptsMade,
      data: job.data
    });
  });

  queue.on('completed', (job: Queue.Job) => {
    logger.info(`Data processing job ${job.id} completed successfully`, {
      jobId: job.id,
      processingTime: job.finishedOn ? job.finishedOn - job.processedOn! : undefined,
      attempts: job.attemptsMade
    });
  });

  // Set up processor
  queue.process('process-raw-data', processRawBusinessData);

  // Validate queue is operational
  try {
    await queue.isReady();
    const counts = await queue.getJobCounts();
    logger.info(`Data processing queue initialized successfully`, { 
      status: 'ready',
      counts,
      redis: queue.client ? 'connected' : 'disconnected'
    });
  } catch (error: any) {
    logger.error(`Failed to initialize data processing queue: ${error.message}`);
    throw error;
  }

  return queue;
}

/**
 * Process raw business data from the database
 */
export async function processRawBusinessData(job: Job<JobData>): Promise<JobResult> {
  const { id } = job.data;
  const startTime = Date.now();
  let metrics = {
    processingTimeMs: 0,
    status: 'failed' as 'success' | 'failed',
    errorType: null as string | null,
  };

  logger.info(`Processing raw business data with ID: ${id}`, {
    jobId: job.id,
    attempt: job.attemptsMade + 1
  });
  
  try {
    const supabase = getSupabaseClient();
    
    // Set a timeout for the entire processing
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Processing timeout exceeded'));
      }, 240000); // 4 minutes (less than the queue timeout)
    });

    // Fetch and process data with timeout
    const processingPromise = async () => {
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
      
      return savedBusiness;
    };

    // Race between processing and timeout
    const savedBusiness = await Promise.race([
      processingPromise(),
      timeoutPromise
    ]);
    
    // Update metrics for success
    metrics.processingTimeMs = Date.now() - startTime;
    metrics.status = 'success';
    
    // Return the processing result
    return {
      businessId: savedBusiness.id,
      metrics,
    };
  } catch (error: any) {
    // Update metrics for failure
    metrics.processingTimeMs = Date.now() - startTime;
    metrics.status = 'failed';
    metrics.errorType = error.name || 'UnknownError';
    
    // Log detailed error information
    logger.error(`Error processing raw business data: ${error.message}`, { 
      error,
      rawDataId: id,
      jobId: job.id,
      attempt: job.attemptsMade + 1,
      metrics,
      stack: error.stack
    });
    
    // Mark as processed with error
    try {
      await markRawBusinessDataProcessed(id, false, error.message);
    } catch (markError: any) {
      logger.error(`Failed to mark raw data as processed with error: ${markError.message}`, {
        originalError: error,
        markError
      });
    }
    
    // Determine if we should retry based on the error type
    if (error.message.includes('timeout') && job.attemptsMade < job.opts.attempts! - 1) {
      logger.info(`Scheduling retry for job ${job.id} due to timeout`);
      throw error; // This will trigger a retry
    }
    
    // For other errors or final attempts, mark as failed
    return {
      businessId: '',
      metrics,
    };
  }
}

/**
 * Transform raw business data into processed business data
 */
async function transformBusinessData(rawData: RawBusinessData, supabase: SupabaseClient): Promise<ProcessedBusinessData> {
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
function transformGooglePlacesData(rawData: any, sourceId: string, externalId: string): ProcessedBusinessData {
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
function transformYelpData(rawData: any, sourceId: string, externalId: string): ProcessedBusinessData {
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
function transformGenericData(rawData: any, sourceId: string, externalId: string): ProcessedBusinessData {
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
 * Queue raw business data for processing with improved error handling
 */
export async function queueRawBusinessDataProcessing(rawDataId: string, priority: 'high' | 'normal' | 'low' = 'normal') {
  try {
    const queue = await setupDataProcessingQueue();
    
    const jobOptions = {
      ...QUEUE_CONFIG.defaultJobOptions,
      priority: priority === 'high' ? 1 : priority === 'normal' ? 2 : 3,
      jobId: `process_raw_data_${rawDataId}`, // Ensure unique job ID
      attempts: 5, // More attempts for data processing
      backoff: {
        type: 'exponential',
        delay: 5000 // Start with 5 seconds
      }
    };

    const job = await queue.add({ id: rawDataId }, jobOptions);
    
    logger.info(`Queued raw business data processing`, {
      rawDataId,
      jobId: job.id,
      priority,
      options: jobOptions
    });

    return job;
  } catch (error: any) {
    logger.error(`Failed to queue raw business data processing:`, {
      rawDataId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Get metrics about the data processing queue
 */
export async function getDataProcessingMetrics() {
  try {
    const queue = await setupDataProcessingQueue();
    const counts = await queue.getJobCounts();
    
    const [active, delayed, waiting, completed, failed] = await Promise.all([
      queue.getActive(),
      queue.getDelayed(),
      queue.getWaiting(),
      queue.getCompleted(),
      queue.getFailed()
    ]);
    
    return {
      ...counts,
      queueName: DATA_PROCESSING_QUEUE,
      timestamp: new Date().toISOString(),
      activeJobs: active.length,
      delayedJobs: delayed.length,
      waitingJobs: waiting.length,
      completedJobs: completed.length,
      failedJobs: failed.length
    };
  } catch (error: any) {
    logger.error('Failed to get data processing metrics:', error);
    throw error;
  }
}
