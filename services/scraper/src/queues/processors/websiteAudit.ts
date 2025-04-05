import { Job } from 'bull';
import puppeteer from 'puppeteer';
import { Result } from 'lighthouse';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger';

// Import lighthouse using require since we're mocking it that way in tests
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
      throw new Error(`Navigation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Take desktop screenshot
    const desktopScreenshot = await page.screenshot({ fullPage: true });
    const desktopScreenshotPath = `businesses/${businessId}/desktop-${Date.now()}.png`;

    // Take mobile screenshot
    await page.setViewport({ width: 375, height: 667 });
    const mobileScreenshot = await page.screenshot({ fullPage: true });
    const mobileScreenshotPath = `businesses/${businessId}/mobile-${Date.now()}.png`;

    // Run Lighthouse audit
    const lighthouseResult = await lighthouse(url, {
      port: (new URL(browser.wsEndpoint())).port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
    });

    // Upload desktop screenshot
    const { error: desktopError } = await supabase.storage
      .from('screenshots')
      .upload(desktopScreenshotPath, desktopScreenshot);

    if (desktopError) {
      throw new Error(`Storage error: ${desktopError.message}`);
    }

    // Upload mobile screenshot
    const { error: mobileError } = await supabase.storage
      .from('screenshots')
      .upload(mobileScreenshotPath, mobileScreenshot);

    if (mobileError) {
      throw new Error(`Storage error: ${mobileError.message}`);
    }

    // Extract scores and suggested improvements
    const scores = {
      performance: Math.round((lighthouseResult.lhr.categories.performance?.score || 0) * 100),
      accessibility: Math.round((lighthouseResult.lhr.categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((lighthouseResult.lhr.categories['best-practices']?.score || 0) * 100),
      seo: Math.round((lighthouseResult.lhr.categories.seo?.score || 0) * 100)
    };

    const suggestedImprovements = extractSuggestedImprovements(lighthouseResult.lhr);

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
      throw new Error(`Failed to update business record: ${updateError.message}`);
    }

    return { scores };
  } finally {
    await browser.close();
  }
}

function extractSuggestedImprovements(report: Result) {
  const improvements: string[] = [];
  
  // Extract opportunities and diagnostics from audit
  const audits = report.audits || {};
  
  // Add performance improvements
  Object.values(audits).forEach((audit: LighthouseAudit) => {
    if (audit.score !== null && audit.score < 0.9 && audit.title) {
      improvements.push(audit.title);
    }
  });
  
  return improvements.slice(0, 10); // Limit to top 10 improvements
} 