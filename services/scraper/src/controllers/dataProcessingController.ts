import { Request } from 'express';
import { Response } from 'express';
import { logger } from '../utils/logger.js';
import { 
  queueRawBusinessDataProcessing, 
  getDataProcessingMetrics
} from '../processors/dataProcessor.js';
import { getSupabaseClient } from '../utils/database.js';
import { Queue, Job } from 'bull';
import { getDataProcessingQueue } from '../queues/index.js';

// Queue instance
const dataProcessingQueue: Queue | null = null;

// Define request types
interface ProcessDataRequest extends Request {
  body: {
    id: string;
  };
}

interface ProcessMultipleDataRequest extends Request {
  body: {
    ids: string[];
  };
}

interface GetJobStatusRequest extends Request {
  params: {
    jobId: string;
  };
}

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

/**
 * Process a single raw business data record
 */
export const processData = async (req: ProcessDataRequest, res: Express.Response): Promise<void> => {
  try {
    const { id } = req.body;

    if (!id) {
      res.status(400).json({ error: 'ID is required' });
      return;
    }

    const job = await queueRawBusinessDataProcessing(id);
    res.status(200).json({ jobId: job.id });
  } catch (error: unknown) {
    logger.error('Error queueing data processing:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};

/**
 * Process multiple raw business data records
 */
export const processMultipleData = async (req: ProcessMultipleDataRequest, res: Express.Response): Promise<void> => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'Array of IDs is required' });
      return;
    }

    const jobs = await Promise.all(ids.map(id => queueRawBusinessDataProcessing(id)));
    res.status(200).json({ jobIds: jobs.map((job: Job<DataProcessingJobData>) => job.id) });
  } catch (error: unknown) {
    logger.error('Error queueing multiple data processing:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};

/**
 * Get job status
 */
export const getJobStatus = async (req: GetJobStatusRequest, res: Express.Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const queue = await getDataProcessingQueue();
    const job = await queue.getJob(jobId) as ExtendedJob<DataProcessingJobData>;

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const jobState = await job.getState();
    const jobInfo: JobResponse = {
      id: job.id,
      state: jobState,
      data: job.data,
      opts: job.opts,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      stacktrace: Array.isArray(job.stacktrace) ? job.stacktrace : [],
      returnvalue: job.returnvalue,
      timestamp: new Date(job.timestamp).toISOString()
    };

    res.status(200).json(jobInfo);
  } catch (error: unknown) {
    logger.error('Error getting job status:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};

/**
 * Get data processing queue metrics
 */
export const getQueueMetrics = async (_req: Request, res: Express.Response): Promise<void> => {
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
export const getUnprocessedDataCounts = async (_req: Request, res: Express.Response): Promise<void> => {
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
