import { Job } from 'bull';
import { Client } from '@googlemaps/google-maps-services-js';

// Mock modules
jest.mock('@googlemaps/google-maps-services-js');
jest.mock('@supabase/supabase-js', () => {
  const mockInsert = jest.fn();
  const mockRpc = jest.fn();
  const updateChainMethods = {
    eq: jest.fn()
  };
  const mockUpdate = jest.fn().mockReturnValue(updateChainMethods);
  
  return {
    createClient: jest.fn(() => ({
      from: jest.fn().mockImplementation((table) => {
        if (table === 'businesses') {
          return { insert: mockInsert };
        } else if (table === 'scraper_grid') {
          return { update: mockUpdate };
        }
        return {};
      }),
      rpc: mockRpc
    })),
    mockInsert,
    mockRpc,
    mockUpdate,
    updateChainMethods
  };
});

// Mock the logger to not pollute test output
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Grid Search Processor', () => {
  // Get mock functions from the module mock
  const { mockInsert, mockRpc, mockUpdate, updateChainMethods } = require('@supabase/supabase-js');

  // Google Maps client mock
  const mockPlacesNearby = jest.fn();
  const mockClient = {
    placesNearby: mockPlacesNearby
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    // Setup Google Maps mock
    (Client as unknown as jest.Mock).mockImplementation(() => mockClient);

    // Default mock responses
    mockPlacesNearby.mockResolvedValue({
      data: {
        results: [
          {
            place_id: 'place123',
            name: 'Test Business',
            vicinity: '123 Test St',
            geometry: {
              location: { lat: 45.42, lng: -75.69 }
            },
            types: ['restaurant']
          }
        ],
        status: 'OK'
      }
    });
    mockInsert.mockResolvedValue({ data: [{ id: 'business1' }], error: null });
    mockRpc.mockResolvedValue({ data: { success: true }, error: null });
    updateChainMethods.eq.mockResolvedValue({ data: null, error: null });

    // Set environment variables
    process.env.GOOGLE_MAPS_API_KEY = 'test-api-key';
  });

  it('should process a grid search job successfully', async () => {
    const mockJob = {
      data: {
        scraperRunId: 'run123',
        gridId: 'grid123',
        lat: 45.4165,
        lng: -75.6922,
        radius: 1000,
        type: 'restaurant'
      }
    };

    // Test the processor
    const { processGridSearch } = require('../../queues/processors/gridSearch');
    const result = await processGridSearch(mockJob as Job);

    // Verify the results
    expect(result).toHaveProperty('businessesFound', 1);
    expect(result).toHaveProperty('duplicatesSkipped', 0);
    
    // Verify the places nearby API was called with appropriate parameters
    expect(mockPlacesNearby).toHaveBeenCalledWith({
      params: {
        location: { lat: 45.4165, lng: -75.6922 },
        radius: 1000,
        type: 'restaurant',
        key: 'test-api-key'
      },
      timeout: 10000
    });
    
    // Verify data was inserted for the business
    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        place_id: 'place123',
        name: 'Test Business',
        address: '123 Test St',
        latitude: 45.42,
        longitude: -75.69,
        business_types: ['restaurant']
      })
    ]);
    
    // Verify stats were updated
    expect(mockRpc).toHaveBeenCalledWith('increment_scraper_run_stats', {
      scraper_run_id: 'run123',
      businesses_found: 1
    });
    
    // Verify grid was marked as processed
    expect(mockUpdate).toHaveBeenCalledWith({
      processed: true,
      businesses_found: 1,
      last_processed: expect.any(String)
    });
    expect(updateChainMethods.eq).toHaveBeenCalledWith('id', 'grid123');
  });

  it('should handle duplicate businesses', async () => {
    // Setup insert to return a 23505 error (Postgres unique violation)
    const uniqueViolationError = new Error('Unique violation');
    (uniqueViolationError as any).code = '23505'; 
    mockInsert.mockResolvedValue({ data: null, error: uniqueViolationError });
    
    const mockJob = {
      data: {
        scraperRunId: 'run123',
        gridId: 'grid123',
        lat: 45.4165,
        lng: -75.6922,
        radius: 1000,
        type: 'restaurant'
      }
    };
    
    // Test the processor
    const { processGridSearch } = require('../../queues/processors/gridSearch');
    const result = await processGridSearch(mockJob as Job);
    
    // Should still succeed but with duplicates skipped
    expect(result).toHaveProperty('businessesFound', 0);
    expect(result).toHaveProperty('duplicatesSkipped', 1);
    
    // Stats should not be incremented for duplicates
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('should handle database errors for insert', async () => {
    const dbError = new Error('Database error');
    mockInsert.mockResolvedValue({ data: null, error: dbError });

    const mockJob = {
      data: {
        scraperRunId: 'run123',
        gridId: 'grid123',
        lat: 45.4165,
        lng: -75.6922,
        radius: 1000,
        type: 'restaurant'
      }
    };
    
    // Test the processor
    const { processGridSearch } = require('../../queues/processors/gridSearch');
    const result = await processGridSearch(mockJob as Job);
    
    // Should include retry info
    expect(result).toHaveProperty('shouldRetry', true);
    expect(result).toHaveProperty('retryCount', 1);
    expect(result).toHaveProperty('error', 'Failed to insert business data: Database error');
    
    // Stats should not be updated
    expect(mockRpc).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should handle stats update errors', async () => {
    const statsError = new Error('Stats update failed');
    mockRpc.mockResolvedValue({ data: null, error: statsError });

    const mockJob = {
      data: {
        scraperRunId: 'run123',
        gridId: 'grid123',
        lat: 45.4165,
        lng: -75.6922,
        radius: 1000,
        type: 'restaurant'
      }
    };
    
    // Test the processor
    const { processGridSearch } = require('../../queues/processors/gridSearch');
    const result = await processGridSearch(mockJob as Job);
    
    // Should include retry info
    expect(result).toHaveProperty('shouldRetry', true);
    expect(result).toHaveProperty('retryCount', 1);
    expect(result).toHaveProperty('error', 'Failed to update scraper run stats: Stats update failed');
    
    // Grid update should not be called
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should handle grid update errors', async () => {
    const gridError = new Error('Grid update failed');
    updateChainMethods.eq.mockResolvedValue({ data: null, error: gridError });

    const mockJob = {
      data: {
        scraperRunId: 'run123',
        gridId: 'grid123',
        lat: 45.4165,
        lng: -75.6922,
        radius: 1000,
        type: 'restaurant'
      }
    };
    
    // Test the processor
    const { processGridSearch } = require('../../queues/processors/gridSearch');
    const result = await processGridSearch(mockJob as Job);
    
    // Should include retry info
    expect(result).toHaveProperty('shouldRetry', true);
    expect(result).toHaveProperty('retryCount', 1);
    expect(result).toHaveProperty('error', 'Failed to update grid record: Grid update failed');
  });

  it('should handle API errors', async () => {
    mockPlacesNearby.mockRejectedValue(new Error('API request failed'));
    
    const mockJob = {
      data: {
        scraperRunId: 'run123',
        gridId: 'grid123',
        lat: 45.4165,
        lng: -75.6922,
        radius: 1000,
        type: 'restaurant'
      }
    };
    
    // Test the processor
    const { processGridSearch } = require('../../queues/processors/gridSearch');
    const result = await processGridSearch(mockJob as Job);
    
    // Should include retry info
    expect(result).toHaveProperty('shouldRetry', true);
    expect(result).toHaveProperty('retryCount', 1);
    expect(result).toHaveProperty('error', 'API request failed');
    
    // Database operations should not be called
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  }, 10000); // Increase timeout for this test
});