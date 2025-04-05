import { saveReport } from '../utils/database';
import { Report } from '../models/types';
import { 
  generateGeographicInsights, 
  calculateBusinessDensity 
} from '../aggregators/geographicInsights';
import { 
  analyzeCategoryPerformance, 
  rankCategoriesByPerformance 
} from '../aggregators/categoryAnalysis';
import { 
  compareBusinessToCompetitors,
  getBusinessHistoricalPerformance 
} from '../aggregators/businessComparison';

/**
 * Generate a city insights report
 */
export const generateCityReport = async (
  city: string, 
  options: {
    includeCategories?: boolean;
    includeGeographic?: boolean;
    includeTrends?: boolean;
  } = {}
): Promise<Report> => {
  // Default options
  const { 
    includeCategories = true, 
    includeGeographic = true,
    includeTrends = true 
  } = options;
  
  // Gather city insights data
  const cityInsights = await generateGeographicInsights(city);
  
  // Gather business density data if requested
  const densityData = includeGeographic 
    ? await calculateBusinessDensity(city)
    : [];
  
  // Gather category ranking data if requested
  const categoryRankings = includeCategories
    ? await rankCategoriesByPerformance(city)
    : { top_categories: [], struggling_categories: [] };
  
  // Create chart configurations for the dashboard
  const chartConfigs = [
    {
      id: 'categoryDistribution',
      type: 'pie',
      title: 'Business Categories Distribution',
      data: cityInsights.top_categories.map(c => ({
        label: c.category,
        value: c.count
      }))
    },
    {
      id: 'performanceMap',
      type: 'heatmap',
      title: 'Website Performance Heatmap',
      data: cityInsights.performance_heatmap
    },
    {
      id: 'categoryScores',
      type: 'bar',
      title: 'Average Scores by Category',
      data: categoryRankings.top_categories.map(c => ({
        label: c.category,
        value: c.score
      }))
    }
  ];
  
  // Build the report object
  const reportData = {
    city_insights: cityInsights,
    density: densityData,
    category_rankings: categoryRankings,
    // Additional data would be included here based on options
  };
  
  // Save the report to the database
  const report = await saveReport({
    name: `${city} City Insights Report`,
    description: `Analysis of business web presence and performance in ${city}`,
    report_type: 'city',
    filters: { city },
    data: reportData,
    chart_configs: chartConfigs
  });
  
  return report;
};

/**
 * Generate a category performance report
 */
export const generateCategoryReport = async (
  category: string,
  city?: string
): Promise<Report> => {
  // Analyze the category performance
  const categoryPerformance = await analyzeCategoryPerformance(category, city);
  
  // Create chart configurations
  const chartConfigs = [
    {
      id: 'performanceMetrics',
      type: 'radar',
      title: 'Average Performance Metrics',
      data: [
        { label: 'Performance', value: categoryPerformance.average_performance },
        { label: 'SEO', value: categoryPerformance.average_seo },
        { label: 'Accessibility', value: categoryPerformance.average_accessibility },
        { label: 'Best Practices', value: categoryPerformance.average_best_practices }
      ]
    },
    {
      id: 'topPerformers',
      type: 'bar',
      title: 'Top Performers',
      data: categoryPerformance.top_performers.map(b => ({
        label: b.name,
        value: b.overall_score
      }))
    },
    {
      id: 'improvementAreas',
      type: 'bar',
      title: 'Common Improvement Areas',
      data: categoryPerformance.improvement_areas.map(area => ({
        label: area.area,
        value: area.frequency,
        impact: area.average_impact
      }))
    }
  ];
  
  // Build the report object
  const reportData = {
    category_performance: categoryPerformance
  };
  
  // Create report title based on whether city is included
  const reportTitle = city
    ? `${category} Businesses in ${city}`
    : `${category} Businesses Analysis`;
  
  // Save the report to the database
  const report = await saveReport({
    name: reportTitle,
    description: `Analysis of web performance for businesses in the ${category} category${city ? ` in ${city}` : ''}`,
    report_type: 'category',
    filters: { category, city },
    data: reportData,
    chart_configs: chartConfigs
  });
  
  return report;
};

/**
 * Generate a business performance report
 */
export const generateBusinessReport = async (
  businessId: string,
  options: {
    includeHistorical?: boolean;
    includeCompetitors?: boolean;
  } = {}
): Promise<Report> => {
  // Default options
  const { 
    includeHistorical = true, 
    includeCompetitors = true 
  } = options;
  
  // Compare the business to competitors
  const businessComparison = await compareBusinessToCompetitors(businessId);
  
  // Get historical performance if requested
  const historicalData = includeHistorical
    ? await getBusinessHistoricalPerformance(businessId)
    : null;
  
  // Create chart configurations
  const chartConfigs = [
    {
      id: 'performanceComparison',
      type: 'radar',
      title: 'Performance vs Category Average',
      data: [
        {
          name: businessComparison.name,
          performance: businessComparison.scores.performance,
          seo: businessComparison.scores.seo,
          accessibility: businessComparison.scores.accessibility,
          best_practices: businessComparison.scores.best_practices
        },
        {
          name: 'Category Average',
          performance: businessComparison.category_averages.performance,
          seo: businessComparison.category_averages.seo,
          accessibility: businessComparison.category_averages.accessibility,
          best_practices: businessComparison.category_averages.best_practices
        }
      ]
    }
  ];
  
  // Add historical chart if available
  if (historicalData) {
    chartConfigs.push({
      id: 'historicalPerformance',
      type: 'line',
      title: 'Historical Performance',
      data: historicalData.audits.map(audit => ({
        date: audit.audit_date,
        overall: audit.overall_score,
        performance: audit.performance,
        seo: audit.seo,
        accessibility: audit.accessibility,
        best_practices: audit.best_practices
      }))
    });
  }
  
  // Build the report object
  const reportData = {
    business_comparison: businessComparison,
    historical_data: historicalData
  };
  
  // Save the report to the database
  const report = await saveReport({
    name: `${businessComparison.name} Performance Report`,
    description: `Detailed analysis of web performance for ${businessComparison.name}`,
    report_type: 'business',
    filters: { business_id: businessId },
    data: reportData,
    chart_configs: chartConfigs
  });
  
  return report;
};

/**
 * Generate a comparative report for multiple businesses
 */
export const generateComparisonReport = async (
  businessIds: string[],
  title?: string
): Promise<Report> => {
  if (businessIds.length < 2) {
    throw new Error('Comparison report requires at least 2 businesses');
  }
  
  // Get comparison data for each business
  const businessComparisons = [];
  const businessNames = [];
  
  for (const businessId of businessIds) {
    try {
      const comparison = await compareBusinessToCompetitors(businessId);
      businessComparisons.push(comparison);
      businessNames.push(comparison.name);
    } catch (error) {
      console.error(`Error including business ${businessId} in comparison:`, error);
    }
  }
  
  if (businessComparisons.length < 2) {
    throw new Error('Failed to retrieve data for at least 2 businesses');
  }
  
  // Create chart configurations
  const chartConfigs = [
    {
      id: 'overallScoreComparison',
      type: 'bar',
      title: 'Overall Score Comparison',
      data: businessComparisons.map(business => ({
        label: business.name,
        value: business.overall_score
      }))
    },
    {
      id: 'metricsComparison',
      type: 'radar',
      title: 'Performance Metrics Comparison',
      data: businessComparisons.map(business => ({
        name: business.name,
        performance: business.scores.performance,
        seo: business.scores.seo,
        accessibility: business.scores.accessibility,
        best_practices: business.scores.best_practices
      }))
    }
  ];
  
  // Build the report object
  const reportData = {
    businesses: businessComparisons
  };
  
  // Generate a default title if none provided
  const reportTitle = title || `Comparison: ${businessNames.join(' vs ')}`;
  
  // Save the report to the database
  const report = await saveReport({
    name: reportTitle,
    description: `Side-by-side comparison of web performance for selected businesses`,
    report_type: 'comparison',
    filters: { business_id: businessIds[0] }, // Using the first business ID as primary
    data: reportData,
    chart_configs: chartConfigs
  });
  
  return report;
}; 