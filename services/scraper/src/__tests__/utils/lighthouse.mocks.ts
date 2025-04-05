import { RunnerResult } from 'lighthouse';

export const createBaseLighthouseResult = (): RunnerResult => ({
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
      }
    },
    gatherMode: 'navigation',
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
      formFactor: 'desktop',
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 150,
        downloadThroughputKbps: 1638.4,
        uploadThroughputKbps: 675
      },
      screenEmulation: {
        mobile: false,
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
        disabled: false
      },
      locale: 'en-US',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      channel: 'devtools',
      maxWaitForFcp: 30000,
      maxWaitForLoad: 45000,
      output: ['json'],
      disableStorageReset: false,
      throttlingMethod: 'simulate'
    },
    timing: {
      entries: [],
      total: 5000
    },
    i18n: {
      rendererFormattedStrings: {}
    },
    stackPacks: []
  },
  report: '{}',
  artifacts: {
    URL: {
      requestedUrl: 'https://example.com',
      finalDisplayedUrl: 'https://example.com',
      mainDocumentUrl: 'https://example.com'
    },
    settings: {
      formFactor: 'desktop',
      locale: 'en-US',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      screenEmulation: {
        mobile: false,
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
        disabled: false
      },
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 150,
        downloadThroughputKbps: 1638.4,
        uploadThroughputKbps: 675
      },
      throttlingMethod: 'simulate',
      output: ['json']
    }
  },
  i18n: {
    rendererFormattedStrings: {}
  }
});

export const createEmptyLighthouseResult = (): RunnerResult => ({
  ...createBaseLighthouseResult(),
  lhr: {
    ...createBaseLighthouseResult().lhr,
    categories: {},
    audits: {}
  }
}); 