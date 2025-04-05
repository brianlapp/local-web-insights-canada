import { Job } from 'bull';
import { processWebsiteAudit } from '../../../queues/processors/websiteAudit';
import { createEmptyLighthouseResult } from '../../utils/lighthouse.mocks';
import { setupDefaultBrowserMocks } from '../../utils/browser.mocks';
import { createMockSupabaseClient } from '../../utils/database.mocks';

// Mock modules first
jest.mock('puppeteer');
jest.mock('lighthouse');
jest.mock('@supabase/supabase-js');
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('Website Audit Processor - Edge Cases', () => {
  const { mockBrowser, mockPage } = setupDefaultBrowserMocks();
  const { mockClient, mockUpload, mockUpdate } = createMockSupabaseClient();

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup Puppeteer mock
    jest.mocked(require('puppeteer')).launch.mockResolvedValue(mockBrowser);

    // Setup Lighthouse mock
    jest.mocked(require('lighthouse')).default.mockImplementation(() => {
      return Promise.resolve(createEmptyLighthouseResult());
    });

    // Setup Supabase mock
    jest.mocked(require('@supabase/supabase-js')).createClient.mockReturnValue(mockClient);

    // Set environment variables
    process.env.SUPABASE_URL = 'http://test-url';
    process.env.SUPABASE_SERVICE_KEY = 'test-key';
  });

  const mockJob = {
    data: {
      businessId: 'test-business-1',
      url: 'https://example.com'
    }
  };

  it('should handle empty Lighthouse results', async () => {
    const result = await processWebsiteAudit(mockJob as Job);
    expect(result).toEqual({
      scores: {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0
      }
    });

    // Verify business record update with zero scores
    expect(mockUpdate).toHaveBeenCalledWith({
      scores: {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0
      },
      desktopScreenshot: expect.stringMatching(/^businesses\/test-business-1\/desktop-\d+\.png$/),
      mobileScreenshot: expect.stringMatching(/^businesses\/test-business-1\/mobile-\d+\.png$/),
      auditDate: expect.any(String),
      suggestedImprovements: []
    });
  });
}); 