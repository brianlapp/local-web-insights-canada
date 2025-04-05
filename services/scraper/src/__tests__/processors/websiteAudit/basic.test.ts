import { Job } from 'bull';
import { processWebsiteAudit } from '../../../queues/processors/websiteAudit';
import { createBaseLighthouseResult } from '../../utils/lighthouse.mocks';
import { setupDefaultBrowserMocks } from '../../utils/browser.mocks';
import { createMockSupabaseClient } from '../../utils/database.mocks';

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

describe('Website Audit Processor - Basic Tests', () => {
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

  it('should process a website audit job successfully', async () => {
    const result = await processWebsiteAudit(mockJob as Job);

    expect(result).toEqual({
      scores: {
        performance: 90,
        accessibility: 80,
        bestPractices: 70,
        seo: 60
      }
    });

    // Verify browser setup
    expect(mockBrowser.wsEndpoint).toHaveBeenCalled();
    expect(mockBrowser.newPage).toHaveBeenCalled();
    expect(mockPage.setViewport).toHaveBeenCalledWith({
      width: 1920,
      height: 1080
    });

    // Verify page navigation
    expect(mockPage.goto).toHaveBeenCalledWith('https://example.com', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Verify screenshots were taken
    expect(mockPage.screenshot).toHaveBeenCalledTimes(2);
    expect(mockPage.screenshot).toHaveBeenCalledWith({ fullPage: true });

    // Verify storage uploads
    expect(mockUpload).toHaveBeenCalledTimes(2);
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(/^businesses\/test-business-1\/desktop-\d+\.png$/),
      expect.any(Buffer)
    );
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(/^businesses\/test-business-1\/mobile-\d+\.png$/),
      expect.any(Buffer)
    );

    // Verify business record update
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
      suggestedImprovements: [
        'First Contentful Paint',
        'Largest Contentful Paint'
      ]
    });
  });
}); 