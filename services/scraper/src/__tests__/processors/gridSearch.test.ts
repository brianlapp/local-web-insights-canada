import { Job } from 'bull';
import { processGridSearch } from '../../queues/processors/gridSearch';

// Mock modules first
const mockPlacesNearby = jest.fn();
const mockGoogleMapsClient = { placesNearby: mockPlacesNearby };

const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockRpc = jest.fn();
const mockFrom = jest.fn().mockImplementation((table) => {
  if (table === 'raw_business_data') {
    return { insert: mockInsert };
  } else if (table === 'geo_grids') {
    return { update: mockUpdate, eq: jest.fn().mockReturnThis() };
  }
  return {};
});

// Mock the entire Client class
jest.mock('@googlemaps/google-maps-services-js', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      placesNearby: mockPlacesNearby
    }))
  };
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: mockFrom,
    rpc: mockRpc
  })
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

// Set environment variables
process.env.GOOGLE_MAPS_API_KEY = 'test-api-key';
process.env.SUPABASE_URL = 'http://test-url';
process.env.SUPABASE_SERVICE_KEY = 'test-key';

describe('Grid Search Processor', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockPlacesNearby.mockReset();
    mockInsert.mockReset();
    mockUpdate.mockReset();
    mockRpc.mockReset();

    // Set default successful responses
    mockPlacesNearby.mockResolvedValue({
      data: {
        results: [{
          place_id: 'test-place-1',
          name: 'Test Business',
          vicinity: '123 Test St',
          geometry: {
            location: { lat: 45.4165, lng: -75.6922 }
          }
        }]
      }
    });
    mockInsert.mockResolvedValue({ data: null, error: null });
    mockUpdate.mockResolvedValue({ data: null, error: null });
    mockRpc.mockResolvedValue({ data: null, error: null });
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
    const result = await processGridSearch(mockJob as Job);

    expect(result).toEqual({ businessesFound: 1 });

    // Verify Google Places API was called correctly
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
    // First call returns a next page token
    mockPlacesNearby
      .mockResolvedValueOnce({
        data: {
          results: [{
            place_id: 'test-place-1',
            name: 'Test Business 1',
            vicinity: '123 Test St',
            geometry: {
              location: { lat: 45.4165, lng: -75.6922 }
            }
          }],
          next_page_token: 'test-token'
        }
      })
      .mockResolvedValueOnce({
        data: {
          results: [{
            place_id: 'test-place-2',
            name: 'Test Business 2',
            vicinity: '456 Test St',
            geometry: {
              location: { lat: 45.4166, lng: -75.6923 }
            }
          }]
        }
      });

    const result = await processGridSearch(mockJob as Job);

    expect(result).toEqual({ businessesFound: 2 });

    // Verify multiple API calls were made
    expect(mockPlacesNearby).toHaveBeenCalledTimes(2);
    expect(mockPlacesNearby).toHaveBeenNthCalledWith(1, {
      params: {
        location: { lat: 45.4165, lng: -75.6922 },
        radius: 1000,
        type: 'restaurant',
        key: 'test-api-key',
        pagetoken: undefined
      },
      timeout: 5000
    });
    expect(mockPlacesNearby).toHaveBeenNthCalledWith(2, {
      params: {
        location: { lat: 45.4165, lng: -75.6922 },
        radius: 1000,
        type: 'restaurant',
        key: 'test-api-key',
        pagetoken: 'test-token'
      },
      timeout: 5000
    });
  });

  it('should handle empty results', async () => {
    mockPlacesNearby.mockResolvedValue({
      data: {
        results: []
      }
    });

    const result = await processGridSearch(mockJob as Job);
    expect(result).toEqual({ businessesFound: 0 });
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockRpc).toHaveBeenCalledWith('update_scraper_run_stats', {
      run_id: 'test-run-1',
      businesses_found: 0
    });
  });

  it('should handle API errors', async () => {
    mockPlacesNearby.mockRejectedValue(new Error('API request failed'));

    await expect(processGridSearch(mockJob as Job)).rejects.toThrow('API request failed');
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    mockInsert.mockResolvedValue({ data: null, error: { message: 'Database error' } });

    await expect(processGridSearch(mockJob as Job)).rejects.toThrow('Failed to insert business data: Database error');
    expect(mockRpc).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should handle stats update errors', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'Stats update failed' } });

    await expect(processGridSearch(mockJob as Job)).rejects.toThrow('Failed to update scraper run stats: Stats update failed');
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should handle grid update errors', async () => {
    mockUpdate.mockResolvedValue({ data: null, error: { message: 'Grid update failed' } });

    await expect(processGridSearch(mockJob as Job)).rejects.toThrow('Failed to update grid record: Grid update failed');
  });

  it('should handle edge case grid coordinates', async () => {
    const edgeJob = {
      data: {
        grid: {
          id: 'test-grid-2',
          name: 'Edge Grid',
          bounds: {
            northeast: { lat: 0.001, lng: 180 },
            southwest: { lat: -0.001, lng: 179.998 }
          }
        },
        category: 'restaurant',
        scraperRunId: 'test-run-2'
      }
    };

    await processGridSearch(edgeJob as Job);

    // Verify the center calculation handled the date line correctly
    expect(mockPlacesNearby).toHaveBeenCalledWith({
      params: {
        location: { lat: 0, lng: 180 },
        radius: 1000,
        type: 'restaurant',
        key: 'test-api-key',
        pagetoken: undefined
      },
      timeout: 5000
    });
  });

  it('should handle rate limit errors', async () => {
    mockPlacesNearby.mockRejectedValue(new Error('OVER_QUERY_LIMIT'));

    await expect(processGridSearch(mockJob as Job)).rejects.toThrow('OVER_QUERY_LIMIT');
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});