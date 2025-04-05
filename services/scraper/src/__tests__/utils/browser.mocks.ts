import { Browser, Page } from 'puppeteer';

export const createMockBrowser = (): Partial<Browser> => ({
  wsEndpoint: jest.fn().mockReturnValue('ws://localhost:1234'),
  newPage: jest.fn(),
  close: jest.fn()
});

export const createMockPage = (): Partial<Page> => ({
  setViewport: jest.fn(),
  goto: jest.fn(),
  screenshot: jest.fn()
});

export const setupDefaultBrowserMocks = () => {
  const mockBrowser = createMockBrowser();
  const mockPage = createMockPage();

  // Set default successful responses
  mockBrowser.wsEndpoint = jest.fn().mockReturnValue('ws://localhost:1234');
  mockBrowser.newPage = jest.fn().mockResolvedValue(mockPage);
  mockBrowser.close = jest.fn().mockResolvedValue(undefined);
  mockPage.setViewport = jest.fn().mockResolvedValue(undefined);
  mockPage.goto = jest.fn().mockResolvedValue(undefined);
  mockPage.screenshot = jest.fn().mockResolvedValue(Buffer.from('test-screenshot'));

  return { mockBrowser, mockPage };
};

describe('Browser Mocks', () => {
  it('should setup default browser mocks', () => {
    const { mockBrowser, mockPage } = setupDefaultBrowserMocks();
    expect(mockBrowser).toBeDefined();
    expect(mockPage).toBeDefined();
    expect(mockBrowser.wsEndpoint).toBeDefined();
    expect(mockBrowser.newPage).toBeDefined();
  });
}); 