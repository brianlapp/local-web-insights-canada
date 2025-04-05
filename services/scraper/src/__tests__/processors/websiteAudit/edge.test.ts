// import { vi, describe, beforeEach, expect, it } from 'vitest'; // Import Vitest globals
import { Page } from 'puppeteer'; // Keep this if needed for spies
import { Job } from 'bull';
import { processWebsiteAudit } from '../../../queues/processors/websiteAudit';
import { createBaseLighthouseResult } from '../../utils/lighthouse.mocks';
import { setupDefaultBrowserMocks, MockedBrowser, MockedPage } from '../../utils/browser.mocks'; // This might need internal vi.fn updates
// Import using original module name - expect Jest to find adjacent __mocks__
import { 
  mockUpload, 
  mockUpdate, 
  resetSupabaseMocks, 
  mockEq 
} from '@supabase/supabase-js';

// Mock modules (Jest automatically uses adjacent __mocks__)
jest.mock('puppeteer');
jest.mock('lighthouse');
jest.mock('@supabase/supabase-js'); 
jest.mock('@googlemaps/google-maps-services-js');
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

// REMOVE mock factory and describe-scoped variables
// let mockUpload: jest.Mock;
// ... etc ...
// jest.mock('@supabase/supabase-js', () => { /* factory */ });

describe('Website Audit Processor - Edge Cases', () => {
  const { mockBrowser, mockPage } = setupDefaultBrowserMocks();
  // No helper call needed

  beforeEach(() => {
    jest.clearAllMocks();
    resetSupabaseMocks(); // Use reset helper from manual mock

    // Configure non-Supabase mocks
    jest.mocked(require('puppeteer')).launch.mockResolvedValue(mockBrowser);
    jest.mocked(require('lighthouse')).mockResolvedValue(createBaseLighthouseResult());
    
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
    const partialLighthouseResult = createBaseLighthouseResult();
    partialLighthouseResult.lhr.categories = {};
    partialLighthouseResult.lhr.audits = {};
    jest.mocked(require('lighthouse')).mockResolvedValue(partialLighthouseResult);

    await processWebsiteAudit(mockJob as Job);
    // Use mock from createMockSupabaseClient
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 } })); 
  });

  it('should handle empty Lighthouse results (null scores)', async () => {
    const nullScoreResult = createBaseLighthouseResult();
    nullScoreResult.lhr.categories = {
      performance: { score: null, id:'performance', title:'', auditRefs: [] },
      accessibility: { score: null, id:'accessibility', title:'', auditRefs: [] },
      'best-practices': { score: null, id:'best-practices', title:'', auditRefs: [] },
      seo: { score: null, id:'seo', title:'', auditRefs: [] }
    };
    nullScoreResult.lhr.audits = {};
    jest.mocked(require('lighthouse')).mockResolvedValue(nullScoreResult);

    await processWebsiteAudit(mockJob as Job);
    // Use mock from createMockSupabaseClient
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 } }));
  });
  
  it('should handle Lighthouse result with no audits property', async () => {
    const noAuditsResult = createBaseLighthouseResult();
    delete (noAuditsResult.lhr as any).audits;
    jest.mocked(require('lighthouse')).mockResolvedValue(noAuditsResult);

    await processWebsiteAudit(mockJob as Job);
    // Use mock from createMockSupabaseClient
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ suggestedImprovements: [] }));
  });
}); 