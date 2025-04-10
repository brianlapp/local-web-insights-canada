import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { 
  queueRawBusinessDataProcessing, 
  getDataProcessingMetrics,
  setupDataProcessingQueue
} from '../processors/dataProcessor.js';
import { getSupabaseClient } from '../utils/database.js';
import { Queue } from 'bull';

// Queue instance
let dataProcessingQueue: Queue | null = null;

// Get or initialize queue
async function getQueue(): Promise<Queue> {
  if (!dataProcessingQueue) {
    dataProcessingQueue = await setupDataProcessingQueue();
  }
  return dataProcessingQueue;
}

/**
 * Queue raw business data for processing
 */
export async function queueRawDataProcessing(req: Request, res: Response) {
  try {
    const { id, priority } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Raw data ID is required' });
    }
    
    // Validate that the raw data exists
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('raw_business_data')
      .select('id, processed')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      logger.error(`Error checking raw data existence: ${error.message}`);
      return res.status(500).json({ error: 'Failed to verify raw data existence' });
    }
    
    if (!data) {
      return res.status(404).json({ error: `Raw business data with ID ${id} not found` });
    }
    
    if (data.processed) {
      return res.status(400).json({ 
        error: `Raw business data with ID ${id} has already been processed`,
        processed: true
      });
    }
    
    const jobId = await queueRawBusinessDataProcessing(id, priority);
    
    res.status(200).json({
      message: `Raw business data queued for processing`,
      jobId,
      rawDataId: id
    });
  } catch (error: any) {
    logger.error(`Error queueing raw data for processing: ${error.message}`);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

/**
 * Queue multiple raw business data items for processing
 */
export async function queueBatchRawDataProcessing(req: Request, res: Response) {
  try {
    const { ids, priority } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'A valid array of raw data IDs is required' });
    }
    
    const supabase = getSupabaseClient();
    
    // Get all raw data items that haven't been processed yet
    const { data, error } = await supabase
      .from('raw_business_data')
      .select('id')
      .in('id', ids)
      .eq('processed', false);
    
    if (error) {
      logger.error(`Error fetching raw data items: ${error.message}`);
      return res.status(500).json({ error: 'Failed to fetch raw data items' });
    }
    
    if (!data || data.length === 0) {
      return res.status(400).json({ 
        error: 'No valid unprocessed raw data items found',
        count: 0
      });
    }
    
    // Queue each item
    const validIds = data.map((item: any) => item.id);
    const queueResults = await Promise.all(
      validIds.map((id: string) => queueRawBusinessDataProcessing(id, priority))
    );
    
    res.status(200).json({
      message: `Queued ${validIds.length} raw data items for processing`,
      count: validIds.length,
      queuedIds: validIds,
      jobIds: queueResults
    });
  } catch (error: any) {
    logger.error(`Error batch queueing raw data: ${error.message}`);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

/**
 * Get the status of a specific data processing job
 */
export async function getJobStatus(req: Request, res: Response) {
  try {
    const { jobId } = req.params;
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }
    
    const queue = await getQueue();
    const job = await queue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: `Job with ID ${jobId} not found` });
    }
    
    // Get job state
    const state = await job.getState();
    
    // Format response based on state
    const response = {
      id: job.id,
      data: job.data,
      state,
      progress: job.progress,
      attemptsMade: job.attemptsMade,
      timestamp: {
        created: job.timestamp,
        processed: job.processedOn,
        finished: job.finishedOn,
      },
      returnValue: job.returnvalue,
      failReason: job.failedReason,
    };
    
    res.status(200).json(response);
  } catch (error: any) {
    logger.error(`Error getting job status: ${error.message}`);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

/**
 * Get data processing queue metrics
 */
export async function getProcessingMetrics(req: Request, res: Response) {
  try {
    const metrics = await getDataProcessingMetrics();
    res.status(200).json(metrics);
  } catch (error: any) {
    logger.error(`Error getting processing metrics: ${error.message}`);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

/**
 * Get unprocessed raw data counts
 */
export async function getUnprocessedDataCounts(req: Request, res: Response) {
  try {
    const supabase = getSupabaseClient();
    
    // Get count of unprocessed raw data
    const { count, error } = await supabase
      .from('raw_business_data')
      .select('*', { count: 'exact', head: true })
      .eq('processed', false);
    
    if (error) {
      logger.error(`Error getting unprocessed data counts: ${error.message}`);
      return res.status(500).json({ error: 'Failed to get unprocessed data counts' });
    }
    
    // Get source breakdown
    const { data: sourceBreakdown, error: sourceError } = await supabase
      .from('raw_business_data')
      .select('source_id')
      .eq('processed', false);
    
    if (sourceError) {
      logger.error(`Error getting source breakdown: ${sourceError.message}`);
      return res.status(500).json({ error: 'Failed to get source breakdown' });
    }
    
    // Calculate source counts
    const sourceCounts: Record<string, number> = {};
    sourceBreakdown?.forEach((item: any) => {
      const sourceId = item.source_id;
      sourceCounts[sourceId] = (sourceCounts[sourceId] || 0) + 1;
    });
    
    res.status(200).json({
      total: count || 0,
      sourceCounts,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error(`Error getting unprocessed data counts: ${error.message}`);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
