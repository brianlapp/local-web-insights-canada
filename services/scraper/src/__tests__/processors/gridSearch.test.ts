import { Job } from 'bull';
import { processGridSearch } from '../../queues/processors/gridSearch';
import { createMockSupabaseClient } from '../utils/database.mocks';
import { Client, PlacesNearbyResponseData } from '@googlemaps/google-maps-services-js';

// Define mock function at the top level
const mockPlacesNearby = jest.fn();

// Use standard mock factory referencing the top-level mock
jest.mock('@googlemaps/google-maps-services-js', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        placesNearby: mockPlacesNearby // Reference the mock defined above
      };
    })
  };
});

jest.mock('@supabase/supabase-js'); 
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Grid Search Processor', () => {
  const { mockClient: mockSupabaseClient, mockInsert, mockUpdate, mockRpc } = createMockSupabaseClient();
  // No spy needed

  beforeEach(() => {
    jest.clearAllMocks();

    // Configure Supabase mock (simple strategy)
    jest.mocked(require('@supabase/supabase-js')).createClient.mockReturnValue(mockSupabaseClient);
    mockInsert.mockReset().mockResolvedValue({ data: null, error: null });
    mockUpdate.mockReset().mockResolvedValue({ data: null, error: null });
    mockRpc.mockReset().mockResolvedValue({ data: null, error: null });

    // Reset the top-level mock function
    mockPlacesNearby.mockReset().mockResolvedValue({
      data: {
        results: [{ place_id: 'test-place-1', name: 'Test Restaurant', types: ['restaurant'] }],
        status: 'OK'
      }
    } as any);

    process.env.GOOGLE_MAPS_API_KEY = 'test-api-key';
    process.env.SUPABASE_URL = 'http://test-url';
    process.env.SUPABASE_SERVICE_KEY = 'test-key';
  });

  afterEach(() => {
    // No cleanup needed for this mock pattern
  });

  const mockJob = {
    data: {
      grid: {
        id: 'test-grid-1',
        name: 'Test Grid',
        bounds: {
          northeast: { lat: 45.4166, lng: -75.6921 },
          southwest: { lat: 45.4164, lng: -75.6923 }
        }
      },
      category: 'restaurant',
      scraperRunId: 'test-run-1'
    }
  };

  it('should process a grid search job successfully', async () => {
    await processGridSearch(mockJob as Job);
    // Use the top-level mock function for assertions
    expect(mockPlacesNearby).toHaveBeenCalledWith({
      params: {
        location: { lat: 45.4165, lng: -75.6922 },
        radius: 1000,
        type: 'restaurant',
        key: 'test-api-key',
        pagetoken: undefined
      },
      timeout: 5000
    });
    // Verify data was inserted correctly
    expect(mockInsert).toHaveBeenCalledWith({
      source_id: 'google-places',
      external_id: 'test-place-1',
      raw_data: expect.any(Object),
      processed: false
    });
    // Verify stats were updated
    expect(mockRpc).toHaveBeenCalledWith('update_scraper_run_stats', {
      run_id: 'test-run-1',
      businesses_found: 1
    });
    // Verify grid was updated
    expect(mockUpdate).toHaveBeenCalledWith({ last_scraped: expect.any(String) });
  });

  it('should process a grid search job successfully with pagination', async () => {
    const firstPageResponseData = {
      results: [{
        place_id: 'test-place-1',
        name: 'Test Business 1',
        vicinity: '123 Test St',
        geometry: {
          location: { lat: 45.4165, lng: -75.6922 },
          viewport: {
            northeast: { lat: 45.4166, lng: -75.6923 },
            southwest: { lat: 45.4164, lng: -75.6921 }
          }
        }
      }],
      next_page_token: 'test-token',
      status: 'OK',
      error_message: ''
    };
    const secondPageResponseData = {
      results: [{
        place_id: 'test-place-2',
        name: 'Test Business 2',
        vicinity: '456 Test St',
        geometry: {
          location: { lat: 45.4166, lng: -75.6923 },
          viewport: {
            northeast: { lat: 45.4166, lng: -75.6923 },
            southwest: { lat: 45.4164, lng: -75.6921 }
          }
        }
      }],
      status: 'OK',
      error_message: ''
    };
    // Setup top-level mock function for pagination test
    mockPlacesNearby
      .mockResolvedValueOnce({ data: firstPageResponseData })
      .mockResolvedValueOnce({ data: secondPageResponseData });
    
    await processGridSearch(mockJob as Job);
    // Use the top-level mock function for assertions
    expect(mockPlacesNearby).toHaveBeenCalledTimes(2);
    // Verify data insertions
    expect(mockInsert).toHaveBeenCalledTimes(2);
  });

  it('should handle empty results', async () => {
    const emptyResponseData = { results: [], status: 'ZERO_RESULTS', error_message: '' };
    mockPlacesNearby.mockResolvedValue({ data: emptyResponseData, status: 200, statusText: 'OK', headers: {}, config: {} as any });

    await processGridSearch(mockJob as Job);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockRpc).toHaveBeenCalledWith('update_scraper_run_stats', {
      run_id: 'test-run-1',
      businesses_found: 0
    });
  });

  it('should handle API errors', async () => {
    // Mock rejection using the top-level mock function
    mockPlacesNearby.mockRejectedValue(new Error('API request failed'));
    await expect(processGridSearch(mockJob as Job)).rejects.toThrow('API request failed');
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    const dbError = { message: 'Database error' };
    mockInsert.mockResolvedValue({ data: null, error: dbError });

    await expect(processGridSearch(mockJob as Job)).rejects.toThrow('Failed to insert business data: Database error');
    expect(mockRpc).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should handle stats update errors', async () => {
    const statsError = { message: 'Stats update failed' };
    mockRpc.mockResolvedValue({ data: null, error: statsError });

    await expect(processGridSearch(mockJob as Job)).rejects.toThrow('Failed to update scraper run stats: Stats update failed');
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should handle grid update errors', async () => {
    const gridError = { message: 'Grid update failed' };
    mockUpdate.mockResolvedValue({ data: null, error: gridError });

    await expect(processGridSearch(mockJob as Job)).rejects.toThrow('Failed to update grid record: Grid update failed');
  });

  it('should handle edge case grid coordinates', async () => {
    const edgeJob = {
      data: {
        grid: {
          id: 'test-grid-2',
          name: 'Edge Grid',
          bounds: {
            // Bounds crossing the antimeridian
            northeast: { lat: 0.001, lng: -179.999 }, // East of antimeridian
            southwest: { lat: -0.001, lng: 179.999 } // West of antimeridian
          }
        },
        category: 'restaurant',
        scraperRunId: 'test-run-2'
      }
    };

    await processGridSearch(edgeJob as Job);

    // Verify the center calculation handled the date line correctly (expected longitude might be 180 or -180)
    expect(mockPlacesNearby).toHaveBeenCalledWith({
      params: {
        location: { lat: 0, lng: -180 }, // Assuming calculation wraps to -180
        radius: 1000,
        type: 'restaurant',
        key: 'test-api-key',
        pagetoken: undefined
      },
      timeout: 5000
    });
  });

  it('should handle rate limit errors', async () => {
    const rateLimitError = { response: { data: { status: 'OVER_QUERY_LIMIT' } } };
    // Mock rejection using the top-level mock function
    mockPlacesNearby.mockRejectedValue(rateLimitError);
    await expect(processGridSearch(mockJob as Job)).rejects.toThrow('OVER_QUERY_LIMIT');
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});