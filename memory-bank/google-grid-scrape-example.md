// Google Places Grid Scraper Implementation Example

import { Client } from '@googlemaps/google-maps-services-js';
import { createClient } from '@supabase/supabase-js';
import Queue from 'bull';

// Initialize clients
const googleMapsClient = new Client({});
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Create scraper queue
const scraperQueue = new Queue('business-scraper', process.env.REDIS_URL);
const auditQueue = new Queue('website-audit', process.env.REDIS_URL);

// Grid coordinates for Ottawa (simplified example)
// In production, we'd generate a more granular grid
const ottawaGrids = [
  {
    id: 'downtown',
    name: 'Downtown Ottawa',
    bounds: {
      northeast: { lat: 45.4275, lng: -75.6825 },
      southwest: { lat: 45.4175, lng: -75.7025 }
    }
  },
  {
    id: 'westboro',
    name: 'Westboro',
    bounds: {
      northeast: { lat: 45.3975, lng: -75.7325 },
      southwest: { lat: 45.3875, lng: -75.7525 }
    }
  },
  // Add more grids to cover entire Ottawa area
];

// Business categories to search for in each grid
const businessCategories = [
  'restaurant',
  'cafe',
  'retail',
  'hotel',
  'bakery',
  'hair salon',
  'dentist',
  'lawyer',
  'gym',
  'pharmacy',
  // Add more categories for comprehensive coverage
];

// Main scraper function
async function scrapeOttawaBusinesses() {
  console.log('Starting Ottawa business scraper...');
  
  // Create a scraper run record
  const { data: scraperRun, error } = await supabase
    .from('scraper_runs')
    .insert({
      source_id: 'google-places',  // Reference to source in scraper_sources table
      status: 'running',
      stats: { grids_total: ottawaGrids.length, grids_processed: 0, businesses_found: 0 }
    })
    .select()
    .single();
    
  if (error) {
    console.error('Failed to create scraper run:', error);
    return;
  }
  
  // Queue each grid area with each business type
  for (const grid of ottawaGrids) {
    for (const category of businessCategories) {
      await scraperQueue.add('search-grid', {
        grid,
        category,
        scraperRunId: scraperRun.id
      }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 10000
        }
      });
    }
    
    // Update grid record with last scraped timestamp
    await supabase
      .from('geo_grids')
      .update({ last_scraped: new Date().toISOString() })
      .eq('id', grid.id);
  }
  
  console.log(`Queued ${ottawaGrids.length * businessCategories.length} grid searches`);
}

// Process each grid search
scraperQueue.process('search-grid', async (job) => {
  const { grid, category, scraperRunId } = job.data;
  console.log(`Searching ${grid.name} for category: ${category}`);
  
  let pageToken;
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
          key: process.env.GOOGLE_MAPS_API_KEY,
          pagetoken: pageToken
        },
        timeout: 5000
      });
      
      const places = response.data.results;
      
      // Process each place
      for (const place of places) {
        // Store raw data first
        const { data, error } = await supabase
          .from('raw_business_data')
          .insert({
            source_id: 'google-places',
            external_id: place.place_id,
            raw_data: place,
            processed: false
          });
          
        if (error) {
          console.error(`Error storing raw data for ${place.name}:`, error);
          continue;
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
    await supabase.rpc('update_scraper_run_stats', {
      run_id: scraperRunId,
      businesses_found: businessesFound
    });
    
    return { businessesFound };
    
  } catch (error) {
    console.error(`Error scraping grid ${grid.name} for ${category}:`, error);
    throw error;
  }
});

// Process raw data into business records
scraperQueue.process('process-raw-data', async (job) => {
  const { rawDataId } = job.data;
  
  // Fetch raw data
  const { data: rawData, error } = await supabase
    .from('raw_business_data')
    .select('*')
    .eq('id', rawDataId)
    .single();
    
  if (error) {
    console.error('Error fetching raw data:', error);
    throw error;
  }
  
  const placeData = rawData.raw_data;
  
  // Check if business already exists
  const { data: existingBusiness } = await supabase
    .from('businesses')
    .select('id')
    .eq('external_id', placeData.place_id)
    .single();
    
  if (existingBusiness) {
    // Update existing business
    await supabase
      .from('businesses')
      .update({
        name: placeData.name,
        address: placeData.vicinity,
        phone: placeData.formatted_phone_number,
        website: placeData.website,
        latitude: placeData.geometry.location.lat,
        longitude: placeData.geometry.location.lng,
        last_scanned: new Date().toISOString()
      })
      .eq('id', existingBusiness.id);
      
    // Queue for website audit if website exists
    if (placeData.website) {
      await auditQueue.add('audit-website', {
        businessId: existingBusiness.id,
        url: placeData.website
      });
    }
    
    return { status: 'updated', businessId: existingBusiness.id };
  } else {
    // Create new business
    const { data: newBusiness, error } = await supabase
      .from('businesses')
      .insert({
        name: placeData.name,
        address: placeData.vicinity,
        phone: placeData.formatted_phone_number,
        website: placeData.website,
        latitude: placeData.geometry.location.lat,
        longitude: placeData.geometry.location.lng,
        source_id: rawData.source_id,
        external_id: placeData.place_id,
        last_scanned: new Date().toISOString(),
        city: 'Ottawa', // Hardcoded for now, could be determined from address
        status: 'active'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating business:', error);
      throw error;
    }
    
    // Queue for website audit if website exists
    if (placeData.website) {
      await auditQueue.add('audit-website', {
        businessId: newBusiness.id,
        url: placeData.website
      });
    }
    
    // Mark raw data as processed
    await supabase
      .from('raw_business_data')
      .update({ processed: true })
      .eq('id', rawDataId);
      
    return { status: 'created', businessId: newBusiness.id };
  }
});

// Export functions for use in API routes
export {
  scrapeOttawaBusinesses,
  scraperQueue,
  auditQueue
};