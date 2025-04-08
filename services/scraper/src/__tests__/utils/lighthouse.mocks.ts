// Using type-only imports to avoid module system issues
import type { RunnerResult, Artifacts } from 'lighthouse';
import type { Result } from 'lighthouse';
import type { ConfigSettings, ThrottlingSettings, ScreenEmulationSettings } from 'lighthouse/types/lhr/settings';

// Define the base configuration settings
const defaultConfigSettings: ConfigSettings = {
  output: ['json'],
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
  onlyAudits: null,
  skipAudits: null,
  channel: 'devtools',
  maxWaitForFcp: 30000,
  maxWaitForLoad: 45000,
  blockedUrlPatterns: [],
  additionalTraceCategories: null,
  throttlingMethod: 'simulate',
  auditMode: false,
  gatherMode: 'navigation',
  disableStorageReset: false,
  disableFullPageScreenshot: false,
  extraHeaders: {},
  precomputedLanternData: null,
  budgets: null,
  skipAboutBlank: false,
  emulatedUserAgent: 'Chrome/91.0.4472.124',
  clearStorageTypes: [],
  debugNavigation: false,
  usePassiveGathering: false,
  pauseAfterFcpMs: 1000,
  pauseAfterLoadMs: 1000,
  networkQuietThresholdMs: 1000,
  cpuQuietThresholdMs: 1000,
  blankPage: 'about:blank',
  ignoreStatusCode: false
};

// Define the base artifacts with all required properties
const defaultArtifacts: Artifacts = {
  // Base required properties
  fetchTime: new Date().toISOString(),
  LighthouseRunWarnings: [],
  Timing: [{
    name: 'lh:init',
    startTime: 0,
    duration: 1000,
    entryType: 'measure'
  }],
  PageLoadError: null,
  Stacks: [],
  traces: { defaultPass: { traceEvents: [] } },
  devtoolsLogs: { defaultPass: [] },
  settings: defaultConfigSettings,
  
  // Required by UniversalBaseArtifacts
  HostProduct: 'chrome',
  HostFormFactor: 'desktop',
  HostUserAgent: 'Chrome/91.0.4472.124',
  NetworkUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  BenchmarkIndex: 1000,
  GatherContext: { gatherMode: 'navigation' },
  
  // URL information
  URL: {
    requestedUrl: 'https://example.com',
    finalDisplayedUrl: 'https://example.com',
    mainDocumentUrl: 'https://example.com'
  },

  // Required feature artifacts
  WebAppManifest: null,
  InstallabilityErrors: { errors: [] },
  Accessibility: { 
    version: '1.0.0',
    violations: [], 
    incomplete: [], 
    passes: [], 
    notApplicable: [] 
  },
  ConsoleMessages: [],
  ViewportDimensions: {
    innerWidth: 1920,
    innerHeight: 1080,
    outerWidth: 1920,
    outerHeight: 1080,
    devicePixelRatio: 1
  },
  FullPageScreenshot: null,

  // Additional required artifacts
  MainDocumentContent: '',
  ImageElements: [],
  LinkElements: [],
  MetaElements: [],
  ScriptElements: [],
  IFrameElements: [],
  EmbeddedContent: [],
  ServiceWorker: { versions: [], registrations: [] },
  Doctype: { 
    name: 'html', 
    publicId: '', 
    systemId: '', 
    documentCompatMode: 'standards-mode' 
  },
  DOMStats: {
    totalBodyElements: 100,
    width: {
      lhId: 'width-node',
      devtoolsNodePath: '1,HTML,2,BODY',
      selector: 'body',
      boundingRect: {
        top: 0,
        bottom: 1080,
        left: 0,
        right: 1920,
        width: 1920,
        height: 1080
      },
      snippet: '<body>',
      nodeLabel: 'body',
      max: 1920
    },
    depth: {
      lhId: 'depth-node',
      devtoolsNodePath: '1,HTML,2,BODY',
      selector: 'body',
      boundingRect: {
        top: 0,
        bottom: 1080,
        left: 0,
        right: 1920,
        width: 1920,
        height: 1080
      },
      snippet: '<body>',
      nodeLabel: 'body',
      max: 10
    }
  },

  // Additional required properties from GathererArtifacts
  AnchorElements: [],
  BFCacheFailures: [{
    notRestoredReasonsTree: {
      SupportPending: {},
      PageSupportNeeded: {},
      Circumstantial: {}
    }
  }],
  CacheContents: [],
  CSSUsage: { 
    stylesheets: [],
    rules: []
  },
  DevtoolsLog: [],
  DevtoolsLogError: [],
  Inputs: {
    inputs: [],
    forms: [],
    labels: []
  },
  RootCauses: {
    layoutShifts: {}
  },
  Trace: {
    traceEvents: []
  },
  TraceError: {
    traceEvents: []
  },
  FontSize: {
    totalTextLength: 0,
    failingTextLength: 0,
    analyzedFailingTextLength: 0,
    analyzedFailingNodesData: []
  },
  GlobalListeners: [],
  InspectorIssues: {
    attributionReportingIssue: [],
    blockedByResponseIssue: [],
    bounceTrackingIssue: [],
    clientHintIssue: [],
    contentSecurityPolicyIssue: [],
    cookieDeprecationMetadataIssue: [],
    corsIssue: [],
    deprecationIssue: [],
    federatedAuthRequestIssue: [],
    genericIssue: [],
    heavyAdIssue: [],
    lowTextContrastIssue: [],
    mixedContentIssue: [],
    navigatorUserAgentIssue: [],
    propertyRuleIssue: [],
    quirksModeIssue: [],
    cookieIssue: [],
    sharedArrayBufferIssue: [],
    stylesheetLoadingIssue: [],
    federatedAuthUserInfoRequestIssue: []
  },
  JsUsage: {},
  OptimizedImages: [],
  ResponseCompression: [],
  RobotsTxt: { status: null, content: null },
  Scripts: [],
  SourceMaps: [],
  TagsBlockingFirstPaint: [],
  TapTargets: [],
  TraceElements: []
};

// Create the base lighthouse result
const createBaseLighthouseResult = (): RunnerResult => ({
  lhr: {
    requestedUrl: 'https://example.com',
    finalDisplayedUrl: 'https://example.com',
    mainDocumentUrl: 'https://example.com',
    finalUrl: 'https://example.com',
    fetchTime: new Date().toISOString(),
    gatherMode: 'navigation',
    lighthouseVersion: '10.0.0',
    userAgent: 'Chrome/91.0.4472.124',
    environment: {
      networkUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      hostUserAgent: 'Chrome/91.0.4472.124',
      benchmarkIndex: 1000
    },
    runWarnings: [],
    configSettings: defaultConfigSettings,
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
    timing: {
      total: 5000,
      entries: []
    },
    i18n: {
      rendererFormattedStrings: {}
    },
    stackPacks: []
  },
  report: JSON.stringify({
    categories: {
      performance: {
        score: 0.9
      },
      accessibility: {
        score: 0.8
      },
      'best-practices': {
        score: 0.7
      },
      seo: {
        score: 0.6
      }
    },
    audits: {}
  }),
  artifacts: defaultArtifacts
});

// Factory function for creating empty lighthouse results
const createEmptyLighthouseResult = (): RunnerResult => ({
  lhr: {
    requestedUrl: 'https://example.com',
    finalDisplayedUrl: 'https://example.com',
    mainDocumentUrl: 'https://example.com',
    finalUrl: 'https://example.com',
    fetchTime: new Date().toISOString(),
    gatherMode: 'navigation',
    lighthouseVersion: '10.0.0',
    userAgent: 'Chrome/91.0.4472.124',
    environment: {
      networkUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      hostUserAgent: 'Chrome/91.0.4472.124',
      benchmarkIndex: 1000
    },
    runWarnings: [],
    configSettings: defaultConfigSettings,
    categories: {},
    audits: {},
    timing: {
      total: 5000,
      entries: []
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
  artifacts: defaultArtifacts
});

describe('Lighthouse Mocks', () => {
  it('should create base Lighthouse result', () => {
    const result = createBaseLighthouseResult();
    expect(result).toBeDefined();
    expect(result.lhr.categories).toBeDefined();
    expect(result.lhr.categories.performance).toBeDefined();
  });

  it('should create empty Lighthouse result', () => {
    const result = createEmptyLighthouseResult();
    expect(result).toBeDefined();
    expect(result.lhr.categories).toBeDefined();
    expect(Object.keys(result.lhr.categories)).toHaveLength(0);
  });
});

export {
  createBaseLighthouseResult,
  createEmptyLighthouseResult,
  defaultConfigSettings,
  defaultArtifacts
}; 