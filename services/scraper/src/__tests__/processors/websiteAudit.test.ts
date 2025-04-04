// Mock Puppeteer
const mockScreenshot = jest.fn();
const mockPage = {
  setViewport: jest.fn(),
  goto: jest.fn(),
  screenshot: mockScreenshot,
  close: jest.fn()
};
const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  wsEndpoint: jest.fn().mockReturnValue('ws://localhost:1234'),
  close: jest.fn()
};

jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue(mockBrowser)
}));

// Mock Lighthouse
const mockLighthouse = jest.fn().mockResolvedValue({
  report: JSON.stringify({
    categories: {
      performance: { score: 0.9 },
      accessibility: { score: 0.8 },
      'best-practices': { score: 0.85 },
      seo: { score: 0.95 }
    },
    audits: {
      'first-contentful-paint': { score: 0.9 },
      'largest-contentful-paint': { score: 0.85 },
      'total-blocking-time': { score: 0.8 },
      'cumulative-layout-shift': { score: 0.95 }
    }
  }),
  artifacts: {}
});

jest.mock('lighthouse', () => mockLighthouse);

// Mock Supabase client
const mockStorageUpload = jest.fn().mockResolvedValue({ error: null });
const mockStorageFrom = jest.fn().mockReturnValue({
  upload: mockStorageUpload
});

const mockBusinessUpdate = jest.fn().mockResolvedValue({ error: null });
const mockBusinessFrom = jest.fn().mockReturnValue({
  update: mockBusinessUpdate,
  eq: jest.fn().mockReturnThis()
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    storage: {
      from: mockStorageFrom
    },
    from: mockBusinessFrom
  })
}));

// Mock environment variables
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key';

// Import dependencies after mocking
import { Job } from 'bull';
import { processWebsiteAudit } from '../../queues/processors/websiteAudit';

describe('Website Audit Processor', () => {
  let mockJob: Partial<Job>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockJob = {
      data: {
        businessId: 'test-business-1',
        url: 'https://test.com'
      }
    };
  });

  it('should process a website audit job successfully', async () => {
    const result = await processWebsiteAudit(mockJob as Job);

    // Verify browser setup
    expect(mockPage.setViewport).toHaveBeenCalledWith({ width: 1920, height: 1080 });
    expect(mockPage.goto).toHaveBeenCalledWith('https://test.com', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Verify screenshots were taken and stored
    expect(mockPage.screenshot).toHaveBeenCalled();
    expect(mockStorageFrom).toHaveBeenCalledWith('screenshots');
    expect(mockStorageUpload).toHaveBeenCalledWith(
      expect.stringContaining('test-business-1'),
      expect.any(Buffer),
      { contentType: 'image/png' }
    );

    // Verify Lighthouse audit was run
    expect(mockLighthouse).toHaveBeenCalledWith(
      'https://test.com',
      expect.any(Object),
      expect.any(Object)
    );

    // Verify business record was updated with scores
    expect(mockBusinessFrom).toHaveBeenCalledWith('businesses');
    expect(mockBusinessUpdate).toHaveBeenCalledWith({
      scores: {
        performance: 90,
        accessibility: 80,
        bestPractices: 85,
        seo: 95,
        metrics: {
          fcp: 0.9,
          lcp: 0.85,
          tbt: 0.8,
          cls: 0.95
        }
      },
      desktopScreenshot: expect.stringContaining('test-business-1'),
      mobileScreenshot: expect.stringContaining('test-business-1'),
      auditDate: expect.any(String),
      suggestedImprovements: []
    });

    expect(result).toEqual({ scores: {
      performance: 90,
      accessibility: 80,
      bestPractices: 85,
      seo: 95
    }});
  });

  it('should handle page navigation timeout', async () => {
    mockPage.goto.mockRejectedValueOnce(new Error('Navigation timeout'));

    await expect(processWebsiteAudit(mockJob as Job))
      .rejects
      .toThrow('Navigation timeout');

    expect(mockBrowser.close).toHaveBeenCalled();
  });

  it('should handle Lighthouse errors', async () => {
    mockLighthouse.mockRejectedValueOnce(new Error('Lighthouse error'));

    await expect(processWebsiteAudit(mockJob as Job))
      .rejects
      .toThrow('Lighthouse error');

    expect(mockBrowser.close).toHaveBeenCalled();
  });

  it('should handle screenshot errors', async () => {
    mockPage.screenshot.mockRejectedValueOnce(new Error('Screenshot error'));

    await expect(processWebsiteAudit(mockJob as Job))
      .rejects
      .toThrow('Screenshot error');

    expect(mockBrowser.close).toHaveBeenCalled();
  });

  it('should handle storage errors', async () => {
    mockStorageUpload.mockResolvedValueOnce({ error: { message: 'Storage error' } });

    await expect(processWebsiteAudit(mockJob as Job))
      .rejects
      .toThrow('Failed to upload screenshot: Storage error');

    expect(mockBrowser.close).toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    mockBusinessUpdate.mockResolvedValueOnce({ error: { message: 'Database error' } });

    await expect(processWebsiteAudit(mockJob as Job))
      .rejects
      .toThrow('Failed to update business record: Database error');

    expect(mockBrowser.close).toHaveBeenCalled();
  });
});