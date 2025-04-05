// Mock modules first
jest.mock('puppeteer');
jest.mock('lighthouse');
jest.mock('@supabase/supabase-js');
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

import { Job } from 'bull';
import lighthouse, { Result } from 'lighthouse';
import { processWebsiteAudit } from '../../queues/processors/websiteAudit';

// Mock setup
const mockBrowser = {
  wsEndpoint: jest.fn().mockReturnValue('ws://localhost:1234'),
  newPage: jest.fn(),
  close: jest.fn()
};

const mockPage = {
  setViewport: jest.fn(),
  goto: jest.fn(),
  screenshot: jest.fn()
};

const mockUpload = jest.fn();
const mockUpdate = jest.fn();
const mockFrom = jest.fn().mockImplementation((table) => {
  if (table === 'businesses') {
    return { update: mockUpdate, eq: jest.fn().mockReturnThis() };
  }
  return {};
});

// Update mock implementations
jest.mocked(require('puppeteer')).launch.mockResolvedValue(mockBrowser);
mockBrowser.newPage.mockResolvedValue(mockPage);
mockPage.setViewport.mockResolvedValue(undefined);
mockPage.goto.mockResolvedValue(undefined);
mockPage.screenshot.mockResolvedValue(Buffer.from('test-screenshot'));

const defaultLighthouseResult = {
  lhr: {
    categories: {
      performance: {
        id: 'performance',
        title: 'Performance',
        score: 0.9,
        auditRefs: [{
          id: 'first-contentful-paint',
          weight: 1,
          group: 'metrics'
        }]
      },
      accessibility: {
        id: 'accessibility',
        title: 'Accessibility',
        score: 0.8,
        auditRefs: [{
          id: 'color-contrast',
          weight: 1,
          group: 'accessibility'
        }]
      },
      'best-practices': {
        id: 'best-practices',
        title: 'Best Practices',
        score: 0.7,
        auditRefs: [{
          id: 'js-libraries',
          weight: 1,
          group: 'best-practices'
        }]
      },
      seo: {
        id: 'seo',
        title: 'SEO',
        score: 0.6,
        auditRefs: [{
          id: 'meta-description',
          weight: 1,
          group: 'seo'
        }]
      }
    },
    audits: {
      'first-contentful-paint': {
        id: 'first-contentful-paint',
        title: 'First Contentful Paint',
        description: 'First Contentful Paint',
        score: 0.8,
        scoreDisplayMode: 'numeric',
        numericValue: 1000,
        displayValue: '1.0 s'
      },
      'largest-contentful-paint': {
        id: 'largest-contentful-paint',
        title: 'Largest Contentful Paint',
        description: 'Largest Contentful Paint',
        score: 0.7,
        scoreDisplayMode: 'numeric',
        numericValue: 2000,
        displayValue: '2.0 s'
      }
    },
    gatherMode: 'snapshot' as const,
    finalDisplayedUrl: 'https://example.com',
    fetchTime: new Date().toISOString(),
    lighthouseVersion: '10.0.0',
    requestedUrl: 'https://example.com',
    mainDocumentUrl: 'https://example.com',
    runWarnings: [],
    userAgent: 'Lighthouse',
    environment: {
      networkUserAgent: 'Lighthouse',
      hostUserAgent: 'Lighthouse',
      benchmarkIndex: 1000
    },
    configSettings: {
      output: 'json',
      maxWaitForLoad: 45000,
      throttlingMethod: 'simulate',
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4
      }
    },
    timing: {
      total: 5000
    },
    i18n: {
      rendererFormattedStrings: {}
    },
    stackPacks: []
  },
  report: JSON.stringify({
    categories: {
      performance: {
        id: 'performance',
        title: 'Performance',
        score: 0.9,
        auditRefs: [{
          id: 'first-contentful-paint',
          weight: 1,
          group: 'metrics'
        }]
      },
      accessibility: {
        id: 'accessibility',
        title: 'Accessibility',
        score: 0.8,
        auditRefs: [{
          id: 'color-contrast',
          weight: 1,
          group: 'accessibility'
        }]
      },
      'best-practices': {
        id: 'best-practices',
        title: 'Best Practices',
        score: 0.7,
        auditRefs: [{
          id: 'js-libraries',
          weight: 1,
          group: 'best-practices'
        }]
      },
      seo: {
        id: 'seo',
        title: 'SEO',
        score: 0.6,
        auditRefs: [{
          id: 'meta-description',
          weight: 1,
          group: 'seo'
        }]
      }
    },
    audits: {
      'first-contentful-paint': {
        id: 'first-contentful-paint',
        title: 'First Contentful Paint',
        description: 'First Contentful Paint',
        score: 0.8,
        scoreDisplayMode: 'numeric',
        numericValue: 1000,
        displayValue: '1.0 s'
      },
      'largest-contentful-paint': {
        id: 'largest-contentful-paint',
        title: 'Largest Contentful Paint',
        description: 'Largest Contentful Paint',
        score: 0.7,
        scoreDisplayMode: 'numeric',
        numericValue: 2000,
        displayValue: '2.0 s'
      }
    }
  }),
  artifacts: {},
  i18n: {
    rendererFormattedStrings: {}
  }
} as const;

jest.mocked(lighthouse).mockImplementation((url, options, config) => {
  return Promise.resolve(defaultLighthouseResult as any);
});

jest.mocked(require('@supabase/supabase-js')).createClient.mockReturnValue({
  storage: { from: jest.fn().mockReturnValue({ upload: mockUpload }) },
  from: mockFrom
});

// Set environment variables
process.env.SUPABASE_URL = 'http://test-url';
process.env.SUPABASE_SERVICE_KEY = 'test-key';

describe('Website Audit Processor', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockBrowser.wsEndpoint.mockClear();
    mockBrowser.newPage.mockClear();
    mockBrowser.close.mockClear();
    mockPage.setViewport.mockClear();
    mockPage.goto.mockClear();
    mockPage.screenshot.mockClear();
    mockUpload.mockClear();
    mockUpdate.mockClear();

    // Reset default successful responses
    mockBrowser.wsEndpoint.mockReturnValue('ws://localhost:1234');
    mockBrowser.newPage.mockResolvedValue(mockPage);
    mockPage.setViewport.mockResolvedValue(undefined);
    mockPage.goto.mockResolvedValue(undefined);
    mockPage.screenshot.mockResolvedValue(Buffer.from('test-screenshot'));
    mockUpload.mockResolvedValue({ data: { path: 'test-path' }, error: null });
    mockUpdate.mockResolvedValue({ data: null, error: null });
    jest.mocked(lighthouse).mockImplementation((url, options, config) => {
      return Promise.resolve(defaultLighthouseResult);
    });
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

    // Verify Lighthouse audit
    expect(lighthouse).toHaveBeenCalledWith('https://example.com', {
      port: 1234,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
    }, undefined);

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

  it('should handle navigation timeouts', async () => {
    mockPage.goto.mockRejectedValueOnce(new Error('Navigation timeout'));
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Navigation timeout');
  });

  it('should handle Lighthouse errors', async () => {
    jest.mocked(lighthouse).mockImplementationOnce(() => {
      throw new Error('Lighthouse error');
    });
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Lighthouse error');
  });

  it('should handle screenshot errors', async () => {
    mockPage.screenshot.mockRejectedValueOnce(new Error('Screenshot error'));
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Screenshot error');
  });

  it('should handle storage errors', async () => {
    mockUpload.mockResolvedValueOnce({ data: null, error: { message: 'Storage error' } });
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Storage error');
  });

  it('should handle database errors', async () => {
    mockUpdate.mockResolvedValueOnce({ data: null, error: { message: 'Database error' } });
    await expect(processWebsiteAudit(mockJob as Job)).rejects.toThrow('Failed to update business record: Database error');
  });

  it('should handle invalid URLs', async () => {
    const invalidJob = {
      data: {
        businessId: 'test-business-1',
        url: 'not-a-url'
      }
    };
    mockPage.goto.mockRejectedValueOnce(new Error('Navigation timeout'));
    await expect(processWebsiteAudit(invalidJob as Job)).rejects.toThrow('Navigation timeout');
  });

  it('should handle empty Lighthouse results', async () => {
    const emptyResult = {
      lhr: {
        categories: {},
        audits: {},
        gatherMode: 'snapshot' as const,
        finalDisplayedUrl: 'https://example.com',
        fetchTime: new Date().toISOString(),
        lighthouseVersion: '10.0.0',
        requestedUrl: 'https://example.com',
        mainDocumentUrl: 'https://example.com',
        runWarnings: [],
        userAgent: 'Lighthouse',
        environment: {
          networkUserAgent: 'Lighthouse',
          hostUserAgent: 'Lighthouse',
          benchmarkIndex: 1000
        },
        configSettings: {
          output: 'json',
          maxWaitForLoad: 45000,
          throttlingMethod: 'simulate',
          throttling: {
            rttMs: 150,
            throughputKbps: 1638.4,
            cpuSlowdownMultiplier: 4
          }
        },
        timing: {
          total: 5000
        },
        i18n: {
          rendererFormattedStrings: {}
        },
        stackPacks: []
      },
      report: JSON.stringify({
        categories: {},
        audits: {}
      }),
      artifacts: {},
      i18n: {
        rendererFormattedStrings: {}
      }
    } as const;
    jest.mocked(lighthouse).mockImplementationOnce((url, options, config) => {
      return Promise.resolve(emptyResult as any);
    });

    const result = await processWebsiteAudit(mockJob as Job);
    expect(result).toEqual({
      scores: {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0
      }
    });
  });
});