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

// Create global mock Supabase client
const mockUpload = jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null });
const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
const mockRpc = jest.fn().mockResolvedValue({ data: null, error: null });

// Create an updateChain object with an 'eq' method that will be tracked by mockUpdate
const updateChainMethods = {
  eq: jest.fn().mockResolvedValue({ data: null, error: null })
};

// Create mockUpdate that returns the updateChainMethods
const mockUpdate = jest.fn().mockReturnValue(updateChainMethods);

// Create a function that properly chains the methods for 'from'
const mockFrom = jest.fn().mockImplementation((table) => {
  return {
    insert: mockInsert,
    update: mockUpdate
  };
});

// Create mock storage with a 'from' method that returns an object with an 'upload' method
const mockStorage = {
  from: jest.fn().mockReturnValue({
    upload: mockUpload
  })
};

// Create mock client with all necessary methods and properties
const mockClient = {
  storage: mockStorage,
  from: mockFrom,
  rpc: mockRpc
};

// Mock Supabase client globally
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue(mockClient)
}));

// Export mock functions so tests can configure them
export const supabaseMocks = {
  mockClient,
  mockUpload,
  mockUpdate,
  mockInsert,
  mockRpc,
  updateChainMethods,
  mockFrom,
  mockStorage
};

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