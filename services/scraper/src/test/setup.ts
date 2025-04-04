import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Client } from '@googlemaps/google-maps-services-js';

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

// Mock Bull queue
jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => ({
    process: jest.fn(),
    add: jest.fn(),
    on: jest.fn(),
    getJob: jest.fn(),
    getJobCounts: jest.fn()
  }));
});

// Mock Lighthouse
jest.mock('lighthouse', () => {
  return jest.fn().mockResolvedValue({
    report: JSON.stringify({
      categories: {
        performance: { score: 0.9 },
        accessibility: { score: 0.8 },
        'best-practices': { score: 0.85 },
        seo: { score: 0.95 }
      },
      audits: {
        'first-contentful-paint': {
          score: 0.9,
          title: 'First Contentful Paint'
        }
      }
    })
  });
});

// Mock Puppeteer
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setViewport: jest.fn(),
      goto: jest.fn(),
      screenshot: jest.fn().mockResolvedValue(Buffer.from('test-screenshot')),
      close: jest.fn()
    }),
    wsEndpoint: jest.fn().mockReturnValue('ws://localhost:3000'),
    close: jest.fn()
  })
}));

// Mock Supabase
jest.mock('@supabase/supabase-js');

const createChainableMock = () => {
  const mock = jest.fn().mockReturnThis();
  return jest.fn().mockImplementation(() => ({
    insert: mock,
    update: mock,
    select: mock,
    eq: mock,
    from: mock
  }));
};

(createClient as jest.Mock).mockReturnValue({
  from: createChainableMock(),
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ error: null })
    })
  },
  rpc: jest.fn().mockResolvedValue({ error: null })
});

// Mock Google Maps Client
jest.mock('@googlemaps/google-maps-services-js');

(Client as jest.Mock).mockImplementation(() => ({
  placesNearby: jest.fn().mockResolvedValue({
    data: {
      results: [
        {
          place_id: 'test-place-1',
          name: 'Test Business 1',
          formatted_address: '123 Test St',
          website: 'https://example.com'
        }
      ],
      status: 'OK'
    }
  })
})); 