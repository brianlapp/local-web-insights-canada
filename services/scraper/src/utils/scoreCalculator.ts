import { DetailedMetrics } from '../queues/processors/websiteAuditUtils';
import { TechnologyCategory } from './techDetector';

export interface WebsiteScore {
  overall: number;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  mobile: number;
  technical: number;
}

/**
 * Calculate performance score based on Lighthouse metrics
 */
export function calculatePerformanceScore(metrics: DetailedMetrics): number {
  const performanceScore = Math.round(metrics.performance.score * 100);
  return performanceScore;
}

/**
 * Calculate accessibility score based on Lighthouse metrics
 */
export function calculateAccessibilityScore(metrics: DetailedMetrics): number {
  const accessibilityScore = Math.round(metrics.accessibility.score * 100);
  return accessibilityScore;
}

/**
 * Calculate best practices score based on Lighthouse metrics
 */
export function calculateBestPracticesScore(metrics: DetailedMetrics): number {
  const bestPracticesScore = Math.round(metrics.bestPractices.score * 100);
  return bestPracticesScore;
}

/**
 * Calculate SEO score based on Lighthouse metrics
 */
export function calculateSeoScore(metrics: DetailedMetrics): number {
  const seoScore = Math.round(metrics.seo.score * 100);
  return seoScore;
}

/**
 * Calculate mobile friendliness score based on mobile/desktop comparison
 */
export function calculateMobileScore(
  desktopMetrics: DetailedMetrics, 
  mobileMetrics: DetailedMetrics
): number {
  // Base score on mobile performance
  let mobileScore = Math.round(mobileMetrics.performance.score * 100);
  
  // Calculate difference between mobile and desktop performance
  const performanceDiff = (mobileMetrics.performance.score - desktopMetrics.performance.score) * 100;
  
  // If mobile performance is significantly worse than desktop, penalize the score
  if (performanceDiff < -20) {
    mobileScore -= 10; // Large penalty for poor mobile optimization
  } else if (performanceDiff < -10) {
    mobileScore -= 5; // Small penalty for moderate mobile issues
  }
  
  // Count mobile-specific failures
  const mobileFailureCount = 
    mobileMetrics.accessibility.failingItems.length + 
    mobileMetrics.bestPractices.failingItems.length +
    mobileMetrics.seo.failingItems.length;
  
  // Count desktop failures
  const desktopFailureCount = 
    desktopMetrics.accessibility.failingItems.length + 
    desktopMetrics.bestPractices.failingItems.length +
    desktopMetrics.seo.failingItems.length;
  
  // If there are more failures on mobile, further penalize
  if (mobileFailureCount > desktopFailureCount) {
    mobileScore -= Math.min(15, (mobileFailureCount - desktopFailureCount) * 2);
  }
  
  // Cap the score between 0 and 100
  return Math.max(0, Math.min(100, mobileScore));
}

/**
 * Calculate technical score based on technologies used
 */
export function calculateTechnicalScore(technologies: TechnologyCategory[]): number {
  // Start with base score
  let technicalScore = 70;
  
  // Look for specific technology categories
  const cmsCategory = technologies.find(category => category.name === 'CMS');
  const jsFrameworkCategory = technologies.find(category => category.name === 'JavaScript Framework');
  const analyticsCategory = technologies.find(category => category.name === 'Analytics');
  
  // Boost score for using modern technologies
  if (jsFrameworkCategory) {
    technicalScore += 10;
    
    // Extra boost for specific frameworks
    const modernFrameworks = ['React', 'Vue.js', 'Angular'];
    const hasModernFramework = jsFrameworkCategory.technologies.some(tech => 
      modernFrameworks.includes(tech.name)
    );
    
    if (hasModernFramework) {
      technicalScore += 5;
    }
  }
  
  // Boost for having analytics
  if (analyticsCategory) {
    technicalScore += 5;
  }
  
  // Adjust based on CMS if present
  if (cmsCategory) {
    const cms = cmsCategory.technologies[0]?.name;
    
    // WordPress is common but can vary in quality
    if (cms === 'WordPress') {
      // Neutral adjustment
    } 
    // Boost for modern CMSs and e-commerce platforms
    else if (['Shopify', 'Wix', 'Squarespace'].includes(cms)) {
      technicalScore += 5;
    }
  }
  
  // Cap the score between 0 and 100
  return Math.max(0, Math.min(100, technicalScore));
}

/**
 * Calculate comprehensive website score based on all metrics
 */
export function calculateWebsiteScore(
  desktopMetrics: DetailedMetrics, 
  mobileMetrics: DetailedMetrics,
  technologies: TechnologyCategory[] = []
): WebsiteScore {
  // Calculate individual scores
  const performance = calculatePerformanceScore(mobileMetrics);
  const accessibility = calculateAccessibilityScore(mobileMetrics);
  const bestPractices = calculateBestPracticesScore(mobileMetrics);
  const seo = calculateSeoScore(mobileMetrics);
  const mobile = calculateMobileScore(desktopMetrics, mobileMetrics);
  const technical = calculateTechnicalScore(technologies);
  
  // Calculate weighted overall score
  // Performance and mobile experience are weighted more heavily
  const overall = Math.round(
    (performance * 0.30) +  // 30% weight for performance
    (accessibility * 0.15) + // 15% weight for accessibility
    (bestPractices * 0.15) + // 15% weight for best practices
    (seo * 0.15) +           // 15% weight for SEO
    (mobile * 0.15) +         // 15% weight for mobile experience
    (technical * 0.10)        // 10% weight for technical implementation
  );
  
  return {
    overall,
    performance,
    accessibility,
    bestPractices,
    seo,
    mobile,
    technical
  };
} 