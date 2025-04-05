import { Job } from 'bull';
import { processGridSearch } from '../../queues/processors/gridSearch';
import { Client, PlacesNearbyRequest, PlacesNearbyResponse, Status } from '@googlemaps/google-maps-services-js';
import { createMockSupabaseClient } from '../utils/database.mocks';

// Mock dependencies using jest.fn
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

// Use jest.mock for modules
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: mockFrom,
    rpc: mockRpc
  })
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

// Define the mock function in the test scope
const mockPlacesNearby = jest.fn();

// Mock the entire Client class correctly for Jest
jest.mock('@googlemaps/google-maps-services-js', () => {
  return {
    // Mock the Client constructor
    Client: jest.fn().mockImplementation(() => {
      // Return the instance object referencing the scoped mock function
      return {
        placesNearby: mockPlacesNearby // Use the mock defined outside
      };
    }),
    __esModule: true // Keep ES module interop flag
    // No need to export the mock function here anymore
  };
});

// Set environment variables
process.env.GOOGLE_MAPS_API_KEY = 'test-api-key';
process.env.SUPABASE_URL = 'http://test-url';
process.env.SUPABASE_SERVICE_KEY = 'test-key';

// Create a helper for default viewport to avoid repetition
const defaultViewport = {
  northeast: { lat: 0, lng: 0 },
  southwest: { lat: 0, lng: 0 }
};

describe('Grid Search Processor', () => {
  const { mockClient: mockSupabaseClient, mockInsert, mockUpdate, mockRpc } = createMockSupabaseClient();
  let placesNearbySpy: jest.SpyInstance; // Define spy variable

  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockReset();
    mockUpdate.mockReset();
    mockRpc.mockReset();
    mockPlacesNearby.mockClear(); // Clear the mock function defined in the test scope

    // Configure Supabase mock
    jest.mocked(require('@supabase/supabase-js')).createClient.mockReturnValue(mockSupabaseClient);
    mockInsert.mockResolvedValue({ data: null, error: null });
    mockUpdate.mockResolvedValue({ data: null, error: null });
    mockRpc.mockResolvedValue({ data: null, error: null });

    // 3. Create the spy on the actual Client prototype
    placesNearbySpy = jest.spyOn(Client.prototype, 'placesNearby');
    // 4. Set default mock implementation for the spy
    placesNearbySpy.mockResolvedValue({
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
    // 6. Restore the original implementation after each test
    placesNearbySpy.mockRestore();
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

    // Verify Google Places API spy was called correctly
    expect(placesNearbySpy).toHaveBeenCalledWith({
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
    // Mock first page with pagination token
    const firstPageResponseData = {
      results: [{
        place_id: 'test-place-1',
        name: 'Test Business 1',
        vicinity: '123 Test St',
        geometry: {
          location: { lat: 45.4165, lng: -75.6922 },
          viewport: defaultViewport
        }
      }],
      next_page_token: 'test-token',
      status: Status.OK,
      error_message: ''
    };
    // Mock second page
    const secondPageResponseData = {
      results: [{
        place_id: 'test-place-2',
        name: 'Test Business 2',
        vicinity: '456 Test St',
        geometry: {
          location: { lat: 45.4166, lng: -75.6923 },
          viewport: defaultViewport
        }
      }],
      status: Status.OK,
      error_message: ''
    };

    placesNearbySpy
      .mockResolvedValueOnce({ data: firstPageResponseData, status: 200, statusText: 'OK', headers: {}, config: {} as any })
      .mockResolvedValueOnce({ data: secondPageResponseData, status: 200, statusText: 'OK', headers: {}, config: {} as any });

    const result = await processGridSearch(mockJob as Job);

    expect(result).toEqual({ businessesFound: 2 });

    // Verify multiple API calls were made using the spy
    expect(placesNearbySpy).toHaveBeenCalledTimes(2);
    expect(placesNearbySpy).toHaveBeenNthCalledWith(1, {
      params: {
        location: { lat: 45.4165, lng: -75.6922 },
        radius: 1000,
        type: 'restaurant',
        key: 'test-api-key',
        pagetoken: undefined
      },
      timeout: 5000
    });
    expect(placesNearbySpy).toHaveBeenNthCalledWith(2, {
      params: {
        location: { lat: 45.4165, lng: -75.6922 },
        radius: 1000,
        type: 'restaurant',
        key: 'test-api-key',
        pagetoken: 'test-token'
      },
      timeout: 5000
    });
    // Verify data insertions
    expect(mockInsert).toHaveBeenCalledTimes(2);
  });

  it('should handle empty results', async () => {
    const emptyResponseData = { results: [], status: Status.ZERO_RESULTS, error_message: '' };
    placesNearbySpy.mockResolvedValue({ data: emptyResponseData, status: 200, statusText: 'OK', headers: {}, config: {} as any });

    const result = await processGridSearch(mockJob as Job);
    expect(result).toEqual({ businessesFound: 0 });
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockRpc).toHaveBeenCalledWith('update_scraper_run_stats', {
      run_id: 'test-run-1',
      businesses_found: 0
    });
  });

  it('should handle API errors', async () => {
    placesNearbySpy.mockRejectedValue(new Error('API request failed'));

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
    expect(placesNearbySpy).toHaveBeenCalledWith({
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
    placesNearbySpy.mockRejectedValue(rateLimitError);

    await expect(processGridSearch(mockJob as Job)).rejects.toThrow('OVER_QUERY_LIMIT');
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});