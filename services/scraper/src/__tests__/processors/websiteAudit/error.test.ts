
import { Job } from 'bull';
import { processWebsiteAudit } from '../../../queues/processors/websiteAudit';
import { setupDefaultBrowserMocks } from '../../utils/browser.mocks';
import { supabaseMocks } from '../../../test/setup';

// Mock modules
jest.mock('puppeteer');
jest.mock('lighthouse');
jest.mock('@googlemaps/google-maps-services-js');
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('Website Audit Processor - Error Handling', () => {
  const { mockBrowser, mockPage } = setupDefaultBrowserMocks();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set environment variables
    process.env.SUPABASE_URL = 'http://test-url';
    process.env.SUPABASE_SERVICE_KEY = 'test-key';
  });
  
  it('should handle network errors gracefully', async () => {
    // Setup network error
    mockPage.goto.mockRejectedValue(new Error('Network error'));
    
    const mockJob = {
      data: {
        businessId: 'test-business-1',
        url: 'https://example.com'
      }
    };

    // Process should complete without throwing
    await expect(processWebsiteAudit(mockJob as Job)).resolves.toBeDefined();
    
    // Verify error handling
    expect(supabaseMocks.mockUpdate).toHaveBeenCalledTimes(1);
    expect(supabaseMocks.updateChainMethods.eq).toHaveBeenCalledWith('id', mockJob.data.businessId);
  });
  
  it('should handle failed lighthouse runs', async () => {
    // Setup lighthouse failure
    const lighthouseModule = require('lighthouse');
    lighthouseModule.default = jest.fn().mockRejectedValue(new Error('Lighthouse error'));
    
    const mockJob = {
      data: {
        businessId: 'test-business-2',
        url: 'https://example.com'
      }
    };

    // Process should complete without throwing
    await expect(processWebsiteAudit(mockJob as Job)).resolves.toBeDefined();
    
    // Verify error handling
    expect(supabaseMocks.mockUpdate).toHaveBeenCalledTimes(1);
    expect(supabaseMocks.updateChainMethods.eq).toHaveBeenCalledWith('id', mockJob.data.businessId);
  });
});
