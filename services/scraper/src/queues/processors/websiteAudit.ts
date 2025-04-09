import { Job } from 'bull';
import puppeteer from 'puppeteer';
import { logger } from '../../utils/logger.js';
import { runLighthouse } from '../../utils/lighthouseWrapper.js';
import { detectTechnologies } from '../../utils/techDetector.js';
import { saveAuditResults } from '../../utils/database.js';
import { uploadScreenshot } from '../../utils/storage.js';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { getSupabaseClient } from '../../utils/database.js';
import { calculateSeoScore } from '../../utils/scoreCalculator.js';

// Interface for the job data
interface AuditJobData {
  businessId: string;
  url: string;
  options?: {
    runLighthouse?: boolean;
    detectTechnologies?: boolean;
    takeScreenshots?: boolean;
    validateOnly?: boolean;
  };
}

interface AuditScores {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  mobile: number;
  technical: number;
  overall: number;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  url?: string;
  scores?: AuditScores;
  screenshots?: {
    desktop: string | null;
    mobile: string | null;
  };
}

interface AuditResult {
  businessId: string;
  url: string;
  scores: AuditScores;
  lighthouseData: any;
  technologies: any;
  screenshots: {
    desktop: string | null;
    mobile: string | null;
  };
  recommendations: string[];
}

/**
 * Process a website audit job
 */
export const processWebsiteAudit = async (job: Job<AuditJobData>): Promise<ValidationResult | AuditResult> => {
  const { businessId, url, options = {} } = job.data;
  logger.info(`Starting website audit for business ${businessId} at URL: ${url}`);

  // Default options
  const jobOptions = {
    runLighthouse: true,
    detectTechnologies: true,
    takeScreenshots: true,
    validateOnly: false,
    ...options,
  };

  // Create temp directory for screenshots
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'website-audit-'));
  const desktopScreenshotPath = path.join(tmpDir, 'desktop.png');
  const mobileScreenshotPath = path.join(tmpDir, 'mobile.png');

  let browser: puppeteer.Browser | null = null;
  let page: puppeteer.Page | null = null;
  let lighthouseResults = null;
  let technologies = null;
  let desktopScreenshotUrl = null;
  let mobileScreenshotUrl = null;
  let scores = {
    performance: 0,
    accessibility: 0,
    bestPractices: 0,
    seo: 0,
    mobile: 0,
    technical: 0,
    overall: 0,
  };

  try {
    // Launch the browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // 1. Validate the URL works
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    } catch (error: any) {
      logger.error(`Error accessing URL ${url}:`, error);
      await browser.close();
      
      // Clean up temp files
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
      
      if (jobOptions.validateOnly) {
        return { valid: false, error: 'URL could not be accessed' };
      } else {
        throw new Error(`URL validation failed: ${error.message}`);
      }
    }

    // 2. Take screenshots if requested
    if (jobOptions.takeScreenshots) {
      logger.info('Taking desktop screenshot');
      await page.screenshot({ path: desktopScreenshotPath, fullPage: true });
      
      // Mobile viewport
      await page.setViewport({ width: 375, height: 667, isMobile: true });
      logger.info('Taking mobile screenshot');
      await page.screenshot({ path: mobileScreenshotPath, fullPage: true });
      
      // Upload screenshots to storage
      desktopScreenshotUrl = await uploadScreenshot(businessId, 'desktop', desktopScreenshotPath);
      mobileScreenshotUrl = await uploadScreenshot(businessId, 'mobile', mobileScreenshotPath);
      
      if (!desktopScreenshotUrl || !mobileScreenshotUrl) {
        logger.warn('Failed to upload one or more screenshots');
      }
    }

    // 3. Run Lighthouse if requested
    if (jobOptions.runLighthouse) {
      logger.info('Running Lighthouse audit');
      try {
        lighthouseResults = await runLighthouse(url, {
          onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
          formFactor: 'desktop',
          throttling: { cpuSlowdownMultiplier: 1 },
        });
        
        if (lighthouseResults && lighthouseResults.lhr) {
          // Extract scores
          scores.performance = Math.round(lighthouseResults.lhr.categories.performance.score * 100);
          scores.accessibility = Math.round(lighthouseResults.lhr.categories.accessibility.score * 100);
          scores.bestPractices = Math.round(lighthouseResults.lhr.categories['best-practices'].score * 100);
          scores.seo = Math.round(lighthouseResults.lhr.categories.seo.score * 100);
        }
      } catch (error: any) {
        logger.error('Lighthouse audit failed:', error);
      }
    }

    // 4. Detect technologies if requested
    if (jobOptions.detectTechnologies) {
      logger.info('Detecting technologies');
      technologies = await detectTechnologies(url);
      
      // Calculate technical score based on technologies
      if (technologies) {
        scores.technical = calculateTechnicalScore(technologies);
      }
    }

    // 5. Calculate mobile score
    if (lighthouseResults && lighthouseResults.lhr) {
      // Run a mobile Lighthouse test
      try {
        const mobileLighthouse = await runLighthouse(url, {
          onlyCategories: ['performance'],
          formFactor: 'mobile',
          throttling: {
            cpuSlowdownMultiplier: 4,
            rttMs: 150,
            throughputKbps: 1600,
          },
        });
        
        if (mobileLighthouse && mobileLighthouse.lhr) {
          scores.mobile = Math.round(mobileLighthouse.lhr.categories.performance.score * 100);
        }
      } catch (error: any) {
        logger.error('Mobile Lighthouse audit failed:', error);
        scores.mobile = Math.round(scores.performance * 0.7); // Fallback approximation
      }
    }

    // 6. Calculate overall score
    scores.overall = calculateOverallScore(scores);

    // 7. Generate recommendations
    const recommendations = generateRecommendations(scores, lighthouseResults, technologies);

    // 8. Save results to the database
    const auditData = {
      businessId,
      url,
      scores,
      lighthouseData: lighthouseResults ? lighthouseResults.lhr : null,
      technologies,
      screenshots: {
        desktop: desktopScreenshotUrl,
        mobile: mobileScreenshotUrl,
      },
      recommendations,
    };

    // If validate only, return without saving
    if (jobOptions.validateOnly) {
      await browser.close();
      
      // Clean up temp files
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
      
      return { 
        valid: true, 
        url,
        scores,
        screenshots: {
          desktop: desktopScreenshotUrl,
          mobile: mobileScreenshotUrl,
        }
      };
    }

    // Save data to database
    const savedAudit = await saveAuditResults(auditData);
    logger.info(`Audit completed and saved for business ${businessId}`);

    await browser.close();
    
    // Clean up temp files
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
    
    return savedAudit as unknown as ValidationResult | AuditResult;
  } catch (error: any) {
    logger.error(`Error processing website audit for ${url}:`, error);
    
    // Ensure browser is closed
    if (browser) {
      await browser.close();
    }
    
    // Clean up temp files
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
    
    // Update the audit record with failure status
    try {
      await saveAuditResults({
        businessId,
        status: 'failed',
        message: `Failed to process website audit: ${error.message || 'Unknown error during audit'}`,
        last_audited_at: new Date().toISOString(),
      });
    } catch (dbError: any) {
      logger.error(`Failed to update audit status to failed for business ${businessId}:`, dbError);
    }
    
    throw error;
  }
};

/**
 * Calculate technical score based on detected technologies
 */
function calculateTechnicalScore(technologies: any): number {
  // This is a placeholder for a more sophisticated scoring algorithm
  let score = 50; // Default score
  
  // Adjust score based on technologies
  if (technologies.cms) {
    // Modern CMS gets higher score
    const modernCMS = ['wordpress', 'shopify', 'wix'];
    if (modernCMS.includes(technologies.cms.toLowerCase())) {
      score += 10;
    }
  }
  
  // Adjust for JavaScript frameworks
  if (technologies.frameworks && technologies.frameworks.length > 0) {
    const modernFrameworks = ['react', 'vue', 'angular', 'next.js', 'gatsby'];
    const hasModernFramework = technologies.frameworks.some(
      (f: any) => modernFrameworks.includes(f.toLowerCase())
    );
    
    if (hasModernFramework) {
      score += 15;
    }
  }
  
  // Adjust for analytics
  if (technologies.analytics && technologies.analytics.length > 0) {
    score += 5;
  }
  
  // Cap the score at 100
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate overall score based on individual scores
 */
function calculateOverallScore(scores: any): number {
  // Weighted average of all scores
  const weights = {
    performance: 0.3,
    accessibility: 0.2,
    seo: 0.2,
    bestPractices: 0.1,
    mobile: 0.1,
    technical: 0.1,
  };
  
  let overallScore = 0;
  let totalWeight = 0;
  
  for (const [key, weight] of Object.entries(weights)) {
    if (scores[key] !== undefined && scores[key] !== null) {
      overallScore += scores[key] * (weight as number);
      totalWeight += weight as number;
    }
  }
  
  // Normalize if not all scores are available
  if (totalWeight > 0) {
    overallScore = overallScore / totalWeight;
  }
  
  return Math.round(overallScore);
}

/**
 * Generate recommendations based on audit results
 */
function generateRecommendations(
  scores: any,
  lighthouseResults: any,
  technologies: any
): string[] {
  const recommendations: string[] = [];
  
  // Performance recommendations
  if (scores.performance < 70) {
    recommendations.push('Optimize images and reduce unused JavaScript to improve page load times.');
    recommendations.push('Consider implementing lazy loading for images and videos.');
  }
  
  // Accessibility recommendations
  if (scores.accessibility < 70) {
    recommendations.push('Improve accessibility by adding proper alt text to images and ensuring proper contrast ratios.');
    recommendations.push('Make sure all interactive elements are keyboard accessible.');
  }
  
  // SEO recommendations
  if (scores.seo < 70) {
    recommendations.push('Improve SEO by adding meta descriptions and appropriate title tags.');
    recommendations.push('Ensure content is properly structured with heading tags (h1, h2, etc.).');
  }
  
  // Mobile recommendations
  if (scores.mobile < 70) {
    recommendations.push('Optimize for mobile by using responsive design principles.');
    recommendations.push('Ensure touch targets are appropriately sized for mobile users.');
  }
  
  // Technical recommendations
  if (scores.technical < 70) {
    recommendations.push('Consider using modern web technologies or frameworks to improve site functionality.');
    recommendations.push('Implement proper analytics to track user behavior and site performance.');
  }
  
  // Use Lighthouse audit data for more specific recommendations
  if (lighthouseResults && lighthouseResults.lhr && lighthouseResults.lhr.audits) {
    const audits = lighthouseResults.lhr.audits;
    
    // Check for specific issues
    if (audits['render-blocking-resources'] && audits['render-blocking-resources'].score < 0.9) {
      recommendations.push('Eliminate render-blocking resources to improve page load performance.');
    }
    
    if (audits['unminified-css'] && audits['unminified-css'].score < 0.9) {
      recommendations.push('Minify CSS files to reduce file size and improve load times.');
    }
    
    if (audits['unminified-javascript'] && audits['unminified-javascript'].score < 0.9) {
      recommendations.push('Minify JavaScript files to reduce file size and improve load times.');
    }
    
    if (audits['uses-responsive-images'] && audits['uses-responsive-images'].score < 0.9) {
      recommendations.push('Use responsive images to improve mobile performance and reduce data usage.');
    }
  }
  
  return recommendations;
}
