import { fetchBusinesses, fetchWebsiteAudits } from '../utils/database';
import { CategoryPerformanceData } from '../models/types';

/**
 * Analyze performance metrics for businesses by category
 */
export const analyzeCategoryPerformance = async (
  category: string,
  city?: string,
  limit = 5
): Promise<CategoryPerformanceData> => {
  // Fetch businesses in the specified category
  const businesses = await fetchBusinesses({
    category,
    city,
    hasWebsite: true
  });
  
  if (businesses.length === 0) {
    throw new Error(`No businesses found in category: ${category}`);
  }
  
  // Fetch audit data for each business
  const businessesWithAudits = [];
  const improvementAreas: Record<string, {frequency: number, impact: number}> = {};
  
  let totalScores = {
    overall: 0,
    performance: 0,
    accessibility: 0,
    seo: 0,
    best_practices: 0
  };
  
  for (const business of businesses) {
    if (!business.latest_audit_id) continue;
    
    const audits = await fetchWebsiteAudits({
      business_id: business.id,
      latest_only: true
    });
    
    if (audits.length === 0) continue;
    
    const audit = audits[0];
    
    // Track the business with its audit data
    businessesWithAudits.push({
      business_id: business.id,
      name: business.name,
      overall_score: audit.scores.overall,
      scores: audit.scores
    });
    
    // Sum up scores for averages
    totalScores.overall += audit.scores.overall;
    totalScores.performance += audit.scores.performance;
    totalScores.accessibility += audit.scores.accessibility;
    totalScores.seo += audit.scores.seo;
    totalScores.best_practices += audit.scores.best_practices;
    
    // Track improvement areas
    if (audit.recommendations) {
      audit.recommendations.forEach(recommendation => {
        if (!improvementAreas[recommendation]) {
          improvementAreas[recommendation] = { frequency: 0, impact: 0 };
        }
        
        improvementAreas[recommendation].frequency += 1;
        
        // Estimate impact based on associated score areas
        // This is a simplified approach - would be more sophisticated in real implementation
        if (recommendation.toLowerCase().includes('performance')) {
          improvementAreas[recommendation].impact += (100 - audit.scores.performance) / 10;
        } else if (recommendation.toLowerCase().includes('seo')) {
          improvementAreas[recommendation].impact += (100 - audit.scores.seo) / 10;
        } else if (recommendation.toLowerCase().includes('accessibility')) {
          improvementAreas[recommendation].impact += (100 - audit.scores.accessibility) / 10;
        } else {
          // General improvement
          improvementAreas[recommendation].impact += (100 - audit.scores.overall) / 20;
        }
      });
    }
  }
  
  const businessesCount = businessesWithAudits.length;
  
  if (businessesCount === 0) {
    throw new Error(`No businesses with audit data found in category: ${category}`);
  }
  
  // Calculate averages
  const averages = {
    score: totalScores.overall / businessesCount,
    performance: totalScores.performance / businessesCount,
    seo: totalScores.seo / businessesCount,
    accessibility: totalScores.accessibility / businessesCount,
    best_practices: totalScores.best_practices / businessesCount,
  };
  
  // Get top performers
  const topPerformers = businessesWithAudits
    .sort((a, b) => b.overall_score - a.overall_score)
    .slice(0, limit)
    .map(b => ({
      business_id: b.business_id,
      name: b.name,
      overall_score: b.overall_score
    }));
  
  // Get top improvement areas
  const improvementAreasArray = Object.entries(improvementAreas)
    .map(([area, data]) => ({
      area,
      frequency: data.frequency,
      average_impact: data.impact / data.frequency
    }))
    .sort((a, b) => {
      // Sort by frequency first, then by impact
      if (b.frequency !== a.frequency) {
        return b.frequency - a.frequency;
      }
      return b.average_impact - a.average_impact;
    })
    .slice(0, 5);
  
  return {
    category,
    businesses_count: businesses.length,
    average_score: averages.score,
    average_performance: averages.performance,
    average_seo: averages.seo,
    average_accessibility: averages.accessibility,
    average_best_practices: averages.best_practices,
    top_performers: topPerformers,
    improvement_areas: improvementAreasArray
  };
};

/**
 * Compare multiple categories to identify strengths and weaknesses
 */
export const compareCategories = async (
  categories: string[],
  city?: string
): Promise<Record<string, CategoryPerformanceData>> => {
  const results: Record<string, CategoryPerformanceData> = {};
  
  for (const category of categories) {
    try {
      const categoryAnalysis = await analyzeCategoryPerformance(category, city);
      results[category] = categoryAnalysis;
    } catch (error) {
      console.error(`Error analyzing category ${category}:`, error);
      // Continue with next category
    }
  }
  
  return results;
};

/**
 * Identify top performing and struggling categories in a city
 */
export const rankCategoriesByPerformance = async (
  city: string,
  limit = 10
): Promise<{
  top_categories: Array<{category: string, score: number, count: number}>;
  struggling_categories: Array<{category: string, score: number, count: number}>;
}> => {
  // Get all businesses with websites and group by category
  const businesses = await fetchBusinesses({
    city,
    hasWebsite: true
  });
  
  const categoriesMap: Record<string, {
    businesses: string[],
    totalScore: number,
    scoredBusinesses: number
  }> = {};
  
  // Group businesses by category
  businesses.forEach(business => {
    if (!business.category) return;
    
    if (!categoriesMap[business.category]) {
      categoriesMap[business.category] = {
        businesses: [],
        totalScore: 0,
        scoredBusinesses: 0
      };
    }
    
    categoriesMap[business.category].businesses.push(business.id);
    
    if (business.overall_score !== null) {
      categoriesMap[business.category].totalScore += business.overall_score;
      categoriesMap[business.category].scoredBusinesses++;
    }
  });
  
  // Calculate average scores for each category
  const categoryScores = Object.entries(categoriesMap)
    .filter(([_, data]) => data.scoredBusinesses >= 3) // Require at least 3 businesses with scores
    .map(([category, data]) => ({
      category,
      score: data.scoredBusinesses > 0 ? data.totalScore / data.scoredBusinesses : 0,
      count: data.businesses.length
    }));
  
  // Sort for top and bottom categories
  const sortedByScore = [...categoryScores].sort((a, b) => b.score - a.score);
  
  return {
    top_categories: sortedByScore.slice(0, limit),
    struggling_categories: sortedByScore.reverse().slice(0, limit)
  };
}; 