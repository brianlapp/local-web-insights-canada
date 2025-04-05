import { Job } from 'bull';
import puppeteer from 'puppeteer';
// @ts-ignore - Suppress CJS/ESM module conflict for type import
import type { RunnerResult } from 'lighthouse';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger';
import { 
  extractDetailedMetrics, 
  compareMetrics, 
  generateRecommendations, 
  DetailedMetrics,
  Recommendation
} from './websiteAuditUtils';

// Keep CJS require for compatibility
const lighthouse = require('lighthouse');

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string
);

interface WebsiteAuditJobData {
  businessId: string;
  url: string;
  retryCount?: number;
}

export async function processWebsiteAudit(job: Job<WebsiteAuditJobData>) {
  const { businessId, url, retryCount = 0 } = job.data;
  logger.info(`Starting website audit for business ${businessId} at ${url}`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Run desktop audit
    logger.info(`Running desktop audit for ${url}`);
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to the URL
    try {
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
    } catch (error) {
      logger.error('Navigation failed:', error);
      throw error;
    }

    // Take desktop screenshot
    let desktopScreenshot;
    try {
      desktopScreenshot = await page.screenshot({ fullPage: true });
    } catch (error) {
      logger.error('Failed to take desktop screenshot:', error);
      throw error;
    }
    const desktopScreenshotPath = `businesses/${businessId}/desktop-${Date.now()}.png`;

    // Run Lighthouse for desktop
    let desktopLighthouseResult: RunnerResult | undefined;
    try {
      desktopLighthouseResult = await lighthouse(url, {
        port: Number((new URL(browser.wsEndpoint())).port),
        output: 'json',
        logLevel: 'error',
        formFactor: 'desktop',
        screenEmulation: {
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          mobile: false,
          disabled: false
        },
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      });
    } catch (error) {
      logger.error('Desktop Lighthouse audit failed:', error);
      throw error;
    }

    // Run mobile audit
    logger.info(`Running mobile audit for ${url}`);
    await page.setViewport({ width: 375, height: 667, isMobile: true });
    
    // Wait for mobile view to load properly
    try {
      await page.reload({ waitUntil: 'networkidle0', timeout: 30000 });
    } catch (error) {
      logger.error('Mobile reload failed:', error);
      // Continue despite error, just log it
    }
    
    // Take mobile screenshot
    let mobileScreenshot;
    try {
      mobileScreenshot = await page.screenshot({ fullPage: true });
    } catch (error) {
      logger.error('Failed to take mobile screenshot:', error);
      throw error;
    }
    const mobileScreenshotPath = `businesses/${businessId}/mobile-${Date.now()}.png`;

    // Run Lighthouse for mobile
    let mobileLighthouseResult: RunnerResult | undefined;
    try {
      mobileLighthouseResult = await lighthouse(url, {
        port: Number((new URL(browser.wsEndpoint())).port),
        output: 'json',
        logLevel: 'error',
        formFactor: 'mobile',
        screenEmulation: {
          width: 375,
          height: 667,
          deviceScaleFactor: 2.625,
          mobile: true,
          disabled: false
        },
        throttling: {
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 150,
          downloadThroughputKbps: 1638.4,
          uploadThroughputKbps: 750
        },
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      });
    } catch (error) {
      logger.error('Mobile Lighthouse audit failed:', error);
      throw error;
    }

    // Access lhr from RunnerResults
    const desktopLhr = desktopLighthouseResult?.lhr;
    const mobileLhr = mobileLighthouseResult?.lhr;

    // Extract detailed metrics
    const desktopMetrics = extractDetailedMetrics(desktopLhr);
    const mobileMetrics = extractDetailedMetrics(mobileLhr);

    // Compare mobile vs desktop for insights
    const comparison = compareMetrics(desktopMetrics, mobileMetrics);

    // Generate prioritized recommendations
    const recommendations = generateRecommendations(desktopLhr, mobileLhr);

    // Calculate primary scores (averaging desktop and mobile)
    const scores = {
      performance: Math.round((desktopMetrics.performance.score + mobileMetrics.performance.score) / 2 * 100),
      accessibility: Math.round((desktopMetrics.accessibility.score + mobileMetrics.accessibility.score) / 2 * 100),
      bestPractices: Math.round((desktopMetrics.bestPractices.score + mobileMetrics.bestPractices.score) / 2 * 100),
      seo: Math.round((desktopMetrics.seo.score + mobileMetrics.seo.score) / 2 * 100)
    };

    // Wrap Supabase operations in an async IIFE to ensure errors are caught
    await (async () => {
      // Upload desktop screenshot
      const { error: desktopError } = await supabase.storage
        .from('public')
        .upload(desktopScreenshotPath, desktopScreenshot);

      if (desktopError) {
        logger.error('Failed to upload desktop screenshot:', desktopError);
        throw new Error(`Storage Error: ${desktopError.message}`);
      }

      // Upload mobile screenshot
      const { error: mobileError } = await supabase.storage
        .from('public')
        .upload(mobileScreenshotPath, mobileScreenshot);

      if (mobileError) {
        logger.error('Failed to upload mobile screenshot:', mobileError);
        throw new Error(`Storage Error: ${mobileError.message}`);
      }

      // Update business record with enhanced details
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          scores,
          detailed_metrics: {
            desktop: desktopMetrics,
            mobile: mobileMetrics
          },
          device_comparison: comparison,
          desktopScreenshot: desktopScreenshotPath,
          mobileScreenshot: mobileScreenshotPath,
          auditDate: new Date().toISOString(),
          suggestedImprovements: recommendations.map((rec: Recommendation) => ({
            title: rec.title,
            description: rec.description,
            impact: rec.impact,
            category: rec.category
          }))
        })
        .eq('id', businessId);

      if (updateError) {
        logger.error('Failed to update business record:', updateError);
        throw new Error(`Database Error: ${updateError.message}`);
      }

      // Store the full audit data in a separate table for historical tracking
      const { error: auditError } = await supabase
        .from('website_audits')
        .insert({
          business_id: businessId,
          audit_date: new Date().toISOString(),
          url: url,
          scores,
          desktop_metrics: desktopMetrics,
          mobile_metrics: mobileMetrics,
          device_comparison: comparison,
          recommendations: recommendations
        });

      if (auditError) {
        logger.warn('Failed to store audit history record:', auditError);
        // Don't fail the whole job for this non-critical operation
      }
    })();

    // Return results
    return { 
      scores,
      desktopMetrics,
      mobileMetrics,
      comparison,
      recommendationsCount: recommendations.length
    };

  } catch (error) {
    logger.error('Website audit failed:', error);
    
    // Handle retry logic for recoverable errors
    const MAX_RETRIES = 2;
    if (retryCount < MAX_RETRIES) {
      return {
        shouldRetry: true,
        retryCount: retryCount + 1,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Update business with failure status
    try {
      await supabase
        .from('businesses')
        .update({
          audit_status: 'failed',
          audit_error: error instanceof Error ? error.message : 'Unknown error',
          auditDate: new Date().toISOString()
        })
        .eq('id', businessId);
    } catch (dbError) {
      logger.error('Failed to update business error status:', dbError);
    }
    
    return Promise.reject(error);
  } finally {
    await browser.close();
  }
} 