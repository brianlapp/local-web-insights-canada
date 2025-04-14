import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { logger } from '../utils/logger.js';
import { 
  queueRawBusinessDataProcessing, 
  getDataProcessingMetrics
} from '../processors/dataProcessor.js';
import { getSupabaseClient } from '../utils/database.js';
import { Queue, Job } from 'bull';
import { getDataProcessingQueue } from '../queues/index.js';
import { supabase } from '../utils/supabase.js';

// Queue instance
let dataProcessingQueue: Queue | null = null;

// Define request types
interface ProcessDataRequest extends ExpressRequest {
  body: {
    id: string;
  };
}

interface ProcessMultipleDataRequest extends ExpressRequest {
  body: {
    ids: string[];
  };
}

interface GetJobStatusRequest extends ExpressRequest {
  params: {
    jobId: string;
  };
}

type Response<T> = ExpressResponse<T>;

// Define job data type
interface DataProcessingJobData {
  id: string;
}

// Define job options type
interface JobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
  timeout?: number;
}

// Define job response type
interface JobResponse {
  id: string;
  state: string;
  data: DataProcessingJobData;
  opts: JobOptions;
  attemptsMade: number;
  failedReason?: string;
  stacktrace: string[];
  returnvalue: unknown;
  timestamp: string;
}

// Define extended Job type with getState method
interface ExtendedJob<T> extends Job<T> {
  getState(): Promise<string>;
  returnvalue: unknown;
}

// Define raw business data type
interface RawBusinessData {
  source_id: string;
  count: number;
}

interface ErrorResponse {
  error: string;
}

interface JobIdResponse {
  jobId: string;
}

interface JobIdsResponse {
  jobIds: string[];
}

/**
 * Process a single raw business data record
 */
export async function processData(
  req: ProcessDataRequest,
  res: ExpressResponse
): Promise<void> {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json({ error: 'Missing id in request body' });
      return;
    }

    const queue = await getDataProcessingQueue();
    const job = await queue.add({ id });

    res.status(200).json({ jobId: job.id });
  } catch (error) {
    logger.error('Error processing data:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
  }
}

/**
 * Process multiple raw business data records
 */
export async function processMultipleData(
  req: ProcessMultipleDataRequest,
  res: ExpressResponse
): Promise<void> {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      res.status(400).json({ error: 'Missing or invalid ids in request body' });
      return;
    }

    const queue = await getDataProcessingQueue();
    const jobs = await Promise.all(ids.map(id => queue.add({ id })));

    res.status(200).json({ jobIds: jobs.map(job => job.id) });
  } catch (error) {
    logger.error('Error processing multiple data:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
  }
}

/**
 * Get job status
 */
export async function getJobStatus(
  req: GetJobStatusRequest,
  res: ExpressResponse
): Promise<void> {
  try {
    const { jobId } = req.params;
    const queue = await getDataProcessingQueue();
    const job = await queue.getJob(jobId);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const state = await job.getState();
    res.status(200).json({
      id: job.id,
      state,
      data: job.data
    });
  } catch (error) {
    logger.error('Error getting job status:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
  }
}

/**
 * Get data processing queue metrics
 */
export const getQueueMetrics = async (
  _req: ExpressRequest,
  res: ExpressResponse
): Promise<void> => {
  try {
    const queue = await getDataProcessingQueue();
    const metrics = await queue.getJobCounts();
    res.status(200).json(metrics);
  } catch (error: unknown) {
    logger.error('Error getting queue metrics:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};

/**
 * Get unprocessed raw data counts
 */
export const getUnprocessedDataCounts = async (
  _req: ExpressRequest,
  res: ExpressResponse
): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_unprocessed_data_counts');

    if (error) {
      throw error;
    }

    const counts = (data as RawBusinessData[]).reduce((acc: Record<string, number>, row: RawBusinessData) => {
      acc[row.source_id] = row.count;
      return acc;
    }, {});

    res.status(200).json(counts);
  } catch (error: unknown) {
    logger.error('Error getting unprocessed data counts:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};
