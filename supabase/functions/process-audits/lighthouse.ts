
// Enhanced Lighthouse simulation with Chrome browser automation for Supabase Edge Functions

// Use proper Puppeteer import for Deno
import { Puppeteer } from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

// Constants for performance thresholds
const PERFORMANCE_METRICS = {
  FCP_GOOD: 1800, // First Contentful Paint (ms)
  LCP_GOOD: 2500, // Largest Contentful Paint (ms)
  CLS_GOOD: 0.1,  // Cumulative Layout Shift
  TTI_GOOD: 3800, // Time to Interactive (ms)
  TBT_GOOD: 200,  // Total Blocking Time (ms)
  FID_GOOD: 100   // First Input Delay (ms)
};

// Normalized score calculation function
function normalizeScore(value: number, min: number, max: number): number {
  const normalized = Math.min(Math.max((value - min) / (max - min), 0), 1);
  console.log(`Normalizing value ${value} between ${min} and ${max}: result = ${normalized}`);
  return normalized;
}

// Calculate performance score based on real metrics
function calculatePerformanceScore(metrics: any): number {
  // Log raw metrics for debugging
  console.log('Raw performance metrics:', JSON.stringify(metrics));
  
  // Use weighting similar to Lighthouse algorithm
  const fcpScore = normalizeScore(metrics.firstContentfulPaint || 3000, 1000, 4000);
  const lcpScore = normalizeScore(metrics.largestContentfulPaint || 4000, 2000, 6000);
  const clsScore = normalizeScore(metrics.cumulativeLayoutShift || 0.25, 0.1, 0.4);
  const ttiScore = normalizeScore(metrics.timeToInteractive || 5000, 3000, 7500);
  
  // Weighted calculation
  const performanceScore = (fcpScore * 0.25 + lcpScore * 0.35 + clsScore * 0.2 + ttiScore * 0.2);
  console.log(`Calculated performance score: ${performanceScore} (FCP: ${fcpScore}, LCP: ${lcpScore}, CLS: ${clsScore}, TTI: ${ttiScore})`);
  
  return performanceScore;
}

// Enhanced Lighthouse audit with proper Chrome metrics
export async function runLighthouse(url: string): Promise<any> {
  console.log('Launching browser for:', url);
  const startTime = Date.now();
  
  try {
    const browser = await Puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    try {
      console.log('Browser launched successfully');
      const page = await browser.newPage();
      
      // Set viewport to desktop size
      await page.setViewport({ width: 1280, height: 800 });
      
      // Set timeout for navigation to handle slow sites
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 // 30 seconds timeout
      });
      
      // Collect real performance metrics
      const performanceMetrics = await page.evaluate(() => {
        return {
          // @ts-ignore - These are standard web performance API metrics
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
          largestContentfulPaint: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0,
          cumulativeLayoutShift: performance.getEntriesByType('layout-shift').reduce((sum, entry) => sum + entry.value, 0),
          timeToInteractive: performance.timing.domInteractive - performance.timing.navigationStart,
          domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
          loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
        };
      }).catch(e => {
        console.error('Error getting performance metrics:', e);
        return {};
      });

      console.log('Collected performance metrics:', JSON.stringify(performanceMetrics));
      
      // Collect accessibility metrics
      const accessibilityIssues = await page.evaluate(() => {
        // Basic accessibility checks
        const imgWithoutAlt = document.querySelectorAll('img:not([alt])').length;
        const inputWithoutLabel = document.querySelectorAll('input:not([id])').length;
        const missingLangAttr = document.querySelector('html[lang]') ? 0 : 1;
        const headingsOutOfOrder = (() => {
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          let issues = 0;
          let prevLevel = 0;
          
          headings.forEach(h => {
            const level = parseInt(h.tagName.substring(1), 10);
            if (prevLevel > 0 && level > prevLevel + 1) {
              issues++;
            }
            prevLevel = level;
          });
          
          return issues;
        })();
        
        return {
          imgWithoutAlt,
          inputWithoutLabel,
          missingLangAttr,
          headingsOutOfOrder,
          totalIssues: imgWithoutAlt + inputWithoutLabel + missingLangAttr + headingsOutOfOrder
        };
      }).catch(e => {
        console.error('Error checking accessibility:', e);
        return { totalIssues: 0 };
      });
      
      console.log('Collected accessibility issues:', JSON.stringify(accessibilityIssues));
      
      // Collect SEO metrics
      const seoIssues = await page.evaluate(() => {
        const noMetaDesc = document.querySelector('meta[name="description"]') ? 0 : 1;
        const noH1 = document.querySelector('h1') ? 0 : 1;
        const noCanonical = document.querySelector('link[rel="canonical"]') ? 0 : 1;
        
        return {
          noMetaDesc,
          noH1,
          noCanonical,
          totalIssues: noMetaDesc + noH1 + noCanonical
        };
      }).catch(e => {
        console.error('Error checking SEO:', e);
        return { totalIssues: 0 };
      });
      
      console.log('Collected SEO issues:', JSON.stringify(seoIssues));
      
      // Collect best practices metrics
      const bestPracticesIssues = await page.evaluate(() => {
        const noDoctype = document.doctype ? 0 : 1;
        const noViewport = document.querySelector('meta[name="viewport"]') ? 0 : 1;
        const outdatedHtml = document.querySelector('meta[charset="utf-8"]') ? 0 : 1;
        
        return {
          noDoctype,
          noViewport,
          outdatedHtml,
          totalIssues: noDoctype + noViewport + outdatedHtml
        };
      }).catch(e => {
        console.error('Error checking best practices:', e);
        return { totalIssues: 0 };
      });
      
      console.log('Collected best practices issues:', JSON.stringify(bestPracticesIssues));
      
      // Calculate scores from collected metrics
      const performanceScore = calculatePerformanceScore(performanceMetrics);
      
      const accessibilityScore = accessibilityIssues.totalIssues === 0 ? 1.0 : 
                                 Math.max(0, 1 - (accessibilityIssues.totalIssues * 0.1));
      
      const seoScore = seoIssues.totalIssues === 0 ? 1.0 : 
                       Math.max(0, 1 - (seoIssues.totalIssues * 0.25));
      
      const bestPracticesScore = bestPracticesIssues.totalIssues === 0 ? 1.0 : 
                                Math.max(0, 1 - (bestPracticesIssues.totalIssues * 0.25));

      const elapsedTime = Date.now() - startTime;
      console.log(`Analysis completed for ${url} in ${elapsedTime}ms`);
      console.log(`Final scores - Performance: ${performanceScore}, Accessibility: ${accessibilityScore}, SEO: ${seoScore}, Best Practices: ${bestPracticesScore}`);

      // Format the result to match Lighthouse structure
      const result = {
        categories: {
          performance: { score: performanceScore },
          accessibility: { score: accessibilityScore },
          'best-practices': { score: bestPracticesScore },
          seo: { score: seoScore }
        },
        audits: {
          // Performance audits
          'first-contentful-paint': { 
            score: normalizeScore(performanceMetrics.firstContentfulPaint || 3000, 1000, 4000),
            numericValue: performanceMetrics.firstContentfulPaint 
          },
          'largest-contentful-paint': { 
            score: normalizeScore(performanceMetrics.largestContentfulPaint || 4000, 2000, 6000),
            numericValue: performanceMetrics.largestContentfulPaint
          },
          'cumulative-layout-shift': { 
            score: normalizeScore(performanceMetrics.cumulativeLayoutShift || 0.25, 0.1, 0.4),
            numericValue: performanceMetrics.cumulativeLayoutShift
          },
          'time-to-interactive': { 
            score: normalizeScore(performanceMetrics.timeToInteractive || 5000, 3000, 7500),
            numericValue: performanceMetrics.timeToInteractive
          },
          
          // Accessibility audits
          'image-alt': {
            score: accessibilityIssues.imgWithoutAlt === 0 ? 1 : 0,
            details: { items: [] }
          },
          'label': {
            score: accessibilityIssues.inputWithoutLabel === 0 ? 1 : 0,
            details: { items: [] }
          },
          
          // SEO audits
          'meta-description': {
            score: seoIssues.noMetaDesc === 0 ? 1 : 0,
            details: { items: [] }
          },
          'document-title': {
            score: await page.title() ? 1 : 0,
            details: { items: [] }
          },
          
          // Best practices audits
          'doctype': {
            score: bestPracticesIssues.noDoctype === 0 ? 1 : 0,
            details: { items: [] }
          },
          'viewport': {
            score: bestPracticesIssues.noViewport === 0 ? 1 : 0,
            details: { items: [] }
          }
        },
        metrics: performanceMetrics,
        title: await page.title(),
        url: url,
        fetchTime: new Date().toISOString()
      };

      return result;
    } catch (error) {
      console.error('Error during page analysis:', error);
      // Return a basic result with error information
      return {
        categories: {
          performance: { score: 0.5 },
          accessibility: { score: 0.5 },
          'best-practices': { score: 0.5 },
          seo: { score: 0.5 },
        },
        error: `Error analyzing page: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fetchTime: new Date().toISOString()
      };
    } finally {
      await browser.close();
      console.log('Browser closed');
    }
  } catch (browserError) {
    console.error('Failed to launch browser:', browserError);
    // Return a fallback result when browser launch fails
    return {
      categories: {
        performance: { score: 0.5 },
        accessibility: { score: 0.5 },
        'best-practices': { score: 0.5 },
        seo: { score: 0.5 },
      },
      error: 'Failed to launch browser',
      fetchTime: new Date().toISOString()
    };
  }
}
