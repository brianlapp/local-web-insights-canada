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

// Create a mock update function that returns the updateChain object
const mockUpdate = jest.fn().mockReturnValue(updateChainMethods);

// Create a mock from function that returns a select chain
const mockFrom = jest.fn().mockImplementation((table: string) => {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      order: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue({ data: [], error: null })
      })
    }),
    insert: mockInsert,
    update: mockUpdate,
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: null, error: null })
    })
  };
});

// Create a mock client object
const mockClient = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      order: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue({ data: [], error: null })
      })
    }),
    insert: mockInsert,
    update: mockUpdate,
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: null, error: null })
    })
  }),
  storage: {
    from: jest.fn().mockReturnValue({
      upload: mockUpload
    })
  },
  rpc: mockRpc
};

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue(mockClient)
}));

// Mock the Redis client
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(true),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue('OK')
  }));
});

// Mock Bull queue
jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => ({
    process: jest.fn(),
    add: jest.fn().mockResolvedValue({ id: 'test-job-1' }),
    on: jest.fn(),
    getJob: jest.fn(),
    getJobCounts: jest.fn()
  }));
});

// Export mock functions so tests can configure them
export const supabaseMocks = {
  mockClient,
  mockUpload,
  mockUpdate,
  mockInsert,
  mockRpc,
  updateChainMethods,
  mockFrom,
  mockStorage: {
    from: jest.fn().mockReturnValue({
      upload: mockUpload
    })
  }
};

// REMOVED other global mocks - they will come from __mocks__ directory 