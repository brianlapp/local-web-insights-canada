import { Job } from 'bull';
import { processWebsiteAudit } from '../../../queues/processors/websiteAudit';
import { createBaseLighthouseResult } from '../../utils/lighthouse.mocks';
import { setupDefaultBrowserMocks } from '../../utils/browser.mocks';
import { createMockSupabaseClient } from '../../utils/database.mocks';
import { Page } from 'puppeteer';

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

describe('Website Audit Processor - Error Handling', () => {
  const { mockBrowser, mockPage } = setupDefaultBrowserMocks();
  const { mockClient, mockUpload, mockUpdate } = createMockSupabaseClient();

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup Puppeteer mock
    jest.mocked(require('puppeteer')).launch.mockResolvedValue(mockBrowser);

    // Setup Lighthouse mock
    jest.mocked(require('lighthouse')).default.mockImplementation(() => {
      return Promise.resolve(createBaseLighthouseResult());
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

  it('should handle navigation timeouts', async () => {
    const gotoSpy = jest.spyOn(mockPage as Page, 'goto');
    gotoSpy.mockRejectedValueOnce(new Error('Navigation timeout'));
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Navigation timeout');
  });

  it('should handle Lighthouse errors', async () => {
    jest.mocked(require('lighthouse')).default.mockImplementationOnce(() => {
      throw new Error('Lighthouse error');
    });
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Lighthouse error');
  });

  it('should handle screenshot errors', async () => {
    const screenshotSpy = jest.spyOn(mockPage as Page, 'screenshot');
    screenshotSpy.mockRejectedValueOnce(new Error('Screenshot error'));
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Screenshot error');
  });

  it('should handle storage errors', async () => {
    mockUpload.mockResolvedValueOnce({ data: null, error: { message: 'Storage error' } });
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Storage error');
  });

  it('should handle database errors', async () => {
    mockUpdate.mockResolvedValueOnce({ data: null, error: { message: 'Database error' } });
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Failed to update business record: Database error');
  });

  it('should handle invalid URLs', async () => {
    const invalidJob = {
      data: {
        businessId: 'test-business-1',
        url: 'not-a-url'
      }
    };
    const gotoSpy = jest.spyOn(mockPage as Page, 'goto');
    gotoSpy.mockRejectedValueOnce(new Error('Navigation timeout'));
    await expect(processWebsiteAudit(invalidJob as Job)).rejects.toThrow('Navigation timeout');
  });
}); 