import { Job } from 'bull';
import { 
  generateCityReport, 
  generateCategoryReport,
  generateBusinessReport,
  generateComparisonReport
} from '../reports/reportGenerator';
import { fetchBusinesses } from '../utils/database';
import { Report } from '../models/types';

// Types for report generation job data
export interface ReportJobData {
  report_type: 'city' | 'category' | 'business' | 'comparison';
  parameters: {
    city?: string;
    category?: string;
    business_id?: string;
    business_ids?: string[];
    title?: string;
    options?: {
      includeCategories?: boolean;
      includeGeographic?: boolean;
      includeTrends?: boolean;
      includeHistorical?: boolean;
      includeCompetitors?: boolean;
    };
  };
}

/**
 * Process a report generation job
 */
export const processReportJob = async (job: Job<ReportJobData>): Promise<Report> => {
  const { report_type, parameters } = job.data;
  
  // Update job progress
  await job.progress(10);
  
  try {
    let report: Report;
    
    // Generate the appropriate report based on type
    switch (report_type) {
      case 'city':
        if (!parameters.city) {
          throw new Error('City report requires a city parameter');
        }
        
        await job.progress(20);
        report = await generateCityReport(parameters.city, parameters.options);
        break;
        
      case 'category':
        if (!parameters.category) {
          throw new Error('Category report requires a category parameter');
        }
        
        await job.progress(20);
        report = await generateCategoryReport(parameters.category, parameters.city);
        break;
        
      case 'business':
        if (!parameters.business_id) {
          throw new Error('Business report requires a business_id parameter');
        }
        
        await job.progress(20);
        report = await generateBusinessReport(parameters.business_id, parameters.options);
        break;
        
      case 'comparison':
        if (!parameters.business_ids || parameters.business_ids.length < 2) {
          throw new Error('Comparison report requires at least 2 business_ids');
        }
        
        await job.progress(20);
        report = await generateComparisonReport(parameters.business_ids, parameters.title);
        break;
        
      default:
        throw new Error(`Unsupported report type: ${report_type}`);
    }
    
    await job.progress(100);
    return report;
  } catch (error) {
    console.error(`Error generating ${report_type} report:`, error);
    throw error;
  }
};

/**
 * Generate daily summary reports for all cities
 */
export const generateDailySummaryReports = async (): Promise<Report[]> => {
  // Get all cities with businesses
  const businesses = await fetchBusinesses({});
  
  // Extract unique cities
  const cities = Array.from(new Set(
    businesses
      .filter(b => b.city)
      .map(b => b.city as string)
  ));
  
  // Generate a report for each city
  const reports: Report[] = [];
  
  for (const city of cities) {
    try {
      const report = await generateCityReport(city);
      reports.push(report);
    } catch (error) {
      console.error(`Error generating daily report for ${city}:`, error);
      // Continue with next city
    }
  }
  
  return reports;
};

/**
 * Generate weekly category performance reports
 */
export const generateWeeklyCategoryReports = async (): Promise<Report[]> => {
  // Get all businesses
  const businesses = await fetchBusinesses({});
  
  // Extract unique categories
  const categories = Array.from(new Set(
    businesses
      .filter(b => b.category)
      .map(b => b.category as string)
  ));
  
  // Generate a report for each category
  const reports: Report[] = [];
  
  for (const category of categories) {
    try {
      const report = await generateCategoryReport(category);
      reports.push(report);
    } catch (error) {
      console.error(`Error generating weekly report for ${category}:`, error);
      // Continue with next category
    }
  }
  
  return reports;
};

/**
 * Generate top performer comparison report
 */
export const generateTopPerformersReport = async (
  limit = 5
): Promise<Report | null> => {
  // Get top businesses by score
  const topBusinesses = await fetchBusinesses({
    hasWebsite: true,
    minScore: 0, // Ensure they have a score
    limit: limit
  });
  
  // Sort by score and take top performers
  const topPerformerIds = topBusinesses
    .filter(b => b.overall_score !== null)
    .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
    .slice(0, limit)
    .map(b => b.id);
  
  if (topPerformerIds.length < 2) {
    console.log('Not enough top performers with scores to generate comparison');
    return null;
  }
  
  try {
    return await generateComparisonReport(
      topPerformerIds,
      'Top Web Performers Comparison'
    );
  } catch (error) {
    console.error('Error generating top performers report:', error);
    return null;
  }
}; 