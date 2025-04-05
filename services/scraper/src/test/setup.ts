import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set default environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.GOOGLE_MAPS_API_KEY = 'test_maps_key';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_KEY = 'test_service_key';
process.env.LOG_LEVEL = 'error';

// Mock Bull queue - keep only this mock here since it's used universally
jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => ({
    process: jest.fn(),
    add: jest.fn().mockResolvedValue({ id: 'test-job-1' }),
    on: jest.fn(),
    getJob: jest.fn(),
    getJobCounts: jest.fn()
  }));
});

// REMOVED other global mocks - they will come from __mocks__ directory 