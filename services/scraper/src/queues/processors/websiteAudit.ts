import { Job } from 'bull';
import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import { Result } from 'lighthouse';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger';

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
  logger.info(`Starting audit for business ${businessId} at URL: ${url}`);
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ],
      headless: true
    });
    
    // Take screenshots
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    const desktopScreenshot = await page.screenshot({ fullPage: true });
    
    await page.setViewport({ width: 375, height: 667 });
    const mobileScreenshot = await page.screenshot({ fullPage: true });
    
    // Run Lighthouse audit
    const result = await lighthouse(url, {
      port: Number((new URL(browser.wsEndpoint())).port),
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
    });
    
    if (!result || !result.report || typeof result.report !== 'string') {
      throw new Error('Lighthouse audit failed to return results');
    }
    
    const report = JSON.parse(result.report) as Result;
    
    // Calculate scores
    const scores = {
      performance: Math.round((report.categories?.performance?.score || 0) * 100),
      accessibility: Math.round((report.categories?.accessibility?.score || 0) * 100),
      bestPractices: Math.round((report.categories?.['best-practices']?.score || 0) * 100),
      seo: Math.round((report.categories?.seo?.score || 0) * 100)
    };
    
    // Store screenshots in storage
    const desktopKey = `businesses/${businessId}/desktop-${Date.now()}.png`;
    const mobileKey = `businesses/${businessId}/mobile-${Date.now()}.png`;
    
    await Promise.all([
      supabase.storage
        .from('screenshots')
        .upload(desktopKey, desktopScreenshot),
      supabase.storage
        .from('screenshots')
        .upload(mobileKey, mobileScreenshot)
    ]);
    
    // Update business record with audit results
    const { error } = await supabase
      .from('businesses')
      .update({
        scores,
        desktopScreenshot: desktopKey,
        mobileScreenshot: mobileKey,
        auditDate: new Date().toISOString(),
        suggestedImprovements: extractSuggestedImprovements(report)
      })
      .eq('id', businessId);
      
    if (error) {
      throw new Error(`Failed to update business record: ${error.message}`);
    }
    
    logger.info(`Completed audit for business ${businessId}`);
    return { scores };
    
  } catch (error) {
    logger.error(`Error auditing website for business ${businessId}:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
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