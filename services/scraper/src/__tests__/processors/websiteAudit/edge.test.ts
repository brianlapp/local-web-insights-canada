// Import necessary types and modules
import { Job } from 'bull';
import { setupDefaultBrowserMocks } from '../../utils/browser.mocks';
import { createBaseLighthouseResult } from '../../utils/lighthouse.mocks';
import { supabaseMocks } from '../../../test/setup';

// Mock modules
jest.mock('puppeteer');
jest.mock('@googlemaps/google-maps-services-js');
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('Website Audit Processor - Edge Cases', () => {
  const { mockBrowser, mockPage } = setupDefaultBrowserMocks();
  const { mockUpdate, updateChainMethods } = supabaseMocks;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Configure puppeteer mocks
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
    // Mock Lighthouse with empty categories
    const emptyLighthouseResult = {
      lhr: { 
        ...createBaseLighthouseResult(),
        categories: {} // Empty categories
      },
      report: ['report']
    };
    
    jest.doMock('lighthouse', () => {
      return jest.fn().mockResolvedValue(emptyLighthouseResult);
    });
    
    // Require the processor after mocking
    const { processWebsiteAudit } = require('../../../queues/processors/websiteAudit');

    await expect(processWebsiteAudit(mockJob as Job)).resolves.toBeDefined();
    
    // First, verify update was called
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    
    // Extract the first argument of the first call
    const updateArg = mockUpdate.mock.calls[0][0];
    
    // Now verify the scores in that argument are all zeros
    expect(updateArg.scores).toEqual({
      performance: 0,
      accessibility: 0,
      bestPractices: 0,
      seo: 0
    });
  });

  it('should handle empty Lighthouse results (null scores)', async () => {
    // Mock Lighthouse with null scores
    const nullScoresResult = {
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
    };
    
    jest.doMock('lighthouse', () => {
      return jest.fn().mockResolvedValue(nullScoresResult);
    });
    
    // Require the processor after mocking
    const { processWebsiteAudit } = require('../../../queues/processors/websiteAudit');

    await expect(processWebsiteAudit(mockJob as Job)).resolves.toBeDefined();
    
    // First, verify update was called
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    
    // Extract the first argument of the first call
    const updateArg = mockUpdate.mock.calls[0][0];
    
    // Now verify the scores in that argument are all zeros
    expect(updateArg.scores).toEqual({
      performance: 0,
      accessibility: 0,
      bestPractices: 0,
      seo: 0
    });
  });

  it('should handle Lighthouse result with no audits property', async () => {
    // Mock Lighthouse with no audits property
    const noAuditsResult = {
      lhr: { 
        ...createBaseLighthouseResult(),
        audits: undefined
      },
      report: ['report']
    };
    
    jest.doMock('lighthouse', () => {
      return jest.fn().mockResolvedValue(noAuditsResult);
    });
    
    // Require the processor after mocking
    const { processWebsiteAudit } = require('../../../queues/processors/websiteAudit');

    await expect(processWebsiteAudit(mockJob as Job)).resolves.toBeDefined();
    
    // First, verify update was called
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    
    // Extract the first argument of the first call
    const updateArg = mockUpdate.mock.calls[0][0];
    
    // Now verify the suggestedImprovements in that argument is an empty array
    expect(updateArg.suggestedImprovements).toEqual([]);
  });
}); 