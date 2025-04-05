// Mock Google Maps Client
const mockPlacesNearby = jest.fn().mockResolvedValue({
  data: {
    results: [
      {
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
      }
    ],
    status: 'OK'
  }
});

const Client = jest.fn().mockImplementation(() => ({
  placesNearby: mockPlacesNearby
}));

// Mock the status enum
const Status = {
  OK: 'OK',
  ZERO_RESULTS: 'ZERO_RESULTS',
  OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
  REQUEST_DENIED: 'REQUEST_DENIED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Export using CommonJS for Jest mock compatibility
module.exports = {
  Client,
  mockPlacesNearby,
  Status
}; 