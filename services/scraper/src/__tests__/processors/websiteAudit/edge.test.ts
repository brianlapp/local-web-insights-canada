// import { vi, describe, beforeEach, expect, it } from 'vitest'; // Import Vitest globals
import { Page } from 'puppeteer'; // Keep this if needed for spies
import { Job } from 'bull';
import { processWebsiteAudit } from '../../../queues/processors/websiteAudit';
import { createBaseLighthouseResult } from '../../utils/lighthouse.mocks';
import { setupDefaultBrowserMocks, MockedBrowser, MockedPage } from '../../utils/browser.mocks'; // This might need internal vi.fn updates
// Remove Supabase helper import
// import { createMockSupabaseClient } from '../../utils/database.mocks';

// Mock non-Supabase modules
jest.mock('puppeteer');
jest.mock('lighthouse');
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

// Declare mock function variables in higher scope
let mockUpload: jest.Mock;
let mockUpdate: jest.Mock;
let mockEq: jest.Mock; 
let mockStorageFrom: jest.Mock;
let mockFrom: jest.Mock;

// Use mock factory for Supabase, defining structure inside
jest.mock('@supabase/supabase-js', () => {
  // Define mocks *inside* the factory
  mockUpload = jest.fn();
  mockUpdate = jest.fn();
  mockEq = jest.fn(); 
  const mockRpc = jest.fn();
  
  // Mock the .from().update().eq() chain
  mockEq.mockReturnThis(); 
  const mockUpdateChain = {
    update: mockUpdate,
    eq: mockEq
  };

  // Mock the storage chain
  const mockStorageFromChain = { 
    upload: mockUpload 
  };

  // Assign implementation to higher-scoped variable
  mockFrom = jest.fn().mockImplementation((table) => {
    if (table === 'businesses') {
      return mockUpdateChain;
    }
    return {};
  });

  // Assign implementation to higher-scoped variable
  mockStorageFrom = jest.fn().mockReturnValue(mockStorageFromChain);

  // Construct the mock client structure
  const mockClient = {
    storage: { 
      from: mockStorageFrom
    },
    from: mockFrom,
    rpc: mockRpc
  };

  // Return the factory function required by Jest
  return {
    createClient: jest.fn(() => mockClient)
  };
});

describe('Website Audit Processor - Edge Cases', () => {
  const { mockBrowser, mockPage } = setupDefaultBrowserMocks();
  // No createMockSupabaseClient call needed here

  beforeEach(() => {
    jest.clearAllMocks();

    // Configure Puppeteer and Lighthouse mocks using require
    jest.mocked(require('puppeteer')).launch.mockResolvedValue(mockBrowser);
    jest.mocked(require('lighthouse')).mockResolvedValue(createBaseLighthouseResult());

    // Reset specific mocks defined in the factory scope
    mockUpload.mockReset().mockResolvedValue({ data: { path: 'mock/path' }, error: null });
    mockUpdate.mockReset().mockResolvedValue({ data: [{}], error: null });
    mockEq.mockReset().mockReturnThis();
    mockStorageFrom.mockReset(); 
    mockFrom.mockReset();

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

  it('should handle missing Lighthouse categories', async () => {
    const partialLighthouseResult = createBaseLighthouseResult();
    partialLighthouseResult.lhr.categories = {};
    partialLighthouseResult.lhr.audits = {};
    jest.mocked(require('lighthouse')).mockResolvedValue(partialLighthouseResult);

    await processWebsiteAudit(mockJob as Job);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 } })); 
    expect(mockEq).toHaveBeenCalledWith('id', mockJob.data.businessId);
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
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 } }));
    expect(mockEq).toHaveBeenCalledWith('id', mockJob.data.businessId);
  });

  it('should handle Lighthouse result with no audits property', async () => {
    const noAuditsResult = createBaseLighthouseResult();
    delete (noAuditsResult.lhr as any).audits;
    jest.mocked(require('lighthouse')).mockResolvedValue(noAuditsResult);

    await processWebsiteAudit(mockJob as Job);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ suggestedImprovements: [] }));
    expect(mockEq).toHaveBeenCalledWith('id', mockJob.data.businessId);
  });
}); 