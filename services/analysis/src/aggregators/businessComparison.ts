import { fetchBusinesses, fetchWebsiteAudits } from '../utils/database';
import { Business, WebsiteAudit, BusinessComparisonData } from '../models/types';

/**
 * Calculate percentile rank of a value within an array
 */
const calculatePercentile = (value: number, array: number[]): number => {
  const sorted = [...array].sort((a, b) => a - b);
  const index = sorted.findIndex(v => v >= value);
  if (index === -1) return 100; // Value is greater than all elements
  return Math.round((index / sorted.length) * 100);
};

/**
 * Get category and city ranking for a business
 */
const getBusinessRanking = async (
  businessId: string,
  includeCategory = true,
  includeCity = true
): Promise<{
  categoryRank?: number;
  cityRank?: number;
  categoryTotal?: number;
  cityTotal?: number;
  percentile?: number;
}> => {
  // Fetch the target business first
  const supabase = await fetchBusinesses({});
  const targetBusiness = supabase.find(b => b.id === businessId);
  
  if (!targetBusiness) {
    throw new Error(`Business with ID ${businessId} not found`);
  }
  
  const result: {
    categoryRank?: number;
    cityRank?: number;
    categoryTotal?: number;
    cityTotal?: number;
    percentile?: number;
  } = {};
  
  // Skip if business has no score
  if (targetBusiness.overall_score === null) {
    return result;
  }
  
  // Fetch businesses for comparison
  const filters: {city?: string; category?: string; hasWebsite: boolean} = {
    hasWebsite: true
  };
  
  if (includeCategory && targetBusiness.category) {
    filters.category = targetBusiness.category;
  }
  
  if (includeCity && targetBusiness.city) {
    filters.city = targetBusiness.city;
  }
  
  const comparisonBusinesses = await fetchBusinesses(filters);
  
  // Filter businesses with scores
  const businessesWithScores = comparisonBusinesses.filter(
    b => b.overall_score !== null
  );
  
  // Calculate rankings
  if (includeCategory && targetBusiness.category) {
    const categoryBusinesses = businessesWithScores.filter(
      b => b.category === targetBusiness.category
    );
    
    const categoryScores = categoryBusinesses.map(b => b.overall_score!);
    const sortedCategoryBusinesses = [...categoryBusinesses].sort(
      (a, b) => b.overall_score! - a.overall_score!
    );
    
    const categoryRank = sortedCategoryBusinesses.findIndex(
      b => b.id === businessId
    ) + 1;
    
    if (categoryRank > 0) {
      result.categoryRank = categoryRank;
      result.categoryTotal = categoryBusinesses.length;
      result.percentile = calculatePercentile(
        targetBusiness.overall_score!,
        categoryScores
      );
    }
  }
  
  if (includeCity && targetBusiness.city) {
    const cityBusinesses = businessesWithScores.filter(
      b => b.city === targetBusiness.city
    );
    
    const sortedCityBusinesses = [...cityBusinesses].sort(
      (a, b) => b.overall_score! - a.overall_score!
    );
    
    const cityRank = sortedCityBusinesses.findIndex(
      b => b.id === businessId
    ) + 1;
    
    if (cityRank > 0) {
      result.cityRank = cityRank;
      result.cityTotal = cityBusinesses.length;
    }
  }
  
  return result;
};

/**
 * Calculate category averages for each performance metric
 */
const calculateCategoryAverages = async (
  category: string,
  city?: string
): Promise<{
  overall: number;
  performance: number;
  accessibility: number;
  seo: number;
  best_practices: number;
}> => {
  // Fetch businesses in category
  const businesses = await fetchBusinesses({
    category,
    city,
    hasWebsite: true
  });
  
  const totals = {
    overall: 0,
    performance: 0,
    accessibility: 0,
    seo: 0,
    best_practices: 0
  };
  let count = 0;
  
  // Get latest audit for each business
  for (const business of businesses) {
    if (!business.latest_audit_id) continue;
    
    const audits = await fetchWebsiteAudits({
      business_id: business.id,
      latest_only: true
    });
    
    if (audits.length === 0) continue;
    
    const audit = audits[0];
    
    totals.overall += audit.scores.overall;
    totals.performance += audit.scores.performance;
    totals.accessibility += audit.scores.accessibility;
    totals.seo += audit.scores.seo;
    totals.best_practices += audit.scores.best_practices;
    count++;
  }
  
  // Calculate averages
  if (count === 0) {
    return {
      overall: 0,
      performance: 0,
      accessibility: 0,
      seo: 0,
      best_practices: 0
    };
  }
  
  return {
    overall: totals.overall / count,
    performance: totals.performance / count,
    accessibility: totals.accessibility / count,
    seo: totals.seo / count,
    best_practices: totals.best_practices / count
  };
};

/**
 * Generate comparison data for a business against its competitors
 */
export const compareBusinessToCompetitors = async (
  businessId: string
): Promise<BusinessComparisonData> => {
  // Fetch the business details
  const allBusinesses = await fetchBusinesses({});
  const business = allBusinesses.find(b => b.id === businessId);
  
  if (!business) {
    throw new Error(`Business with ID ${businessId} not found`);
  }
  
  if (!business.latest_audit_id) {
    throw new Error(`Business with ID ${businessId} has no audit data`);
  }
  
  // Fetch the latest audit data
  const audits = await fetchWebsiteAudits({
    business_id: businessId,
    latest_only: true
  });
  
  if (audits.length === 0) {
    throw new Error(`No audit data found for business ID ${businessId}`);
  }
  
  const audit = audits[0];
  
  // Get business ranking
  const ranking = await getBusinessRanking(businessId);
  
  // Get category averages
  const categoryAverages = business.category 
    ? await calculateCategoryAverages(business.category, business.city ?? undefined)
    : {
        overall: 0,
        performance: 0,
        accessibility: 0,
        seo: 0,
        best_practices: 0
      };
  
  // Identify strengths and weaknesses compared to category average
  const metrics = [
    { area: 'performance', score: audit.scores.performance, category_average: categoryAverages.performance },
    { area: 'accessibility', score: audit.scores.accessibility, category_average: categoryAverages.accessibility },
    { area: 'seo', score: audit.scores.seo, category_average: categoryAverages.seo },
    { area: 'best_practices', score: audit.scores.best_practices, category_average: categoryAverages.best_practices }
  ];
  
  const strengths = metrics
    .filter(m => m.score > m.category_average)
    .sort((a, b) => (b.score - b.category_average) - (a.score - a.category_average))
    .slice(0, 3);
  
  const weaknesses = metrics
    .filter(m => m.score < m.category_average)
    .sort((a, b) => (a.score - a.category_average) - (b.score - b.category_average))
    .slice(0, 3);
  
  return {
    business_id: businessId,
    name: business.name,
    category: business.category || 'Unknown',
    overall_score: audit.scores.overall,
    category_rank: ranking.categoryRank || 0,
    city_rank: ranking.cityRank || 0,
    percentile: ranking.percentile || 0,
    scores: audit.scores,
    category_averages: categoryAverages,
    strengths,
    weaknesses
  };
};

/**
 * Compare multiple businesses side by side
 */
export const compareMultipleBusinesses = async (
  businessIds: string[]
): Promise<BusinessComparisonData[]> => {
  const results: BusinessComparisonData[] = [];
  
  for (const businessId of businessIds) {
    try {
      const comparison = await compareBusinessToCompetitors(businessId);
      results.push(comparison);
    } catch (error) {
      console.error(`Error comparing business ${businessId}:`, error);
      // Continue with next business
    }
  }
  
  return results;
};

/**
 * Get historical performance data for a business
 */
export const getBusinessHistoricalPerformance = async (
  businessId: string,
  limit = 10
): Promise<{
  business_id: string;
  name: string;
  audits: Array<{
    audit_date: string;
    overall_score: number;
    performance: number;
    accessibility: number;
    seo: number;
    best_practices: number;
  }>;
  trend: {
    overall: number;
    performance: number;
    accessibility: number;
    seo: number;
    best_practices: number;
  };
}> => {
  // Fetch the business details
  const allBusinesses = await fetchBusinesses({});
  const business = allBusinesses.find(b => b.id === businessId);
  
  if (!business) {
    throw new Error(`Business with ID ${businessId} not found`);
  }
  
  // Fetch all audits for this business, ordered by date
  const audits = await fetchWebsiteAudits({
    business_id: businessId,
    limit
  });
  
  if (audits.length === 0) {
    throw new Error(`No audit data found for business ID ${businessId}`);
  }
  
  // Map audits to simplified format
  const auditData = audits.map(audit => ({
    audit_date: audit.audit_date,
    overall_score: audit.scores.overall,
    performance: audit.scores.performance,
    accessibility: audit.scores.accessibility,
    seo: audit.scores.seo,
    best_practices: audit.scores.best_practices
  }));
  
  // Calculate trend (difference between most recent and oldest audit)
  const newest = auditData[0];
  const oldest = auditData[auditData.length - 1];
  
  const trend = {
    overall: newest.overall_score - oldest.overall_score,
    performance: newest.performance - oldest.performance,
    accessibility: newest.accessibility - oldest.accessibility,
    seo: newest.seo - oldest.seo,
    best_practices: newest.best_practices - oldest.best_practices
  };
  
  return {
    business_id: businessId,
    name: business.name,
    audits: auditData,
    trend
  };
}; 