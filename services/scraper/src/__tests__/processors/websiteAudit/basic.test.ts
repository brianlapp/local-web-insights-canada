// Revert imports and API calls to Jest
// import { vi, describe, beforeEach, expect, it } from 'vitest';
import { Job } from 'bull';
import { processWebsiteAudit } from '../../../queues/processors/websiteAudit';
import { createBaseLighthouseResult } from '../../utils/lighthouse.mocks';
import { setupDefaultBrowserMocks, MockedBrowser, MockedPage } from '../../utils/browser.mocks';

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

// Get the mock functions directly using require
const supabaseMocks = require('@supabase/supabase-js');
const { mockUpload, mockUpdate, mockEq, resetSupabaseMocks } = supabaseMocks;

describe('Website Audit Processor - Basic Tests', () => {
  const { mockBrowser, mockPage } = setupDefaultBrowserMocks();

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

  it('should process a website audit job successfully', async () => {
    await processWebsiteAudit(mockJob as Job);

    // Assertions use imported mocks
    expect(mockUpload).toHaveBeenCalledTimes(2);
    expect(mockUpdate).toHaveBeenCalledTimes(1); // Assuming 1 update call
    expect(mockEq).toHaveBeenCalledWith('id', mockJob.data.businessId); // Check eq was called
    expect(mockPage.screenshot).toHaveBeenCalledTimes(2);
    expect(mockUpload).toHaveBeenCalledWith(expect.stringMatching(/desktop/), expect.any(Buffer));
    expect(mockUpload).toHaveBeenCalledWith(expect.stringMatching(/mobile/), expect.any(Buffer));
    expect(mockUpdate).toHaveBeenCalledWith({
      scores: {
        performance: 90,
        accessibility: 80,
        bestPractices: 70,
        seo: 60
      },
      desktopScreenshot: expect.stringMatching(/^businesses\/test-business-1\/desktop-\d+\.png$/),
      mobileScreenshot: expect.stringMatching(/^businesses\/test-business-1\/mobile-\d+\.png$/),
      auditDate: expect.any(String),
      suggestedImprovements: expect.any(Array) // Simplified check for now
    });
  });
}); 