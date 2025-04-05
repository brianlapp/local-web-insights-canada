import express from 'express';
import request from 'supertest';
import { Queue } from 'bull';
import { setupRoutes } from '../../routes';

// Mock Bull Queue
const mockAdd = jest.fn();
const mockGetJob = jest.fn();
const mockGetJobCounts = jest.fn();
const mockGetState = jest.fn();

const mockQueue = {
  add: mockAdd,
  getJob: mockGetJob,
  getJobCounts: mockGetJobCounts
} as unknown as Queue;

const mockJob = {
  id: 'test-job-1',
  data: { test: 'data' },
  getState: mockGetState,
  progress: jest.fn().mockReturnValue(50),
  returnvalue: { result: 'success' },
  failedReason: null
};

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('Scraper Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocks to default successful responses
    mockAdd.mockResolvedValue({ id: 'test-job-1' });
    mockGetJob.mockResolvedValue(mockJob);
    mockGetJobCounts.mockResolvedValue({
      active: 1,
      completed: 2,
      failed: 0,
      delayed: 0,
      waiting: 1
    });
    mockGetState.mockResolvedValue('active');

    // Setup express app with routes
    app = express();
    app.use(express.json());
    app.use('/', setupRoutes(mockQueue, mockQueue));
  });

  describe('Health Check', () => {
    it('should return ok status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('Queue Status', () => {
    it('should return status of both queues', async () => {
      const response = await request(app)
        .get('/status')
        .expect(200);

      expect(response.body).toEqual({
        scraper: {
          active: 1,
          completed: 2,
          failed: 0,
          delayed: 0,
          waiting: 1
        },
        audit: {
          active: 1,
          completed: 2,
          failed: 0,
          delayed: 0,
          waiting: 1
        }
      });
    });

    it('should handle queue status errors', async () => {
      mockGetJobCounts.mockRejectedValueOnce(new Error('Queue error'));

      await request(app)
        .get('/status')
        .expect(500)
        .expect({ error: 'Failed to get queue status' });
    });
  });

  describe('Grid Search', () => {
    const validSearchRequest = {
      gridId: 'test-grid-1',
      gridName: 'Test Grid',
      bounds: {
        northeast: { lat: 45.4215, lng: -75.6972 },
        southwest: { lat: 45.4115, lng: -75.6872 }
      },
      category: 'restaurant',
      scraperRunId: 'test-run-1'
    };

    it('should queue a valid grid search job', async () => {
      const response = await request(app)
        .post('/search')
        .send(validSearchRequest)
        .expect(200);

      expect(response.body).toEqual({
        jobId: 'test-job-1',
        status: 'queued'
      });

      expect(mockAdd).toHaveBeenCalledWith('search-grid', {
        grid: {
          id: 'test-grid-1',
          name: 'Test Grid',
          bounds: validSearchRequest.bounds
        },
        category: 'restaurant',
        scraperRunId: 'test-run-1'
      });
    });

    it('should reject invalid grid search requests', async () => {
      const invalidRequest = { ...validSearchRequest, gridId: undefined };

      await request(app)
        .post('/search')
        .send(invalidRequest)
        .expect(400)
        .expect({ error: 'Missing required fields' });
    });

    it('should handle queue errors', async () => {
      mockAdd.mockRejectedValueOnce(new Error('Queue error'));

      await request(app)
        .post('/search')
        .send(validSearchRequest)
        .expect(500)
        .expect({ error: 'Failed to queue grid search' });
    });
  });

  describe('Website Audit', () => {
    const validAuditRequest = {
      businessId: 'test-business-1',
      url: 'https://test.com'
    };

    it('should queue a valid website audit job', async () => {
      const response = await request(app)
        .post('/audit')
        .send(validAuditRequest)
        .expect(200);

      expect(response.body).toEqual({
        jobId: 'test-job-1',
        status: 'queued'
      });

      expect(mockAdd).toHaveBeenCalledWith('audit-website', validAuditRequest);
    });

    it('should reject invalid website audit requests', async () => {
      const invalidRequest = { ...validAuditRequest, url: undefined };

      await request(app)
        .post('/audit')
        .send(invalidRequest)
        .expect(400)
        .expect({ error: 'Missing required fields' });
    });

    it('should reject invalid URLs', async () => {
      const invalidRequest = { ...validAuditRequest, url: 'not-a-url' };

      await request(app)
        .post('/audit')
        .send(invalidRequest)
        .expect(400)
        .expect({ error: 'Invalid URL format' });
    });

    it('should handle queue errors', async () => {
      mockAdd.mockRejectedValueOnce(new Error('Queue error'));

      await request(app)
        .post('/audit')
        .send(validAuditRequest)
        .expect(500)
        .expect({ error: 'Failed to queue website audit' });
    });
  });

  describe('Job Status', () => {
    it('should return job status for existing job', async () => {
      mockGetJob.mockResolvedValueOnce(mockJob);

      const response = await request(app)
        .get('/jobs/test-job-1')
        .expect(200);

      expect(response.body).toEqual({
        id: 'test-job-1',
        state: 'active',
        progress: 50,
        data: { test: 'data' },
        result: { result: 'success' },
        failedReason: null
      });
    });

    it('should handle non-existent jobs', async () => {
      // Mock both queues returning null for the job
      mockGetJob
        .mockResolvedValueOnce(null)  // First queue
        .mockResolvedValueOnce(null); // Second queue

      await request(app)
        .get('/jobs/non-existent')
        .expect(404)
        .expect({ error: 'Job not found' });
    });

    it('should handle job status errors', async () => {
      mockGetJob.mockRejectedValueOnce(new Error('Job error'));

      await request(app)
        .get('/jobs/test-job-1')
        .expect(500)
        .expect({ error: 'Failed to get job status' });
    });
  });
}); 