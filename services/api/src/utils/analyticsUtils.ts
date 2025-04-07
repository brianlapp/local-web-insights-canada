/**
 * Calculate metric trends from historical data
 */
export function calculateMetricTrends(historicalMetrics: any[]): Record<string, any> {
  if (!historicalMetrics.length) {
    return {};
  }
  
  // Group by week or month depending on data volume
  const groupedByWeek = groupMetricsByPeriod(historicalMetrics, 'week');
  
  // Calculate trends for key metrics
  const trends: Record<string, any> = {};
  
  // Example metrics to calculate trends for
  const metricKeys = [
    'website_traffic', 
    'search_ranking', 
    'review_count', 
    'average_rating',
    'social_mentions'
  ];
  
  metricKeys.forEach(key => {
    if (historicalMetrics[0][key] !== undefined) {
      const values = groupedByWeek.map(week => week[key]);
      trends[key] = {
        values,
        change: calculatePercentageChange(values[0], values[values.length - 1]),
        trend: calculateTrendDirection(values)
      };
    }
  });
  
  return trends;
}

/**
 * Group metrics by time period (week/month)
 */
function groupMetricsByPeriod(metrics: any[], period: 'week' | 'month'): any[] {
  const grouped: Record<string, any> = {};
  
  metrics.forEach(metric => {
    const date = new Date(metric.timestamp);
    let key: string;
    
    if (period === 'week') {
      // Get ISO week (1-52)
      const weekNum = getWeekNumber(date);
      key = `${date.getFullYear()}-W${weekNum}`;
    } else {
      key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    }
    
    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        count: 0
      };
      
      // Initialize metric values
      Object.keys(metric).forEach(metricKey => {
        if (metricKey !== 'id' && metricKey !== 'business_id' && metricKey !== 'timestamp') {
          grouped[key][metricKey] = 0;
        }
      });
    }
    
    // Sum values for averaging later
    Object.keys(metric).forEach(metricKey => {
      if (metricKey !== 'id' && metricKey !== 'business_id' && metricKey !== 'timestamp') {
        if (typeof metric[metricKey] === 'number') {
          grouped[key][metricKey] += metric[metricKey];
        }
      }
    });
    
    grouped[key].count++;
  });
  
  // Calculate averages
  Object.keys(grouped).forEach(key => {
    const group = grouped[key];
    const count = group.count;
    
    Object.keys(group).forEach(metricKey => {
      if (metricKey !== 'period' && metricKey !== 'count') {
        group[metricKey] = group[metricKey] / count;
      }
    });
  });
  
  // Convert to array and sort by period
  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Get the ISO week number for a date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(startValue: number, endValue: number): number {
  if (startValue === 0) return 0;
  return parseFloat(((endValue - startValue) / Math.abs(startValue) * 100).toFixed(2));
}

/**
 * Determine if a series of values is trending up, down, or stable
 */
export function calculateTrendDirection(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';
  
  // Calculate linear regression slope
  const n = values.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  // Determine trend based on slope
  if (Math.abs(slope) < 0.01) return 'stable';
  return slope > 0 ? 'up' : 'down';
}

/**
 * Calculate performance indicators
 */
export function calculatePerformanceIndicators(metrics: any[], benchmarks: any[]): Record<string, any> {
  // This would implement logic to compare business performance against benchmarks
  // Simplified implementation for now
  return {
    overall: calculateOverallScore(metrics),
    metrics: calculateMetricScores(metrics, benchmarks)
  };
}

/**
 * Calculate overall performance score
 */
export function calculateOverallScore(metrics: any[]): number {
  if (!metrics.length) return 0;
  
  const latestMetrics = metrics[metrics.length - 1];
  
  // Simplified scoring algorithm - would be more sophisticated in production
  let score = 0;
  let count = 0;
  
  if (latestMetrics.website_traffic !== undefined) {
    score += Math.min(latestMetrics.website_traffic / 1000, 10);
    count++;
  }
  
  if (latestMetrics.search_ranking !== undefined) {
    score += (10 - Math.min(latestMetrics.search_ranking, 10));
    count++;
  }
  
  if (latestMetrics.average_rating !== undefined) {
    score += latestMetrics.average_rating * 2;
    count++;
  }
  
  return count ? parseFloat((score / count).toFixed(1)) : 0;
}

/**
 * Calculate scores for individual metrics
 */
export function calculateMetricScores(metrics: any[], benchmarks: any[]): Record<string, any> {
  if (!metrics.length) return {};
  
  const latestMetrics = metrics[metrics.length - 1];
  const results: Record<string, any> = {};
  
  // Calculate scores for each metric
  Object.keys(latestMetrics).forEach(key => {
    if (key !== 'id' && key !== 'business_id' && key !== 'timestamp') {
      results[key] = {
        value: latestMetrics[key],
        score: calculateMetricScore(key, latestMetrics[key]),
        benchmarkComparison: compareToBenchmark(key, latestMetrics[key], benchmarks)
      };
    }
  });
  
  return results;
}

/**
 * Calculate score for a specific metric
 */
export function calculateMetricScore(metricName: string, value: number): number {
  // This would implement specific scoring logic for each metric type
  // Simplified implementation for now
  switch (metricName) {
    case 'website_traffic':
      return Math.min(value / 1000, 10);
    case 'search_ranking':
      return 10 - Math.min(value, 10);
    case 'average_rating':
      return value * 2;
    default:
      return value;
  }
}

/**
 * Compare metric to industry benchmark
 */
export function compareToBenchmark(metricName: string, value: number, benchmarks: any[]): Record<string, any> {
  if (!benchmarks.length) {
    return { available: false };
  }
  
  const latestBenchmark = benchmarks[benchmarks.length - 1];
  
  if (latestBenchmark[metricName] === undefined) {
    return { available: false };
  }
  
  const benchmarkValue = latestBenchmark[metricName];
  const percentDifference = calculatePercentageChange(benchmarkValue, value);
  
  return {
    available: true,
    benchmarkValue,
    percentDifference,
    status: percentDifference > 0 ? 'above' : percentDifference < 0 ? 'below' : 'equal'
  };
}

/**
 * Generate comparison data between business and competitors
 */
export function generateComparisonData(businessMetrics: any, competitorMetrics: Record<string, any>): Record<string, any> {
  if (!businessMetrics) return {};
  
  const comparisonData: Record<string, any> = {};
  const competitors = Object.values(competitorMetrics);
  
  // Calculate comparison for each key metric
  Object.keys(businessMetrics).forEach(key => {
    if (key !== 'id' && key !== 'business_id' && key !== 'timestamp') {
      const businessValue = businessMetrics[key];
      
      // Extract competitor values for this metric
      const competitorValues = competitors
        .filter((c: any) => c.metrics && c.metrics[key] !== undefined)
        .map((c: any) => c.metrics[key]);
      
      if (competitorValues.length > 0) {
        // Calculate average
        const avgValue = competitorValues.reduce((sum: number, val: number) => sum + val, 0) / competitorValues.length;
        
        // Calculate percentile
        const percentile = calculatePercentile(businessValue, competitorValues);
        
        comparisonData[key] = {
          businessValue,
          competitorAvg: parseFloat(avgValue.toFixed(2)),
          percentile: parseFloat(percentile.toFixed(0)),
          status: businessValue > avgValue ? 'better' : businessValue < avgValue ? 'worse' : 'equal'
        };
      }
    }
  });
  
  return comparisonData;
}

/**
 * Calculate percentile rank of a value in an array
 */
export function calculatePercentile(value: number, array: number[]): number {
  const sortedArray = [...array].sort((a, b) => a - b);
  const index = sortedArray.findIndex(v => v >= value);
  
  if (index === -1) return 100; // Value is greater than all elements
  
  return (index / sortedArray.length) * 100;
}

/**
 * Calculate start date based on timeframe
 */
export function calculateStartDate(timeframe: string): string {
  const date = new Date();
  
  switch (timeframe) {
    case '7days':
      date.setDate(date.getDate() - 7);
      break;
    case '30days':
      date.setDate(date.getDate() - 30);
      break;
    case '90days':
      date.setDate(date.getDate() - 90);
      break;
    case '6months':
      date.setMonth(date.getMonth() - 6);
      break;
    case '1year':
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      date.setDate(date.getDate() - 30); // Default to 30 days
  }
  
  return date.toISOString();
} 