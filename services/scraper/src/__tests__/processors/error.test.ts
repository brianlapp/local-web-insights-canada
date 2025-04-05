// Import necessary types and modules
import { Job } from 'bull';
import { setupDefaultBrowserMocks } from '../utils/browser.mocks';
import { supabaseMocks } from '../../test/setup';

// Mock modules
jest.mock('puppeteer');
jest.mock('@googlemaps/google-maps-services-js');
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('Website Audit Processor - Error Handling', () => {
  const { mockBrowser, mockPage } = setupDefaultBrowserMocks();
  const { mockUpload, mockUpdate, updateChainMethods } = supabaseMocks;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Configure non-Supabase mocks
    jest.mocked(require('puppeteer')).launch.mockResolvedValue(mockBrowser);
    
    // Set up successful default responses
    mockUpload.mockResolvedValue({ data: { path: 'test-path' }, error: null });
    updateChainMethods.eq.mockResolvedValue({ data: null, error: null });
    
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
    
    // Re-import the processor
    const { processWebsiteAudit } = require('../../queues/processors/websiteAudit');
    
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Browser error');
  });

  it('should handle navigation errors', async () => {
    mockPage.goto.mockRejectedValueOnce(new Error('Navigation failed'));
    
    // Re-import the processor
    const { processWebsiteAudit } = require('../../queues/processors/websiteAudit');
    
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Navigation failed');
  });

  it('should handle screenshot errors', async () => {
    mockPage.screenshot.mockRejectedValueOnce(new Error('Screenshot failed'));
    
    // Re-import the processor
    const { processWebsiteAudit } = require('../../queues/processors/websiteAudit');
    
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Screenshot failed');
  });

  it('should handle Lighthouse errors', async () => {
    // Setup Lighthouse mock to throw an error
    jest.doMock('lighthouse', () => {
      return jest.fn().mockImplementation(() => {
        throw new Error('Lighthouse failed');
      });
    });
    
    // Re-import the processor after mocking
    const { processWebsiteAudit } = require('../../queues/processors/websiteAudit');
    
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Lighthouse failed');
  });

  it('should handle storage errors', async () => {
    const storageError = { message: 'Storage error' };
    mockUpload.mockResolvedValueOnce({ data: null, error: storageError });
    
    // Set up a successful Lighthouse result
    jest.doMock('lighthouse', () => {
      return jest.fn().mockResolvedValue({
        lhr: { categories: {} },
        report: ['report']
      });
    });
    
    // Re-import the processor
    const { processWebsiteAudit } = require('../../queues/processors/websiteAudit');
    
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow(`Storage Error: ${storageError.message}`);
  });

  it('should handle database errors', async () => {
    const dbError = { message: 'Database error' };
    updateChainMethods.eq.mockResolvedValueOnce({ data: null, error: dbError });
    
    // Set up a successful Lighthouse result
    jest.doMock('lighthouse', () => {
      return jest.fn().mockResolvedValue({
        lhr: { categories: {} },
        report: ['report']
      });
    });
    
    // Re-import the processor
    const { processWebsiteAudit } = require('../../queues/processors/websiteAudit');
    
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
    
    // Re-import the processor
    const { processWebsiteAudit } = require('../../queues/processors/websiteAudit');
    
    await expect(processWebsiteAudit(invalidJob as Job)).rejects.toThrow('Navigation failed: invalid URL');
  });
}); 