// Mock modules first
const mockPlacesNearby = jest.fn();
const mockInsert = jest.fn().mockResolvedValue({ error: null });
const mockUpdate = jest.fn().mockResolvedValue({ error: null });
const mockRpc = jest.fn().mockResolvedValue({ error: null });
const mockFrom = jest.fn().mockReturnValue({
  insert: mockInsert,
  update: mockUpdate,
  eq: jest.fn().mockReturnThis()
});

jest.mock('@googlemaps/google-maps-services-js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    placesNearby: mockPlacesNearby
  }))
}));

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

// Mock environment variables
process.env.GOOGLE_MAPS_API_KEY = 'test-api-key';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key';

// Import dependencies after mocking
import { Job } from 'bull';
import { processGridSearch } from '../../queues/processors/gridSearch';

describe('Grid Search Processor', () => {
  let mockJob: Partial<Job>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default successful responses
    mockPlacesNearby.mockResolvedValue({
      data: {
        results: [{
          place_id: 'test-place-1',
          name: 'Test Place 1'
        }],
        next_page_token: undefined
      }
    });

    // Setup mock job
    mockJob = {
      data: {
        grid: {
          id: 'test-grid-1',
          name: 'Test Grid',
          bounds: {
            northeast: { lat: 45.4215, lng: -75.6972 },
            southwest: { lat: 45.4115, lng: -75.6872 }
          }
        },
        category: 'restaurant',
        scraperRunId: 'test-run-1'
      }
    };
  });

  it('should process a grid search job successfully', async () => {
    const result = await processGridSearch(mockJob as Job);

    // Verify Google Places API was called correctly
    expect(mockPlacesNearby).toHaveBeenCalledWith({
      params: {
        location: { lat: 45.4165, lng: -75.6922 }, // Center of the grid
        radius: 1000,
        type: 'restaurant',
        key: 'test-api-key',
        pagetoken: undefined
      },
      timeout: 5000
    });

    // Verify raw business data was stored
    expect(mockFrom).toHaveBeenCalledWith('raw_business_data');
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

    // Verify grid record was updated
    expect(mockFrom).toHaveBeenCalledWith('geo_grids');
    expect(mockUpdate).toHaveBeenCalledWith({
      last_scraped: expect.any(String)
    });

    expect(result).toEqual({ businessesFound: 1 });
  });

  it('should process a grid search job successfully with pagination', async () => {
    // Mock paginated responses
    mockPlacesNearby
      .mockResolvedValueOnce({
        data: {
          results: [{
            place_id: 'test-place-1',
            name: 'Test Business 1',
            vicinity: '123 Test St',
            geometry: { location: { lat: 45.4215, lng: -75.6972 } }
          }],
          status: 'OK',
          next_page_token: 'page2'
        }
      })
      .mockResolvedValueOnce({
        data: {
          results: [{
            place_id: 'test-place-2',
            name: 'Test Business 2',
            vicinity: '456 Test St',
            geometry: { location: { lat: 45.4216, lng: -75.6973 } }
          }],
          status: 'OK'
        }
      });

    const result = await processGridSearch(mockJob as Job);

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
        pagetoken: 'page2'
      },
      timeout: 5000
    });

    expect(result).toEqual({ businessesFound: 2 });
  });

  it('should handle empty results', async () => {
    // Mock empty response
    mockPlacesNearby.mockResolvedValueOnce({
      data: {
        results: [],
        status: 'ZERO_RESULTS'
      }
    });

    const result = await processGridSearch(mockJob as Job);
    expect(result).toEqual({ businessesFound: 0 });
  });

  it('should handle API errors', async () => {
    // Mock API error
    mockPlacesNearby.mockRejectedValueOnce(new Error('API request failed'));

    await expect(processGridSearch(mockJob as Job))
      .rejects
      .toThrow('API request failed');
  });

  it('should handle database errors', async () => {
    // Mock database error
    mockInsert.mockResolvedValueOnce({ error: { message: 'Database error' } });

    await expect(processGridSearch(mockJob as Job))
      .rejects
      .toThrow('Database error');
  });
}); 