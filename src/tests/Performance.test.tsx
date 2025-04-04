import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import lighthouse from 'lighthouse'
import puppeteer from 'puppeteer'
import { createServer } from 'vite'
import type { ViteDevServer } from 'vite'
import type { Browser } from 'puppeteer'

describe('Page Load Performance', () => {
  let server: ViteDevServer
  let browser: Browser
  const PORT = 3001
  const BASE_URL = `http://localhost:${PORT}`

  // Performance thresholds (in milliseconds)
  const THRESHOLDS = {
    FCP: 1800, // First Contentful Paint
    LCP: 2500, // Largest Contentful Paint
    TBT: 300,  // Total Blocking Time
    CLS: 0.1,  // Cumulative Layout Shift
    TTI: 3800  // Time to Interactive
  }

  beforeAll(async () => {
    // Start dev server
    server = await createServer({
      server: {
        port: PORT,
      },
      logLevel: 'silent',
    })
    await server.listen()

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  })

  afterAll(async () => {
    await browser.close()
    await server.close()
  })

  const runLighthouse = async (path: string) => {
    const page = await browser.newPage()
    const url = `${BASE_URL}${path}`
    const wsEndpoint = browser.wsEndpoint()
    const port = wsEndpoint ? parseInt(new URL(wsEndpoint).port) : 0

    const { lhr } = await lighthouse(url, {
      port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance'],
    })

    await page.close()
    return lhr
  }

  describe('Home Page', () => {
    it('meets First Contentful Paint threshold', async () => {
      const results = await runLighthouse('/')
      const fcp = results.audits['first-contentful-paint'].numericValue

      expect(fcp).toBeLessThanOrEqual(THRESHOLDS.FCP)
    })

    it('meets Largest Contentful Paint threshold', async () => {
      const results = await runLighthouse('/')
      const lcp = results.audits['largest-contentful-paint'].numericValue

      expect(lcp).toBeLessThanOrEqual(THRESHOLDS.LCP)
    })

    it('meets Total Blocking Time threshold', async () => {
      const results = await runLighthouse('/')
      const tbt = results.audits['total-blocking-time'].numericValue

      expect(tbt).toBeLessThanOrEqual(THRESHOLDS.TBT)
    })

    it('meets Cumulative Layout Shift threshold', async () => {
      const results = await runLighthouse('/')
      const cls = results.audits['cumulative-layout-shift'].numericValue

      expect(cls).toBeLessThanOrEqual(THRESHOLDS.CLS)
    })

    it('meets Time to Interactive threshold', async () => {
      const results = await runLighthouse('/')
      const tti = results.audits['interactive'].numericValue

      expect(tti).toBeLessThanOrEqual(THRESHOLDS.TTI)
    })

    it('Home Page meets performance thresholds', async () => {
      const results = await runLighthouse('/')
      
      expect(results.audits['first-contentful-paint'].numericValue).toBeLessThan(THRESHOLDS.FCP)
      expect(results.audits['largest-contentful-paint'].numericValue).toBeLessThan(THRESHOLDS.LCP)
      expect(results.audits['total-blocking-time'].numericValue).toBeLessThan(THRESHOLDS.TBT)
      expect(results.audits['cumulative-layout-shift'].numericValue).toBeLessThan(THRESHOLDS.CLS)
      expect(results.audits['interactive'].numericValue).toBeLessThan(THRESHOLDS.TTI)
    })
  })

  describe('Tools Directory', () => {
    it('meets First Contentful Paint threshold', async () => {
      const results = await runLighthouse('/tools')
      const fcp = results.audits['first-contentful-paint'].numericValue

      expect(fcp).toBeLessThanOrEqual(THRESHOLDS.FCP)
    })

    it('meets performance score threshold with tool listings', async () => {
      const results = await runLighthouse('/tools')
      const score = results.categories.performance.score * 100

      expect(score).toBeGreaterThanOrEqual(90)
    })

    it('efficiently loads and renders tool cards', async () => {
      const results = await runLighthouse('/tools')
      const renderBlocking = results.audits['render-blocking-resources'].numericValue

      expect(renderBlocking).toBeLessThanOrEqual(300) // 300ms threshold
    })

    it('Tools Directory loads efficiently', async () => {
      const results = await runLighthouse('/tools')
      
      expect(results.audits['first-contentful-paint'].numericValue).toBeLessThan(THRESHOLDS.FCP)
      expect(results.categories.performance.score).toBeGreaterThan(0.8) // 80% performance score
      expect(results.audits['render-blocking-resources'].numericValue).toBeLessThan(1000)
    })
  })

  describe('Business Audit Page', () => {
    it('meets First Contentful Paint threshold', async () => {
      const results = await runLighthouse('/test-business')
      const fcp = results.audits['first-contentful-paint'].numericValue

      expect(fcp).toBeLessThanOrEqual(THRESHOLDS.FCP)
    })

    it('efficiently loads and displays charts', async () => {
      const results = await runLighthouse('/test-business')
      const renderBlocking = results.audits['render-blocking-resources'].numericValue

      expect(renderBlocking).toBeLessThanOrEqual(300) // 300ms threshold
    })

    it('maintains performance with dynamic data loading', async () => {
      const results = await runLighthouse('/test-business')
      const score = results.categories.performance.score * 100

      expect(score).toBeGreaterThanOrEqual(85)
    })

    it('Business Audit Page handles dynamic data loading', async () => {
      const results = await runLighthouse('/audit')
      
      expect(results.audits['server-response-time'].numericValue).toBeLessThan(600)
      expect(results.audits['mainthread-work-breakdown'].numericValue).toBeLessThan(4000)
      expect(results.audits['dom-size'].numericValue).toBeLessThan(1500)
    })
  })

  describe('Core Web Vitals', () => {
    const pages = ['/', '/tools', '/test-business']

    pages.forEach(path => {
      it(`${path} meets all Core Web Vitals thresholds`, async () => {
        const results = await runLighthouse(path)

        // Core Web Vitals checks
        const lcp = results.audits['largest-contentful-paint'].numericValue
        const fid = results.audits['max-potential-fid'].numericValue
        const cls = results.audits['cumulative-layout-shift'].numericValue

        expect(lcp).toBeLessThanOrEqual(2500) // Good LCP threshold
        expect(fid).toBeLessThanOrEqual(100)  // Good FID threshold
        expect(cls).toBeLessThanOrEqual(0.1)  // Good CLS threshold
      })
    })

    const CORE_WEB_VITALS_PATHS = ['/', '/tools', '/audit', '/settings']
    
    CORE_WEB_VITALS_PATHS.forEach(path => {
      it(`Core Web Vitals pass on ${path}`, async () => {
        const results = await runLighthouse(path)
        
        // Core Web Vitals thresholds
        expect(results.audits['largest-contentful-paint'].numericValue).toBeLessThan(2500)
        expect(results.audits['first-input-delay'].numericValue).toBeLessThan(100)
        expect(results.audits['cumulative-layout-shift'].numericValue).toBeLessThan(0.1)
      })
    })
  })
}) 