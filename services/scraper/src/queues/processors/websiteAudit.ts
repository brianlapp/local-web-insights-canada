import { Job } from 'bull';
import puppeteer from 'puppeteer';
// @ts-ignore - Suppress CJS/ESM module conflict for type import
import type { RunnerResult } from 'lighthouse'; // Use RunnerResult type
import { createClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger';

// Keep CJS require
const lighthouse = require('lighthouse'); 

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string
);

interface WebsiteAuditJobData {
  businessId: string;
  url: string;
}

interface LighthouseAudit {
  title: string;
  score: number | null;
}

export async function processWebsiteAudit(job: Job<WebsiteAuditJobData>) {
  const { businessId, url } = job.data;
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Create a new page
    const page = await browser.newPage();
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

    // Take mobile screenshot
    await page.setViewport({ width: 375, height: 667 });
    let mobileScreenshot;
    try {
      mobileScreenshot = await page.screenshot({ fullPage: true });
    } catch (error) {
      logger.error('Failed to take mobile screenshot:', error);
      throw error;
    }
    const mobileScreenshotPath = `businesses/${businessId}/mobile-${Date.now()}.png`;

    // Use RunnerResult for type annotation
    let lighthouseResult: RunnerResult | undefined; 
    try {
      // Keep require call
      lighthouseResult = await lighthouse(url, {
        port: Number((new URL(browser.wsEndpoint())).port),
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      });
    } catch (error) {
      logger.error('Lighthouse audit failed:', error);
      throw error;
    }

    // Access lhr from RunnerResult
    const lhr = lighthouseResult?.lhr; 

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

      // Extract scores using lhr
      const scores = {
        performance: Math.round((lhr?.categories?.performance?.score || 0) * 100),
        accessibility: Math.round((lhr?.categories?.accessibility?.score || 0) * 100),
        bestPractices: Math.round((lhr?.categories?.['best-practices']?.score || 0) * 100),
        seo: Math.round((lhr?.categories?.seo?.score || 0) * 100)
      };

      // Extract improvements using lhr
      const suggestedImprovements = extractSuggestedImprovements(lhr);

      // Update business record
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          scores,
          desktopScreenshot: desktopScreenshotPath,
          mobileScreenshot: mobileScreenshotPath,
          auditDate: new Date().toISOString(),
          suggestedImprovements
        })
        .eq('id', businessId);

      if (updateError) {
        logger.error('Failed to update business record:', updateError);
        throw new Error(`Database Error: ${updateError.message}`);
      }

      // If all succeeds, return the scores from the main function scope
      (job.data as any).finalScores = scores; // Temporary store scores on job data
    })();

    // Retrieve scores stored on job data
    const finalScores = (job.data as any).finalScores;
    delete (job.data as any).finalScores; // Clean up temporary data

    return { scores: finalScores }; // Return the final scores

  } catch (error) {
    logger.error('Website audit failed:', error);
    return Promise.reject(error);
  } finally {
    await browser.close();
  }
}

function extractSuggestedImprovements(lhr: RunnerResult['lhr'] | undefined) {
  const improvements: string[] = [];
  if (!lhr) return improvements;

  const audits = lhr.audits || {};

  Object.values(audits).forEach((audit) => {
    const typedAudit = audit as LighthouseAudit;
    if (typedAudit.score !== null && typedAudit.score < 0.9 && typedAudit.title) {
      improvements.push(typedAudit.title);
    }
  });

  return improvements.slice(0, 10);
} 