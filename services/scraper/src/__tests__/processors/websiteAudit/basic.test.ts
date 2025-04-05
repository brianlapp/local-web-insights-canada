// Revert imports and API calls to Jest
// import { vi, describe, beforeEach, expect, it } from 'vitest';
import { Job } from 'bull';
import { processWebsiteAudit } from '../../../queues/processors/websiteAudit';
import { createBaseLighthouseResult } from '../../utils/lighthouse.mocks';
import { setupDefaultBrowserMocks, MockedBrowser, MockedPage } from '../../utils/browser.mocks';
// Import database mock helper again
import { createMockSupabaseClient } from '../../utils/database.mocks';

// Mock modules
jest.mock('puppeteer');
jest.mock('lighthouse');
jest.mock('@supabase/supabase-js'); // Simple mock at top level
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('Website Audit Processor - Basic Tests', () => {
  const { mockBrowser, mockPage } = setupDefaultBrowserMocks();
  // Call helper in describe scope
  const { mockClient, mockUpload, mockUpdate } = createMockSupabaseClient(); 

  beforeEach(() => {
    jest.clearAllMocks();

    // Configure Puppeteer and Lighthouse mocks using require
    jest.mocked(require('puppeteer')).launch.mockResolvedValue(mockBrowser);
    jest.mocked(require('lighthouse')).mockResolvedValue(createBaseLighthouseResult());
    // Configure Supabase mock return value here
    jest.mocked(require('@supabase/supabase-js')).createClient.mockReturnValue(mockClient);

    // Reset mocks directly
    mockUpload.mockReset().mockResolvedValue({ data: { path: 'mock/path' }, error: null });
    mockUpdate.mockReset().mockResolvedValue({ data: [{}], error: null });

    // Reset Puppeteer mocks 

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

  it('should process a website audit job successfully', async () => {
    const result = await processWebsiteAudit(mockJob as Job);

    // Assertions use mocks from createMockSupabaseClient again
    expect(result).toEqual({
      scores: {
        performance: 90,
        accessibility: 80,
        bestPractices: 70,
        seo: 60
      }
    });
    expect(mockPage.screenshot).toHaveBeenCalledTimes(2);
    expect(mockUpload).toHaveBeenCalledTimes(2);
    expect(mockUpload).toHaveBeenCalledWith(expect.stringMatching(/desktop/), expect.any(Buffer));
    expect(mockUpload).toHaveBeenCalledWith(expect.stringMatching(/mobile/), expect.any(Buffer));
    expect(mockUpdate).toHaveBeenCalledWith({
      scores: {
        performance: 90,
        accessibility: 80,
        bestPractices: 70,
        seo: 60
      },
      desktopScreenshot: expect.stringMatching(/^businesses\/test-business-1\/desktop-\d+\.png$/),
      mobileScreenshot: expect.stringMatching(/^businesses\/test-business-1\/mobile-\d+\.png$/),
      auditDate: expect.any(String),
      suggestedImprovements: expect.any(Array) // Simplified check for now
    });
  });
}); 