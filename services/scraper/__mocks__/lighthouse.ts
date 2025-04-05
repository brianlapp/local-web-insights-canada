// Mock Lighthouse module
const runnerResult = {
  lhr: {
    categories: {
      performance: { score: 0.85 },
      accessibility: { score: 0.90 },
      'best-practices': { score: 0.87 },
      seo: { score: 0.95 }
    },
    audits: {
      'first-contentful-paint': { score: 0.8, numericValue: 1200 },
      'speed-index': { score: 0.75, numericValue: 2000 },
      'largest-contentful-paint': { score: 0.7, numericValue: 2500 },
      'total-blocking-time': { score: 0.9, numericValue: 100 },
      'cumulative-layout-shift': { score: 0.85, numericValue: 0.1 },
      'server-response-time': { score: 0.9, numericValue: 200 },
      'uses-responsive-images': { score: 1, details: { items: [] } },
      'unminified-css': { score: 0.8, details: { items: [{ url: 'https://example.com/style.css' }] } },
      'unminified-javascript': { score: 0.9, details: { items: [] } },
      'render-blocking-resources': { score: 0.7, details: { items: [{ url: 'https://example.com/script.js' }] } }
    }
  }
};

// CommonJS export pattern for Jest mocks
const lighthouse = jest.fn().mockResolvedValue(runnerResult);

module.exports = lighthouse;
module.exports.runnerResult = runnerResult; 