import { Job } from 'bull';
import { Client } from '@googlemaps/google-maps-services-js';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger';

// Initialize clients
const googleMapsClient = new Client({});
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string
);

interface GridSearchJobData {
  grid: {
    id: string;
    name: string;
    bounds: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  };
  category: string;
  scraperRunId: string;
}

export async function processGridSearch(job: Job<GridSearchJobData>) {
  const { grid, category, scraperRunId } = job.data;
  logger.info(`Searching ${grid.name} for category: ${category}`);
  
  let pageToken: string | undefined;
  let businessesFound = 0;
  
  try {
    // We'll make up to 3 paginated requests (max 60 results)
    for (let page = 0; page < 3; page++) {
      const response = await googleMapsClient.placesNearby({
        params: {
          location: {
            lat: (grid.bounds.northeast.lat + grid.bounds.southwest.lat) / 2,
            lng: (grid.bounds.northeast.lng + grid.bounds.southwest.lng) / 2
          },
          radius: 1000, // 1km radius
          type: category,
          key: process.env.GOOGLE_MAPS_API_KEY as string,
          pagetoken: pageToken
        },
        timeout: 5000
      });
      
      const places = response.data.results;
      
      // Process each place
      for (const place of places) {
        // Store raw data first
        const { error } = await supabase
          .from('raw_business_data')
          .insert({
            source_id: 'google-places',
            external_id: place.place_id,
            raw_data: place,
            processed: false
          });
          
        if (error) {
          throw error;
        }
        
        businessesFound++;
      }
      
      // Check if there are more pages
      pageToken = response.data.next_page_token;
      if (!pageToken) break;
      
      // Need to wait a bit before using next_page_token
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Update scraper run stats
    const { error: statsError } = await supabase.rpc('update_scraper_run_stats', {
      run_id: scraperRunId,
      businesses_found: businessesFound
    });

    if (statsError) {
      throw statsError;
    }
    
    // Update grid record with last scraped timestamp
    const { error: gridError } = await supabase
      .from('geo_grids')
      .update({ last_scraped: new Date().toISOString() })
      .eq('id', grid.id);

    if (gridError) {
      throw gridError;
    }
    
    return { businessesFound };
    
  } catch (error) {
    logger.error(`Error scraping grid ${grid.name} for ${category}:`, error);
    throw error;
  }
} 