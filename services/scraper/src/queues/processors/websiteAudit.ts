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
import { validateUrl, UrlValidationResult } from '../../utils/urlValidator';
import { detectTechnologies, TechnologyCategory } from '../../utils/techDetector';
import { calculateWebsiteScore, WebsiteScore } from '../../utils/scoreCalculator';

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
  options?: {
    validateOnly?: boolean;
    detectTechnologies?: boolean;
    fullAudit?: boolean;
  };
}

export async function processWebsiteAudit(job: Job<WebsiteAuditJobData>) {
  const { businessId, url, retryCount = 0, options = {} } = job.data;
  const { validateOnly = false, detectTechnologies: shouldDetectTech = true, fullAudit = true } = options;
  
  logger.info(`Starting website audit for business ${businessId} at ${url} with options:`, options);
  
  // Step 1: Validate URL
  logger.info(`Validating URL: ${url}`);
  const urlValidation: UrlValidationResult = await validateUrl(url);
  
  if (!urlValidation.isValid) {
    logger.error(`Invalid URL for business ${businessId}: ${urlValidation.error}`);
    
    // Update business record with URL validation error
    await supabase
      .from('businesses')
      .update({
        url_validation: urlValidation,
        auditDate: new Date().toISOString(),
        audit_status: 'failed',
        audit_error: urlValidation.error
      })
      .eq('id', businessId);
      
    return {
      error: urlValidation.error,
      details: 'URL validation failed',
      urlValidation
    };
  }
  
  // If validation-only option is enabled, return early with validation results
  if (validateOnly) {
    await supabase
      .from('businesses')
      .update({
        url_validation: urlValidation,
        auditDate: new Date().toISOString(),
        audit_status: 'validated'
      })
      .eq('id', businessId);
      
    return {
      urlValidation,
      status: 'validated',
      details: 'URL validation completed successfully'
    };
  }
  
  // If URL was redirected, use the final URL
  const finalUrl = urlValidation.redirectUrl || urlValidation.normalizedUrl;
  logger.info(`Using final URL: ${finalUrl}`);
  
  // Step 2: Detect technologies if enabled
  let technologies: TechnologyCategory[] = [];
  if (shouldDetectTech) {
    logger.info(`Detecting technologies for ${finalUrl}`);
    try {
      technologies = await detectTechnologies(finalUrl);
      logger.info(`Detected ${technologies.length} technology categories`);
      
      // If only technology detection is requested (not full audit), update and return
      if (!fullAudit) {
        await supabase
          .from('businesses')
          .update({
            url_validation: urlValidation,
            technologies,
            final_url: finalUrl,
            auditDate: new Date().toISOString(),
            audit_status: 'tech-detected'
          })
          .eq('id', businessId);
          
        return {
          urlValidation,
          technologies,
          status: 'tech-detected',
          details: 'Technology detection completed successfully'
        };
      }
    } catch (error) {
      logger.warn(`Technology detection failed: ${error instanceof Error ? error.message : String(error)}`);
      // Continue despite technology detection failure
    }
  }
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Run desktop audit
    logger.info(`Running desktop audit for ${finalUrl}`);
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to the URL
    try {
      await page.goto(finalUrl, {
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
      desktopLighthouseResult = await lighthouse(finalUrl, {
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
    logger.info(`Running mobile audit for ${finalUrl}`);
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
      mobileLighthouseResult = await lighthouse(finalUrl, {
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

    // Calculate comprehensive website scores
    const websiteScore = calculateWebsiteScore(desktopMetrics, mobileMetrics, technologies);

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
          scores: {
            performance: websiteScore.performance,
            accessibility: websiteScore.accessibility,
            bestPractices: websiteScore.bestPractices,
            seo: websiteScore.seo,
            mobile: websiteScore.mobile,
            technical: websiteScore.technical
          },
          overall_score: websiteScore.overall,
          detailed_metrics: {
            desktop: desktopMetrics,
            mobile: mobileMetrics
          },
          device_comparison: comparison,
          desktopScreenshot: desktopScreenshotPath,
          mobileScreenshot: mobileScreenshotPath,
          auditDate: new Date().toISOString(),
          audit_status: 'completed',
          url_validation: urlValidation,
          technologies,
          final_url: finalUrl,
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
          url: finalUrl,
          original_url: url,
          scores: {
            performance: websiteScore.performance,
            accessibility: websiteScore.accessibility,
            bestPractices: websiteScore.bestPractices,
            seo: websiteScore.seo,
            mobile: websiteScore.mobile,
            technical: websiteScore.technical
          },
          overall_score: websiteScore.overall,
          desktop_metrics: desktopMetrics,
          mobile_metrics: mobileMetrics,
          device_comparison: comparison,
          recommendations,
          technologies,
          url_validation: urlValidation
        });

      if (auditError) {
        logger.warn('Failed to store audit history record:', auditError);
        // Don't fail the whole job for this non-critical operation
      }
    })();

    // Return results
    return { 
      scores: {
        performance: websiteScore.performance,
        accessibility: websiteScore.accessibility,
        bestPractices: websiteScore.bestPractices,
        seo: websiteScore.seo,
        mobile: websiteScore.mobile,
        technical: websiteScore.technical
      },
      overallScore: websiteScore.overall,
      desktopMetrics,
      mobileMetrics,
      comparison,
      recommendationsCount: recommendations.length,
      technologiesCount: technologies.length,
      url: finalUrl
    };

  } catch (error) {
    logger.error('Website audit failed:', error);
    
    // Update business record with error
    await supabase
      .from('businesses')
      .update({
        auditDate: new Date().toISOString(),
        audit_status: 'failed',
        audit_error: error instanceof Error ? error.message : 'Unknown error',
        url_validation: urlValidation
      })
      .eq('id', businessId);
    
    // Handle retry logic for recoverable errors
    const MAX_RETRIES = 2;
    if (retryCount < MAX_RETRIES) {
      return {
        shouldRetry: true,
        retryCount: retryCount + 1,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // If max retries exceeded
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: finalUrl
    };
  } finally {
    // Ensure browser is closed
    await browser.close();
  }
} 