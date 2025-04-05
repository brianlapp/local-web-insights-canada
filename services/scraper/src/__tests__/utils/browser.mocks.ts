import { Browser, Page, Viewport, GoToOptions, ScreenshotOptions, HTTPResponse } from 'puppeteer';
import { jest } from '@jest/globals';

// Define types for the mocked methods explicitly as Jest Mocks
type MockBrowserMethods = {
  wsEndpoint: jest.Mock<() => string>;
  newPage: jest.Mock<() => Promise<Page>>;
  close: jest.Mock<() => Promise<void>>;
};

type MockPageMethods = {
  setViewport: jest.Mock<(viewport: Viewport) => Promise<void>>;
  goto: jest.Mock<(url: string, options?: GoToOptions) => Promise<HTTPResponse | null>>;
  // Use jest.Mock<any> for screenshot to bypass overload issues
  screenshot: jest.Mock<any>; 
};

// Combine the mock methods with the base types using Pick
export type MockedBrowser = Pick<Browser, 'wsEndpoint' | 'newPage' | 'close'> & MockBrowserMethods;
export type MockedPage = Pick<Page, 'setViewport' | 'goto' | 'screenshot'> & MockPageMethods;

// Update function signatures and implementations
export const createMockBrowser = (): MockedBrowser => ({
  wsEndpoint: jest.fn<() => string>(),
  newPage: jest.fn<() => Promise<Page>>(),
  close: jest.fn<() => Promise<void>>(),
});

export const createMockPage = (): MockedPage => ({
  setViewport: jest.fn<(viewport: Viewport) => Promise<void>>(),
  goto: jest.fn<(url: string, options?: GoToOptions) => Promise<HTTPResponse | null>>(),
  screenshot: jest.fn<any>(), // Use jest.fn<any>()
});

// Update return type and implementation of the setup function
export const setupDefaultBrowserMocks = (): { mockBrowser: MockedBrowser; mockPage: MockedPage } => {
  const mockBrowser = createMockBrowser();
  const mockPage = createMockPage();

  // Set default successful responses
  mockBrowser.wsEndpoint.mockReturnValue('ws://localhost:1234');
  // Use double assertion as recommended by TS
  mockBrowser.newPage.mockResolvedValue(mockPage as unknown as Page);
  mockBrowser.close.mockResolvedValue(undefined);
  mockPage.setViewport.mockResolvedValue(undefined);
  mockPage.goto.mockResolvedValue(null);
  mockPage.screenshot.mockResolvedValue(Buffer.from('test-screenshot'));

  return { mockBrowser, mockPage };
};

// Tests for the mocks
describe('Browser Mocks', () => {
  it('should setup default browser mocks', () => {
    const { mockBrowser, mockPage } = setupDefaultBrowserMocks();
    expect(mockBrowser).toBeDefined();
    expect(mockPage).toBeDefined();
    expect(mockBrowser.wsEndpoint).toBeDefined();
    expect(mockBrowser.newPage).toBeDefined();
  });
}); 