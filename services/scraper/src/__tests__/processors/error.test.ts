// Import necessary types and modules
import { Job } from 'bull';
import { processWebsiteAudit } from '../../queues/processors/websiteAudit';
import { setupDefaultBrowserMocks } from '../utils/browser.mocks';
import { supabaseMocks } from '../../test/setup';

// Mock modules
jest.mock('puppeteer');
jest.mock('lighthouse');
jest.mock('@googlemaps/google-maps-services-js');
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('Website Audit Processor - Error Handling', () => {
  const { mockBrowser, mockPage } = setupDefaultBrowserMocks();
  const { mockUpload, mockUpdate } = supabaseMocks;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configure non-Supabase mocks
    jest.mocked(require('puppeteer')).launch.mockResolvedValue(mockBrowser);
    
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

  it('should handle browser errors', async () => {
    const error = new Error('Browser error');
    jest.mocked(require('puppeteer')).launch.mockRejectedValueOnce(error);
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Browser error');
  });

  it('should handle navigation errors', async () => {
    mockPage.goto.mockRejectedValueOnce(new Error('Navigation failed'));
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Navigation failed');
  });

  it('should handle screenshot errors', async () => {
    mockPage.screenshot.mockRejectedValueOnce(new Error('Screenshot failed'));
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Screenshot failed');
  });

  it('should handle Lighthouse errors', async () => {
    const lighthouseModule = require('lighthouse');
    lighthouseModule.default = jest.fn().mockRejectedValueOnce(new Error('Lighthouse failed'));
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Lighthouse failed');
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
        url: 'invalid-url'
      }
    };
    mockPage.goto.mockRejectedValueOnce(new Error('Navigation failed: invalid URL'));
    await expect(processWebsiteAudit(invalidJob as Job)).rejects.toThrow('Navigation failed: invalid URL');
  });
}); 