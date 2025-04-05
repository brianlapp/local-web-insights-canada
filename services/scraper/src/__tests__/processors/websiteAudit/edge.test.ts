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

describe('Website Audit Processor - Edge Cases', () => {
  const { mockBrowser, mockPage } = setupDefaultBrowserMocks();
  const { mockUpload, mockUpdate } = supabaseMocks;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configure lighthouse and puppeteer mocks
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

  it('should handle missing Lighthouse categories', async () => {
    const lighthouseModule = require('lighthouse');
    lighthouseModule.default = jest.fn().mockResolvedValue({
      lhr: { 
        ...createBaseLighthouseResult(),
        categories: {} // Empty categories
      },
      report: ['report']
    });

    await expect(processWebsiteAudit(mockJob as Job)).resolves.toBeDefined();
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      scores: {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0
      }
    }));
  });

  it('should handle empty Lighthouse results (null scores)', async () => {
    const lighthouseModule = require('lighthouse');
    lighthouseModule.default = jest.fn().mockResolvedValue({
      lhr: { 
        ...createBaseLighthouseResult(),
        categories: {
          performance: { score: null },
          accessibility: { score: null },
          'best-practices': { score: null },
          seo: { score: null }
        }
      },
      report: ['report']
    });

    await expect(processWebsiteAudit(mockJob as Job)).resolves.toBeDefined();
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      scores: {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0
      }
    }));
  });

  it('should handle Lighthouse result with no audits property', async () => {
    const lighthouseModule = require('lighthouse');
    lighthouseModule.default = jest.fn().mockResolvedValue({
      lhr: { 
        ...createBaseLighthouseResult(),
        audits: undefined
      },
      report: ['report']
    });

    await expect(processWebsiteAudit(mockJob as Job)).resolves.toBeDefined();
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      suggestedImprovements: []
    }));
  });
}); 