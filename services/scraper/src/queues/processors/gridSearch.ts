import { Job } from 'bull';
import { Client } from '@googlemaps/google-maps-services-js';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger';

// Initialize clients
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
  
  let businessesFound = 0;

  // Calculate the center point of the grid
  const center = {
    lat: (grid.bounds.northeast.lat + grid.bounds.southwest.lat) / 2,
    lng: (grid.bounds.northeast.lng + grid.bounds.southwest.lng) / 2
  };

  // Initialize Google Maps client
  const googleMapsClient = new Client({});
  let pageToken: string | undefined;

  try {
    do {
      // Make the Places API request
      let response;
      try {
        response = await googleMapsClient.placesNearby({
          params: {
            location: center,
            radius: 1000,
            type: category,
            key: process.env.GOOGLE_MAPS_API_KEY as string,
            pagetoken: pageToken
          },
          timeout: 5000
        });
      } catch (error) {
        logger.error('Google Places API request failed:', error);
        if (error instanceof Error) {
          if (error.message.includes('OVER_QUERY_LIMIT')) {
            throw new Error('OVER_QUERY_LIMIT');
          }
          throw new Error(`API request failed: ${error.message}`);
        }
        throw error;
      }

      // Process each place in the response
      const places = response.data.results || [];
      for (const place of places) {
        const { error } = await supabase.from('raw_business_data').insert({
          source_id: 'google-places',
          external_id: place.place_id,
          raw_data: place,
          processed: false
        });

        if (error) {
          logger.error('Failed to insert business data:', error);
          throw new Error(`Failed to insert business data: ${error.message}`);
        }

        businessesFound++;
      }

      // Update page token for next request
      pageToken = response.data.next_page_token;

      // Wait a bit if we have a next page to avoid rate limiting
      if (pageToken) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } while (pageToken);

    // Update scraper run stats
    const { error: statsError } = await supabase.rpc('update_scraper_run_stats', {
      run_id: scraperRunId,
      businesses_found: businessesFound
    });

    if (statsError) {
      logger.error('Failed to update scraper run stats:', statsError);
      throw new Error(`Failed to update scraper run stats: ${statsError.message}`);
    }

    // Update grid record
    const { error: gridError } = await supabase
      .from('geo_grids')
      .update({ last_scraped: new Date().toISOString() })
      .eq('id', grid.id);

    if (gridError) {
      logger.error('Failed to update grid record:', gridError);
      throw new Error(`Failed to update grid record: ${gridError.message}`);
    }

    return { businessesFound };
  } catch (error) {
    // Reset business count on error
    businessesFound = 0;
    throw error;
  }
} 