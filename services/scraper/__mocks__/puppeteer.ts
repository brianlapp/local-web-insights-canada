// Mock of Puppeteer browser and page
const mockScreenshot = jest.fn().mockResolvedValue(Buffer.from('test-screenshot'));
const mockGoto = jest.fn().mockResolvedValue({ status: () => 200 });
const mockSetViewport = jest.fn();
const mockPageClose = jest.fn();

const mockPage = {
  setViewport: mockSetViewport,
  goto: mockGoto,
  screenshot: mockScreenshot,
  close: mockPageClose
};

const mockNewPage = jest.fn().mockResolvedValue(mockPage);
const mockBrowserClose = jest.fn();
const mockWsEndpoint = jest.fn().mockReturnValue('ws://localhost:3000');

const mockBrowser = {
  newPage: mockNewPage,
  close: mockBrowserClose,
  wsEndpoint: mockWsEndpoint
};

// Main Puppeteer mock
const puppeteer = {
  launch: jest.fn().mockResolvedValue(mockBrowser)
};

// Export individual mocks for direct test control
const mocks = {
  browser: mockBrowser,
  page: mockPage,
  screenshot: mockScreenshot,
  goto: mockGoto,
  setViewport: mockSetViewport,
  newPage: mockNewPage,
  browserClose: mockBrowserClose,
  pageClose: mockPageClose
};

// Export using CommonJS for Jest mock compatibility
module.exports = puppeteer;
module.exports.mocks = mocks; 