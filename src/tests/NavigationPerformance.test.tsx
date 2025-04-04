import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import puppeteer, { Browser, Page } from 'puppeteer'
import { createServer } from 'vite'
import type { ViteDevServer } from 'vite'

// Performance measurement utility
const measureNavigationTiming = async (page: Page) => {
  return await page.evaluate(() => {
    const entries = performance.getEntriesByType('navigation')
    const navigation = entries[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    return {
      navigationStart: navigation.startTime,
      responseEnd: navigation.responseEnd,
      domComplete: navigation.domComplete,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
      resourceCount: resources.length,
      resourceLoadTime: Math.max(...resources.map(r => r.responseEnd)),
    }
  })
}

describe('Navigation Performance', () => {
  let server: ViteDevServer
  let browser: Browser
  let page: Page
  const PORT = 3001
  const BASE_URL = `http://localhost:${PORT}`

  // Performance thresholds (in milliseconds)
  const NAV_THRESHOLDS = {
    TRANSITION_TIME: 100,    // Time for route transition
    RESOURCE_LOAD: 800,      // Time for new route resources
    PAINT_TIME: 50,         // Time to first paint after navigation
    CACHE_LOAD: 50          // Time to load from cache
  }

  beforeAll(async () => {
    server = await createServer({
      server: { port: PORT },
      logLevel: 'silent'
    })
    await server.listen()

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    })
    page = await browser.newPage()
    
    // Enable performance metrics
    await page.setCacheEnabled(true)
    await page.coverage.startJSCoverage()
  })

  afterAll(async () => {
    await page.coverage.stopJSCoverage()
    await browser.close()
    await server.close()
  })

  it('performs instant navigation between routes', async () => {
    await page.goto(`${BASE_URL}/`)
    const initialTiming = await measureNavigationTiming(page)
    
    // Navigate to tools page
    await page.click('a[href="/tools"]')
    const navigationTiming = await measureNavigationTiming(page)
    
    expect(navigationTiming.domComplete - navigationTiming.navigationStart)
      .toBeLessThan(NAV_THRESHOLDS.TRANSITION_TIME)
  })

  it('caches and reuses route components', async () => {
    // First visit to cache the route
    await page.goto(`${BASE_URL}/tools`)
    await page.waitForSelector('[data-testid="tools-grid"]')
    
    // Navigate away
    await page.click('a[href="/"]')
    await page.waitForSelector('[data-testid="home-content"]')
    
    // Navigate back to measure cached performance
    const navigationStart = await page.evaluate(() => performance.now())
    await page.click('a[href="/tools"]')
    const navigationEnd = await page.evaluate(() => performance.now())
    
    expect(navigationEnd - navigationStart).toBeLessThan(NAV_THRESHOLDS.CACHE_LOAD)
  })

  it('optimizes resource loading during navigation', async () => {
    await page.goto(`${BASE_URL}/`)
    
    // Clear existing resources
    await page.evaluate(() => performance.clearResourceTimings())
    
    // Navigate to business audit page
    await page.click('a[href="/audit"]')
    const timing = await measureNavigationTiming(page)
    
    expect(timing.resourceLoadTime).toBeLessThan(NAV_THRESHOLDS.RESOURCE_LOAD)
  })

  it('maintains smooth transitions during data fetching', async () => {
    await page.goto(`${BASE_URL}/tools`)
    
    // Navigate to a business audit page that requires data fetching
    const transitionStart = await page.evaluate(() => performance.now())
    await page.click('a[href="/audit/123"]')
    
    // Measure time until first paint of new content
    const timing = await measureNavigationTiming(page)
    
    expect(timing.firstPaint).toBeLessThan(NAV_THRESHOLDS.PAINT_TIME)
  })

  it('prefetches routes on hover', async () => {
    await page.goto(`${BASE_URL}/`)
    
    // Hover over a link to trigger prefetch
    await page.hover('a[href="/tools"]')
    await new Promise(resolve => setTimeout(resolve, 100)) // Wait for prefetch
    
    const beforeNav = await page.evaluate(() => performance.now())
    await page.click('a[href="/tools"]')
    const afterNav = await page.evaluate(() => performance.now())
    
    expect(afterNav - beforeNav).toBeLessThan(NAV_THRESHOLDS.CACHE_LOAD)
  })
}) 