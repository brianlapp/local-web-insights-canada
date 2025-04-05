// Import necessary types and modules
import { Job } from 'bull';
import { processWebsiteAudit } from '../../../queues/processors/websiteAudit';
import { createBaseLighthouseResult } from '../../utils/lighthouse.mocks';
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

describe('Website Audit Processor - Basic Tests', () => {
  const { mockBrowser, mockPage } = setupDefaultBrowserMocks();
  const { mockUpload, mockUpdate, updateChainMethods } = supabaseMocks;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup Lighthouse mock
    const lighthouseModule = require('lighthouse');
    lighthouseModule.default = jest.fn().mockResolvedValue({
      lhr: createBaseLighthouseResult(),
      report: ['report']
    });
    
    // Setup browser mock
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

  it('should process a website audit job successfully', async () => {
    await expect(processWebsiteAudit(mockJob as Job)).resolves.toBeDefined();
    
    // Assertions use imported mocks
    expect(mockUpload).toHaveBeenCalledTimes(2);
    expect(mockUpdate).toHaveBeenCalledTimes(1); // Called once for business update
    expect(updateChainMethods.eq).toHaveBeenCalledTimes(1); // Called once for id match
    expect(mockPage.screenshot).toHaveBeenCalledTimes(2);
    expect(mockUpload).toHaveBeenCalledWith(expect.stringMatching(/desktop/), expect.any(Buffer));
    expect(mockUpload).toHaveBeenCalledWith(expect.stringMatching(/mobile/), expect.any(Buffer));
    expect(updateChainMethods.eq).toHaveBeenCalledWith('id', mockJob.data.businessId);
  });
}); 