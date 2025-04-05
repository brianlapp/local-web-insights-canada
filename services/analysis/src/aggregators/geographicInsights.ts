import * as turf from '@turf/turf';
import { fetchBusinesses, fetchWebsiteAudits, fetchGeoGrids } from '../utils/database';
import { 
  Business, 
  WebsiteAudit, 
  GeographicInsightsData,
  BusinessDensityData
} from '../models/types';

/**
 * Calculate business density for a geographic grid
 */
export const calculateBusinessDensity = async (
  city: string,
  gridId?: string
): Promise<BusinessDensityData[]> => {
  // Fetch relevant grids
  const grids = await fetchGeoGrids({ city });
  
  // If specific grid ID is provided, filter to just that grid
  const targetGrids = gridId 
    ? grids.filter(grid => grid.id === gridId)
    : grids;
  
  const results: BusinessDensityData[] = [];
  
  for (const grid of targetGrids) {
    // Create a bounding box for the grid
    const bbox = [
      grid.bounds.southwest.lng,
      grid.bounds.southwest.lat,
      grid.bounds.northeast.lng,
      grid.bounds.northeast.lat
    ];
    
    // Calculate area in square kilometers
    const polygon = turf.bboxPolygon(bbox);
    const area = turf.area(polygon) / 1000000; // Convert from sq meters to sq km
    
    // Fetch businesses in this grid
    const businesses = await fetchBusinesses({
      city: city
    });
    
    // Filter businesses within the grid bounds
    const businessesInGrid = businesses.filter(business => {
      if (!business.latitude || !business.longitude) return false;
      
      const point = turf.point([business.longitude, business.latitude]);
      return turf.booleanPointInPolygon(point, polygon);
    });
    
    // Count businesses by category
    const categoryCounts: { [key: string]: number } = {};
    let totalScore = 0;
    let scoredBusinesses = 0;
    
    businessesInGrid.forEach(business => {
      if (business.category) {
        categoryCounts[business.category] = (categoryCounts[business.category] || 0) + 1;
      }
      
      if (business.overall_score !== null) {
        totalScore += business.overall_score;
        scoredBusinesses++;
      }
    });
    
    // Sort categories by count and take top 5
    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculate average score if there are scored businesses
    const averageScore = scoredBusinesses > 0 
      ? totalScore / scoredBusinesses 
      : null;
    
    results.push({
      grid_id: grid.id,
      grid_name: grid.name,
      city: grid.city,
      total_businesses: businessesInGrid.length,
      businesses_per_sqkm: businessesInGrid.length / area,
      top_categories: topCategories,
      average_score: averageScore,
      bounds: grid.bounds
    });
  }
  
  return results;
};

/**
 * Generate performance heatmap data
 */
export const generatePerformanceHeatmap = async (
  city: string,
  metric: keyof WebsiteAudit['scores'] = 'overall'
): Promise<GeographicInsightsData['performance_heatmap']> => {
  // Fetch businesses in the city with websites
  const businesses = await fetchBusinesses({
    city,
    hasWebsite: true
  });
  
  // Filter businesses with coordinates
  const businessesWithCoordinates = businesses.filter(
    business => business.latitude !== null && business.longitude !== null
  );
  
  // Initialize heatmap grid - we'll use 0.005 degree cells (roughly 500m)
  const heatmapData: { [key: string]: { lat: number, lng: number, total: number, count: number } } = {};
  
  // For each business, get latest audit and score
  for (const business of businessesWithCoordinates) {
    if (!business.latest_audit_id) continue;
    
    const audits = await fetchWebsiteAudits({
      business_id: business.id,
      latest_only: true
    });
    
    if (audits.length === 0) continue;
    
    const audit = audits[0];
    const score = audit.scores[metric];
    
    // Add to heatmap - round coordinates to create grid cells
    const lat = Math.round(business.latitude! * 200) / 200;
    const lng = Math.round(business.longitude! * 200) / 200;
    const key = `${lat}-${lng}`;
    
    if (!heatmapData[key]) {
      heatmapData[key] = { lat, lng, total: 0, count: 0 };
    }
    
    heatmapData[key].total += score;
    heatmapData[key].count += 1;
  }
  
  // Convert to array and calculate average scores
  return Object.values(heatmapData).map(cell => ({
    lat: cell.lat,
    lng: cell.lng,
    score: cell.total / cell.count,
    count: cell.count
  }));
};

/**
 * Generate geographic insights for a region
 */
export const generateGeographicInsights = async (
  region: string,
  regionType: 'city' | 'postal_code' | 'neighborhood' = 'city'
): Promise<GeographicInsightsData> => {
  let businesses: Business[] = [];
  
  // Fetch businesses based on region type
  if (regionType === 'city') {
    businesses = await fetchBusinesses({ city: region });
  } else if (regionType === 'postal_code') {
    businesses = await fetchBusinesses({ });
    businesses = businesses.filter(b => b.postal_code === region);
  } else {
    // Neighborhood would require geocoding or polygon lookup - simplified for now
    businesses = await fetchBusinesses({ city: region });
  }
  
  // Calculate business density
  // In a real application, this would use census data for area calculations
  const area = 10; // Placeholder - sq km for region
  const businessDensity = businesses.length / area;
  
  // Count businesses by category
  const categoryCounts: { [key: string]: number } = {};
  businesses.forEach(business => {
    if (business.category) {
      categoryCounts[business.category] = (categoryCounts[business.category] || 0) + 1;
    }
  });
  
  // Sort categories by count and take top 5
  const topCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Calculate average scores
  let totalScores = {
    overall: 0,
    performance: 0,
    accessibility: 0,
    seo: 0,
    best_practices: 0
  };
  let scoredBusinessesCount = 0;
  
  for (const business of businesses) {
    if (business.latest_audit_id) {
      const audits = await fetchWebsiteAudits({
        business_id: business.id,
        latest_only: true
      });
      
      if (audits.length > 0) {
        const audit = audits[0];
        totalScores.overall += audit.scores.overall;
        totalScores.performance += audit.scores.performance;
        totalScores.accessibility += audit.scores.accessibility;
        totalScores.seo += audit.scores.seo;
        totalScores.best_practices += audit.scores.best_practices;
        scoredBusinessesCount++;
      }
    }
  }
  
  const averageScores = {
    overall: scoredBusinessesCount > 0 ? totalScores.overall / scoredBusinessesCount : 0,
    performance: scoredBusinessesCount > 0 ? totalScores.performance / scoredBusinessesCount : 0,
    accessibility: scoredBusinessesCount > 0 ? totalScores.accessibility / scoredBusinessesCount : 0,
    seo: scoredBusinessesCount > 0 ? totalScores.seo / scoredBusinessesCount : 0,
    best_practices: scoredBusinessesCount > 0 ? totalScores.best_practices / scoredBusinessesCount : 0
  };
  
  // Generate heatmap data
  const performanceHeatmap = await generatePerformanceHeatmap(region, 'overall');
  
  return {
    region,
    type: regionType,
    business_count: businesses.length,
    business_density: businessDensity,
    top_categories: topCategories,
    average_scores: averageScores,
    performance_heatmap: performanceHeatmap
  };
}; 