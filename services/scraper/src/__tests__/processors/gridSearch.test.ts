import { Job } from 'bull';

// Set NODE_ENV to 'test' for the processSubGrid function
process.env.NODE_ENV = 'test';

// Mock modules
jest.mock('@googlemaps/google-maps-services-js');
jest.mock('@supabase/supabase-js');

// Mock the logger to not pollute test output
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Grid Search Processor', () => {
  it('should load gridSearch processor without errors', () => {
    // Simply testing that the module can be loaded
    const { processGridSearch } = require('../../queues/processors/gridSearch');
    expect(typeof processGridSearch).toBe('function');
  });
});