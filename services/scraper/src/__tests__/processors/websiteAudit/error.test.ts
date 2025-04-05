// Revert imports and API calls to Jest
// import { vi, describe, beforeEach, expect, it } from 'vitest';
import { Page } from 'puppeteer';
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

describe('Website Audit Processor - Error Handling', () => {
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

  it('should handle navigation timeouts', async () => {
    const navigationError = new Error('Navigation timeout');
    (mockPage.goto as jest.Mock).mockRejectedValueOnce(navigationError);
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow(navigationError);
  });

  it('should handle Lighthouse errors', async () => {
    const lighthouseError = new Error('Lighthouse error');
    jest.mocked(require('lighthouse')).mockRejectedValueOnce(lighthouseError);
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow(lighthouseError);
  });

  it('should handle screenshot errors', async () => {
    const screenshotError = new Error('Screenshot error');
    (mockPage.screenshot as jest.Mock).mockRejectedValueOnce(screenshotError);
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow(screenshotError);
  });

  it('should handle storage errors', async () => {
    const storageError = { message: 'Storage error' };
    mockUpload.mockResolvedValueOnce({ data: null, error: storageError }); 
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow(`Storage Error: ${storageError.message}`);
  });

  it('should handle database errors', async () => {
    const dbError = { message: 'Database error' };
    mockUpdate.mockResolvedValueOnce({ data: null, error: dbError }); 
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow(`Database Error: ${dbError.message}`);
  });

  it('should handle invalid URLs', async () => {
    const invalidJob = {
      data: {
        businessId: 'test-business-1',
        url: 'not-a-url'
      }
    };
    const navigationError = new Error('net::ERR_INVALID_URL');
    (mockPage.goto as jest.Mock).mockRejectedValueOnce(navigationError);
    await expect(processWebsiteAudit(invalidJob as Job)).rejects.toThrow(navigationError);
  });
}); 