import express from 'express';
import {
  queueRawDataProcessing,
  queueBatchRawDataProcessing,
  getJobStatus,
  getProcessingMetrics,
  getUnprocessedDataCounts
} from '../controllers/dataProcessingController.js';

const router = express.Router();

// Queue a single raw business data item for processing
router.post('/queue', queueRawDataProcessing);

// Queue multiple raw business data items for processing
router.post('/queue-batch', queueBatchRawDataProcessing);

// Get status of a specific job
router.get('/job/:jobId', getJobStatus);

// Get metrics for the data processing queue
router.get('/metrics', getProcessingMetrics);

// Get counts of unprocessed raw data
router.get('/unprocessed', getUnprocessedDataCounts);

export default router;
