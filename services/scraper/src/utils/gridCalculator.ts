import { logger } from './logger';

// Interface definitions
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Bounds {
  northeast: Coordinates;
  southwest: Coordinates;
}

export interface SubGrid {
  center: Coordinates;
  radius: number;
}

// Constants
const EARTH_RADIUS_METERS = 6371000; // Earth's radius in meters
const MAX_SEARCH_RADIUS = 5000; // Max radius in meters for Places API (actually 50000m, but we use smaller for better results)
const OPTIMAL_RADIUS = 1000; // Optimal radius for better coverage and more complete results
const MIN_RADIUS = 500; // Minimum radius for small areas
const COVERAGE_OVERLAP = 0.2; // 20% overlap between adjacent grids

/**
 * Calculate distance between two points using the Haversine formula
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculate the width and height of bounds in meters
 */
export function calculateBoundsDimensions(bounds: Bounds): { width: number, height: number } {
  const northEast = bounds.northeast;
  const southWest = bounds.southwest;
  
  // Calculate the width
  const widthPoint1 = { lat: southWest.lat, lng: southWest.lng };
  const widthPoint2 = { lat: southWest.lat, lng: northEast.lng };
  const width = calculateDistance(widthPoint1, widthPoint2);
  
  // Calculate the height
  const heightPoint1 = { lat: southWest.lat, lng: southWest.lng };
  const heightPoint2 = { lat: northEast.lat, lng: southWest.lng };
  const height = calculateDistance(heightPoint1, heightPoint2);
  
  return { width, height };
}

/**
 * Calculate number of grid cells needed in each dimension
 */
function calculateGridDimensions(boundsDimensions: { width: number, height: number }): { cols: number, rows: number } {
  const { width, height } = boundsDimensions;
  
  // Calculate cells needed with overlap
  const effectiveRadius = OPTIMAL_RADIUS * (1 - COVERAGE_OVERLAP);
  
  // Calculate grid dimensions (minimum 1)
  const cols = Math.max(1, Math.ceil(width / (effectiveRadius * 2)));
  const rows = Math.max(1, Math.ceil(height / (effectiveRadius * 2)));
  
  return { cols, rows };
}

/**
 * Calculate a point at a given distance and bearing from a starting point
 */
function calculatePointAtDistance(start: Coordinates, distance: number, bearing: number): Coordinates {
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const toDegrees = (radians: number) => radians * 180 / Math.PI;
  
  const δ = distance / EARTH_RADIUS_METERS; // Angular distance
  const θ = toRadians(bearing);
  const φ1 = toRadians(start.lat);
  const λ1 = toRadians(start.lng);
  
  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + 
    Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
  );
  
  const λ2 = λ1 + Math.atan2(
    Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
    Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
  );
  
  return {
    lat: toDegrees(φ2),
    lng: toDegrees(λ2)
  };
}

/**
 * Generate sub-grids within the specified bounds
 */
export function generateSubGrids(bounds: Bounds): SubGrid[] {
  // Calculate dimensions
  const dimensions = calculateBoundsDimensions(bounds);
  const { cols, rows } = calculateGridDimensions(dimensions);
  
  logger.info(`Generating grid with ${cols}x${rows} cells (${cols * rows} total)`);
  
  // Calculate cell size
  const cellWidth = dimensions.width / cols;
  const cellHeight = dimensions.height / rows;
  
  // Determine cell radius (minimum of half the cell width/height, but not more than optimal)
  const cellRadius = Math.min(
    OPTIMAL_RADIUS,
    Math.max(MIN_RADIUS, Math.min(cellWidth, cellHeight) / 2)
  );
  
  const subGrids: SubGrid[] = [];
  
  // Generate grid cells
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Calculate cell center
      const latFraction = row / rows;
      const lngFraction = col / cols;
      
      // Interpolate between southwest and northeast corners
      const lat = bounds.southwest.lat + latFraction * (bounds.northeast.lat - bounds.southwest.lat);
      const lng = bounds.southwest.lng + lngFraction * (bounds.northeast.lng - bounds.southwest.lng);
      
      // Offset to center of cell
      const latOffset = (1 / rows) * (bounds.northeast.lat - bounds.southwest.lat) / 2;
      const lngOffset = (1 / cols) * (bounds.northeast.lng - bounds.southwest.lng) / 2;
      
      subGrids.push({
        center: {
          lat: lat + latOffset,
          lng: lng + lngOffset
        },
        radius: cellRadius
      });
    }
  }
  
  return subGrids;
}

/**
 * Generate a sub-grid from a center point and radius
 */
export function generateSubGridFromPoint(
  center: Coordinates, 
  radiusMeters: number = OPTIMAL_RADIUS
): SubGrid {
  // Ensure radius is within limits
  const radius = Math.min(MAX_SEARCH_RADIUS, Math.max(MIN_RADIUS, radiusMeters));
  
  return {
    center,
    radius
  };
}

/**
 * Split a grid into smaller sub-grids if it exceeds the maximum search radius
 */
export function splitLargeGrid(subGrid: SubGrid): SubGrid[] {
  if (subGrid.radius <= OPTIMAL_RADIUS) {
    return [subGrid];
  }
  
  // Number of smaller grids to create (aim for optimal radius)
  const numSplits = Math.ceil(subGrid.radius / OPTIMAL_RADIUS);
  const newGrids: SubGrid[] = [];
  
  // Create smaller sub-grids in a circular pattern
  const originalRadius = subGrid.radius;
  const newRadius = Math.min(OPTIMAL_RADIUS, originalRadius / 2);
  
  // Add center grid
  newGrids.push({
    center: subGrid.center,
    radius: newRadius
  });
  
  // Add surrounding grids if the original grid was large
  if (originalRadius > OPTIMAL_RADIUS * 1.5) {
    // Calculate distance to place additional points
    const distanceToPoints = originalRadius * 0.7; // 70% of the original radius
    
    // Create points in 8 directions
    for (let bearing = 0; bearing < 360; bearing += 45) {
      const newCenter = calculatePointAtDistance(subGrid.center, distanceToPoints, bearing);
      
      newGrids.push({
        center: newCenter,
        radius: newRadius
      });
    }
  }
  
  return newGrids;
}

/**
 * Calculate a grid system that provides optimal coverage for the given bounds
 */
export function calculateOptimalGridSystem(bounds: Bounds): SubGrid[] {
  // Generate basic grid
  const subGrids = generateSubGrids(bounds);
  
  // Split any grids that are too large
  let optimizedGrids: SubGrid[] = [];
  for (const grid of subGrids) {
    if (grid.radius > OPTIMAL_RADIUS) {
      optimizedGrids = [...optimizedGrids, ...splitLargeGrid(grid)];
    } else {
      optimizedGrids.push(grid);
    }
  }
  
  logger.info(`Generated ${optimizedGrids.length} optimized sub-grids from bounds`);
  return optimizedGrids;
} 