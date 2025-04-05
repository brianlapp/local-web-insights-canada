// @ts-ignore - Suppress CJS/ESM module conflict for type import
import type { RunnerResult } from 'lighthouse';

export interface LighthouseAudit {
  title: string;
  description: string;
  score: number | null;
  numericValue?: number;
  displayValue?: string;
  details?: any;
}

export interface DetailedMetrics {
  performance: {
    score: number;
    metrics: {
      firstContentfulPaint: number | null;
      largestContentfulPaint: number | null;
      totalBlockingTime: number | null;
      cumulativeLayoutShift: number | null;
      speedIndex: number | null;
      interactive: number | null;
    };
  };
  accessibility: {
    score: number;
    failingItems: Array<{ title: string; impact: string }>;
  };
  bestPractices: {
    score: number;
    failingItems: Array<{ title: string; impact: string }>;
  };
  seo: {
    score: number;
    failingItems: Array<{ title: string; impact: string }>;
  };
}

export interface Recommendation {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'performance' | 'accessibility' | 'best-practices' | 'seo';
  score?: number;
}

/**
 * Extract detailed metrics from the Lighthouse results
 */
export function extractDetailedMetrics(lhr: RunnerResult['lhr'] | undefined): DetailedMetrics {
  if (!lhr) {
    return getEmptyMetrics();
  }

  const audits = lhr.audits || {};
  const metrics = {
    performance: {
      score: lhr.categories?.performance?.score || 0,
      metrics: {
        firstContentfulPaint: audits['first-contentful-paint']?.numericValue || null,
        largestContentfulPaint: audits['largest-contentful-paint']?.numericValue || null,
        totalBlockingTime: audits['total-blocking-time']?.numericValue || null,
        cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue || null,
        speedIndex: audits['speed-index']?.numericValue || null,
        interactive: audits['interactive']?.numericValue || null
      }
    },
    accessibility: {
      score: lhr.categories?.accessibility?.score || 0,
      failingItems: extractFailingItems(lhr, 'accessibility')
    },
    bestPractices: {
      score: lhr.categories?.['best-practices']?.score || 0,
      failingItems: extractFailingItems(lhr, 'best-practices')
    },
    seo: {
      score: lhr.categories?.seo?.score || 0, 
      failingItems: extractFailingItems(lhr, 'seo')
    }
  };

  return metrics;
}

/**
 * Extract failing audit items from a specific category
 */
function extractFailingItems(lhr: RunnerResult['lhr'], category: string) {
  if (!lhr || !lhr.categories || !lhr.categories[category]) {
    return [];
  }
  
  const categoryItems = lhr.categories[category].auditRefs || [];
  const failingItems = [] as Array<{ title: string; impact: string }>;
  
  for (const item of categoryItems) {
    const audit = lhr.audits?.[item.id];
    if (audit && audit.score !== null && audit.score < 0.9) {
      failingItems.push({
        title: audit.title || item.id,
        impact: determineImpact(audit.score, item.weight || 0)
      });
    }
  }
  
  return failingItems;
}

/**
 * Compare desktop and mobile metrics for insights
 */
export function compareMetrics(desktop: DetailedMetrics, mobile: DetailedMetrics) {
  const performanceDiff = (mobile.performance.score - desktop.performance.score) * 100;
  
  const speedMetricsDiff = {
    firstContentfulPaint: compareValue(
      mobile.performance.metrics.firstContentfulPaint,
      desktop.performance.metrics.firstContentfulPaint
    ),
    largestContentfulPaint: compareValue(
      mobile.performance.metrics.largestContentfulPaint,
      desktop.performance.metrics.largestContentfulPaint
    ),
    totalBlockingTime: compareValue(
      mobile.performance.metrics.totalBlockingTime,
      desktop.performance.metrics.totalBlockingTime
    ),
    speedIndex: compareValue(
      mobile.performance.metrics.speedIndex,
      desktop.performance.metrics.speedIndex
    )
  };
  
  return {
    performanceDiff,
    isMobileWorse: performanceDiff < -10,
    speedMetricsDiff,
    mobileOnlyIssues: filterMobileOnlyIssues(mobile, desktop)
  };
}

/**
 * Calculate percentage difference between two values
 */
function compareValue(mobileValue: number | null, desktopValue: number | null) {
  if (mobileValue === null || desktopValue === null || desktopValue === 0) {
    return null;
  }
  
  return Math.round(((mobileValue - desktopValue) / desktopValue) * 100);
}

/**
 * Extract issues that only appear on mobile
 */
function filterMobileOnlyIssues(mobile: DetailedMetrics, desktop: DetailedMetrics) {
  const mobileItems = [...mobile.accessibility.failingItems, 
                      ...mobile.performance.score < 0.9 ? [{title: 'Mobile Performance', impact: 'high'}] : [],
                      ...mobile.bestPractices.failingItems,
                      ...mobile.seo.failingItems];
                      
  const desktopItems = [...desktop.accessibility.failingItems,
                        ...desktop.bestPractices.failingItems,
                        ...desktop.seo.failingItems];
                       
  const desktopTitles = new Set(desktopItems.map(item => item.title));
  
  return mobileItems.filter(item => !desktopTitles.has(item.title));
}

/**
 * Generate prioritized improvement recommendations
 */
export function generateRecommendations(desktopLhr: RunnerResult['lhr'] | undefined, mobileLhr: RunnerResult['lhr'] | undefined): Recommendation[] {
  if (!desktopLhr && !mobileLhr) return [];
  
  const lhr = mobileLhr || desktopLhr; // Prefer mobile for recommendations
  if (!lhr) return [];
  
  const recommendations: Recommendation[] = [];
  const audits = lhr.audits || {};
  
  // Group audits by category
  const categories = {
    performance: [] as Recommendation[],
    accessibility: [] as Recommendation[],
    'best-practices': [] as Recommendation[],
    seo: [] as Recommendation[]
  };
  
  // Process categorized audits
  for (const categoryName of Object.keys(categories)) {
    const category = lhr.categories?.[categoryName];
    if (!category) continue;
    
    for (const auditRef of (category.auditRefs || [])) {
      const audit = audits[auditRef.id];
      
      if (audit && audit.score !== null && audit.score < 0.9) {
        const typedCategory = categoryName as 'performance' | 'accessibility' | 'best-practices' | 'seo';
        
        categories[typedCategory].push({
          title: audit.title || auditRef.id,
          description: audit.description || '',
          impact: determineImpact(audit.score, auditRef.weight || 0),
          category: typedCategory,
          score: audit.score
        });
      }
    }
  }
  
  // Prioritize performance issues first, since they often have the most business impact
  if (categories.performance.length > 0) {
    recommendations.push(...categories.performance.sort(sortByImpactAndScore));
  }
  
  // Then SEO, since it directly impacts visibility
  if (categories.seo.length > 0) {
    recommendations.push(...categories.seo.sort(sortByImpactAndScore));
  }
  
  // Accessibility is important for inclusion
  if (categories.accessibility.length > 0) {
    recommendations.push(...categories.accessibility.sort(sortByImpactAndScore));
  }
  
  // Best practices
  if (categories['best-practices'].length > 0) {
    recommendations.push(...categories['best-practices'].sort(sortByImpactAndScore));
  }
  
  // Limit to top 15 recommendations for focus
  return recommendations.slice(0, 15);
}

/**
 * Determine the impact of an issue based on score and audit weight
 */
function determineImpact(score: number, weight: number): 'high' | 'medium' | 'low' {
  if (score < 0.5 && weight > 0.5) return 'high';
  if (score < 0.7 || weight > 0.3) return 'medium';
  return 'low';
}

/**
 * Sort recommendations by impact and score
 */
function sortByImpactAndScore(a: Recommendation, b: Recommendation) {
  const impactOrder = { high: 0, medium: 1, low: 2 };
  const impactDiff = impactOrder[a.impact] - impactOrder[b.impact];
  
  if (impactDiff !== 0) return impactDiff;
  
  // If same impact, sort by score (lower score = higher priority)
  return (a.score || 0) - (b.score || 0);
}

/**
 * Create empty metrics structure for error handling
 */
function getEmptyMetrics(): DetailedMetrics {
  return {
    performance: {
      score: 0,
      metrics: {
        firstContentfulPaint: null,
        largestContentfulPaint: null,
        totalBlockingTime: null,
        cumulativeLayoutShift: null,
        speedIndex: null,
        interactive: null
      }
    },
    accessibility: {
      score: 0,
      failingItems: []
    },
    bestPractices: {
      score: 0,
      failingItems: []
    },
    seo: {
      score: 0,
      failingItems: []
    }
  };
} 