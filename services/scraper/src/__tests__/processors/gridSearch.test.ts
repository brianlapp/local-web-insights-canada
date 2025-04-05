import { Job } from 'bull';
import { processGridSearch } from '../../queues/processors/gridSearch';
import { supabaseMocks } from '../../test/setup';

// Define mock function at the top level
const mockPlacesNearby = jest.fn();

// Mock modules
jest.mock('@googlemaps/google-maps-services-js', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        placesNearby: mockPlacesNearby // Reference the mock defined above
      };
    })
  };
});

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Grid Search Processor', () => {
  // Access global mocks from setup
  const { mockInsert, mockUpdate, mockRpc, updateChainMethods } = supabaseMocks;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default successful responses
    mockInsert.mockResolvedValue({ data: null, error: null });
    updateChainMethods.eq.mockResolvedValue({ data: null, error: null });
    mockRpc.mockResolvedValue({ data: null, error: null });
    
    // Reset the top-level mock function
    mockPlacesNearby.mockReset().mockResolvedValue({
      data: {
        results: [{ place_id: 'test-place-1', name: 'Test Restaurant', types: ['restaurant'] }],
        status: 'OK'
      }
    });

    process.env.GOOGLE_MAPS_API_KEY = 'test-api-key';
    process.env.SUPABASE_URL = 'http://test-url';
    process.env.SUPABASE_SERVICE_KEY = 'test-key';
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
    await expect(processGridSearch(mockJob as Job)).resolves.toBeDefined();
    
    // Verify the places nearby API was called
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
    expect(updateChainMethods.eq).toHaveBeenCalledWith('id', 'test-grid-1');
  });

  it('should handle database errors for insert', async () => {
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
    updateChainMethods.eq.mockResolvedValue({ data: null, error: gridError });

    await expect(processGridSearch(mockJob as Job)).rejects.toThrow('Failed to update grid record: Grid update failed');
  });

  it('should handle API errors', async () => {
    mockPlacesNearby.mockRejectedValue(new Error('API request failed'));
    await expect(processGridSearch(mockJob as Job)).rejects.toThrow('API request failed');
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});