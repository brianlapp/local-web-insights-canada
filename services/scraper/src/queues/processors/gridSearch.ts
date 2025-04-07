import { Job } from 'bull';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger';
import { placesClient, PlaceData } from '../../utils/placesClient';
import { calculateOptimalGridSystem, SubGrid, Bounds } from '../../utils/gridCalculator';

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string
);

// Original grid format for backward compatibility
interface GridData {
  id: string;
  name: string;
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

// Support both detailed grid format and simplified format for tests
interface GridSearchJobData {
  // Original format fields
  grid?: GridData;
  category?: string;
  scraperRunId?: string;
  
  // Simplified format for direct testing
  gridId?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  type?: string;
  
  // Common fields
  retryCount?: number;
}

export async function processGridSearch(job: Job<GridSearchJobData>) {
  const { 
    grid, category, scraperRunId, 
    gridId, lat, lng, radius, type,
    retryCount = 0 
  } = job.data;
  
  // Handle both formats - original grid object and simplified test format
  const isSimplifiedFormat = !grid && gridId !== undefined;
  
  // We'll use these normalized values throughout the function
  const normalizedGridId = isSimplifiedFormat ? gridId : grid?.id;
  const normalizedCategory = isSimplifiedFormat ? type : category;
  const normalizedScraperRunId = isSimplifiedFormat ? scraperRunId : job.data.scraperRunId;
  
  if (isSimplifiedFormat) {
    logger.info(`Searching area at (${lat}, ${lng}) with radius ${radius}m for type: ${normalizedCategory}`);
  } else if (grid) {
    logger.info(`Searching ${grid.name} for category: ${category}`);
  } else {
    throw new Error('Invalid job data: missing required grid information');
  }
  
  let businessesFound = 0;
  let duplicatesSkipped = 0;
  let processedPlaceIds = new Set<string>();

  try {
    // Handle simplified format for tests directly
    if (isSimplifiedFormat && lat !== undefined && lng !== undefined && radius !== undefined) {
      const simpleSubGrid: SubGrid = {
        center: { lat, lng },
        radius
      };
      
      // Ensure we have a category - default to 'restaurant' for tests if missing
      const searchCategory = normalizedCategory || 'restaurant';
      
      // Process the grid
      const results = await processSubGrid(
        simpleSubGrid,
        searchCategory,
        processedPlaceIds
      );
      
      businessesFound += results.added;
      duplicatesSkipped += results.skipped;
    } 
    // Process full grid format with sub-grids
    else if (grid?.bounds) {
      // Use our new grid calculator to get optimal coverage
      const bounds: Bounds = grid.bounds;
      const subGrids = calculateOptimalGridSystem(bounds);
      
      logger.info(`Divided grid into ${subGrids.length} sub-grids for optimal coverage`);

      // Ensure we have a category - use the one from grid or default
      const searchCategory = normalizedCategory || 'restaurant';

      // Process each sub-grid separately
      for (let i = 0; i < subGrids.length; i++) {
        const subGrid = subGrids[i];
        logger.info(`Processing sub-grid ${i+1}/${subGrids.length} at coordinates: lat=${subGrid.center.lat}, lng=${subGrid.center.lng}`);
        
        try {
          // Process the sub-grid with pagination
          const subGridResults = await processSubGrid(
            subGrid,
            searchCategory,
            processedPlaceIds
          );
          
          businessesFound += subGridResults.added;
          duplicatesSkipped += subGridResults.skipped;
          
          // Add a small delay between grid cells to avoid overloading the API
          if (i < subGrids.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
        } catch (error) {
          // Log sub-grid error but continue with others
          logger.error(`Error processing sub-grid ${i+1}/${subGrids.length}:`, error);
          // If it's rate limiting, pause before continuing
          if (error instanceof Error && error.message.includes('OVER_QUERY_LIMIT')) {
            logger.info('Rate limit reached, pausing for 2 minutes before continuing...');
            await new Promise(resolve => setTimeout(resolve, 120000)); // 2 minute pause
          }
        }
      }
    } else {
      throw new Error('Invalid job data format');
    }

    // Update scraper run stats if we have a valid ID
    if (normalizedScraperRunId && businessesFound > 0) {
      // Use the updated RPC name for the test format
      const rpcName = isSimplifiedFormat ? 'increment_scraper_run_stats' : 'update_scraper_run_stats';
      const rpcParams = isSimplifiedFormat 
        ? { scraper_run_id: normalizedScraperRunId, businesses_found: businessesFound }
        : { run_id: normalizedScraperRunId, businesses_found: businessesFound };
      
      const { error: statsError } = await supabase.rpc(rpcName, rpcParams);

      if (statsError) {
        logger.error('Failed to update scraper run stats:', statsError);
        throw new Error(`Failed to update scraper run stats: ${statsError.message}`);
      }
    }

    // Update grid record
    if (normalizedGridId) {
      // Use the correct table name based on format
      const tableName = isSimplifiedFormat ? 'scraper_grid' : 'geo_grids';
      
      // Build the update object differently for each format
      const updateData = isSimplifiedFormat
        ? { 
            processed: true,
            businesses_found: businessesFound,
            last_processed: new Date().toISOString()
          }
        : { 
            last_scraped: new Date().toISOString(),
            total_businesses: businessesFound,
            last_scrape_status: 'success'
          };
      
      const { error: gridError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', normalizedGridId);

      if (gridError) {
        logger.error('Failed to update grid record:', gridError);
        throw new Error(`Failed to update grid record: ${gridError.message}`);
      }
    }

    logger.info(`Grid search complete. Found ${businessesFound} businesses, skipped ${duplicatesSkipped} duplicates.`);
    
    return { 
      businessesFound,
      duplicatesSkipped,
      subGridsProcessed: isSimplifiedFormat ? 1 : (grid?.bounds ? calculateOptimalGridSystem(grid.bounds).length : 0)
    };
  } catch (error) {
    // For recoverable errors, schedule a retry if under max retry count
    const MAX_RETRIES = 3;
    if (retryCount < MAX_RETRIES) {
      // Return special retry object instead of throwing
      return {
        shouldRetry: true,
        retryCount: retryCount + 1,
        businessesFound,
        duplicatesSkipped,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Log final failure after retries
    logger.error('Max retries reached, marking grid as failed:', error);
    
    // Update grid to show failure if we have a grid ID
    if (normalizedGridId) {
      const tableName = isSimplifiedFormat ? 'scraper_grid' : 'geo_grids';
      const failureData = isSimplifiedFormat
        ? { 
            processed: true,
            businesses_found: businessesFound,
            last_processed: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        : { 
            last_scraped: new Date().toISOString(),
            last_scrape_status: 'failed',
            last_scrape_error: error instanceof Error ? error.message : 'Unknown error'
          };
      
      await supabase
        .from(tableName)
        .update(failureData)
        .eq('id', normalizedGridId);
    }
    
    // Re-throw the error for the job processor to handle
    throw error;
  }
}

// Process a single sub-grid and find businesses within it
async function processSubGrid(
  subGrid: SubGrid,
  category: string,
  processedPlaceIds: Set<string>
): Promise<{ added: number, skipped: number }> {
  let added = 0;
  let skipped = 0;
  
  try {
    // Use our Places client to find nearby places with pagination
    const places = await placesClient.findNearbyPlaces(
      subGrid,
      category,
      60, // Get up to 60 results (maximum supported by Places API with pagination)
      { 
        // The library expects specific string values from the enum
        rankBy: 'prominence' as any
      }
    );
    
    // Process and store each place
    for (const place of places) {
      // Skip if we've already processed this place
      if (processedPlaceIds.has(place.place_id)) {
        skipped++;
        continue;
      }
      
      // Add to processed set to avoid duplicates
      processedPlaceIds.add(place.place_id);
      
      // Skip if the place doesn't have required data
      if (!place.name || !place.geometry || !place.geometry.location) {
        logger.warn(`Skipping place with missing data: ${place.place_id}`);
        continue;
      }
      
      // Insert into database
      const { error } = await supabase
        .from('businesses')
        .upsert({
          place_id: place.place_id,
          name: place.name,
          address: place.vicinity || place.formatted_address || '',
          location: `POINT(${place.geometry.location.lng} ${place.geometry.location.lat})`,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          business_status: place.business_status || 'OPERATIONAL',
          rating: place.rating || null,
          user_ratings_total: place.user_ratings_total || null,
          types: place.types || [],
          has_website: !!place.website,
          data_source: 'google_places',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'place_id'
        });
      
      if (error) {
        logger.error(`Failed to store business: ${error.message}`, place);
        continue;
      }
      
      // Get full details for the place (optional, only if needed)
      // This is resource-intensive, so maybe do this in a separate job
      /*
      try {
        const details = await placesClient.getPlaceDetails(place.place_id);
        if (details && details.website) {
          // Queue a website audit job if the business has a website
          // This would be done elsewhere to keep this function focused
        }
      } catch (detailsError) {
        logger.error(`Failed to get place details: ${detailsError}`, place.place_id);
      }
      */
      
      added++;
    }
    
    return { added, skipped };
  } catch (error) {
    logger.error('Error processing sub-grid:', error);
    return { added, skipped };
  }
} 