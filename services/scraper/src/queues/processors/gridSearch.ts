import { Job } from 'bull';
import { logger } from '../../utils/logger.js';
import { getSupabaseClient } from '../../utils/database.js';
import axios from 'axios';

// Scrape businesses from a location
async function scrapeBusiness(location: string, radius: number, searchTerm: string = '') {
  logger.info(`Starting business scrape for location: ${location}, radius: ${radius}km, searchTerm: ${searchTerm}`);
  
  try {
    // Construct the search URL
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchTerm || 'businesses')}+${encodeURIComponent(location)}`;
    logger.info(`Search URL: ${searchUrl}`);
    
    // Make the request
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Log the response
    logger.info(`Page loaded: ${response.data.length} bytes`);
    
    // Extract business data from the response
    const businesses = [];
    const businessMatches = response.data.match(/\["([^"]+)",\s*\["([^"]+)",\s*\["([^"]+)"/g);
    
    if (businessMatches) {
      logger.info(`Found ${businessMatches.length} potential business matches`);
      
      for (const match of businessMatches) {
        try {
          const [_, name, address, phone] = match.match(/\["([^"]+)",\s*\["([^"]+)",\s*\["([^"]+)"/);
          
          if (name && address) {
            businesses.push({
              name,
              address,
              phone: phone || null,
              website: null, // Would need additional scraping for website
              city: location,
              source_id: 'google-places',
              external_id: `place-${location}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            });
            
            logger.info(`Extracted business: ${name} at ${address}`);
          }
        } catch (error) {
          logger.error(`Error parsing business match: ${match}`, error);
        }
      }
    } else {
      logger.warn('No business matches found in the response');
    }
    
    logger.info(`Successfully scraped ${businesses.length} businesses for ${location}`);
    return businesses;
  } catch (error) {
    logger.error(`Error scraping businesses for ${location}:`, error);
    throw error;
  }
}

export async function processGridSearch(job: Job) {
  const { location, radius, searchTerm, jobId } = job.data;
  logger.info(`Processing grid search for ${location} with radius ${radius}km`);

  // Get Supabase client
  const supabase = getSupabaseClient();

  try {
    // Update job status if jobId is provided
    if (jobId) {
      await supabase
        .from('scraper_runs')
        .update({ status: 'running' })
        .eq('id', jobId);
    }
    
    // Scrape businesses
    const businesses = await scrapeBusiness(location, radius, searchTerm);
    
    // Save businesses to database
    for (const business of businesses) {
      try {
        await supabase
          .from('businesses')
          .upsert(business, { onConflict: 'source_id,external_id' });
        
        logger.info(`Saved business: ${business.name}`);
        
        // Update business count in job
        if (jobId) {
          await supabase
            .from('scraper_runs')
            .update({ 
              businessesfound: supabase.rpc('increment_counter', { row_id: jobId, count: 1 })
            })
            .eq('id', jobId);
        }
      } catch (error) {
        logger.error(`Error saving business ${business.name}:`, error);
      }
    }
    
    // Update job status to completed
    if (jobId) {
      await supabase
        .from('scraper_runs')
        .update({ 
          status: 'completed',
          businessesfound: businesses.length
        })
        .eq('id', jobId);
    }
    
    logger.info(`Grid search completed for ${location}, found ${businesses.length} businesses`);
    return businesses;
  } catch (error) {
    logger.error(`Error in grid search for ${location}:`, error);
    
    // Update job status to failed if jobId is provided
    if (jobId) {
      await supabase
        .from('scraper_runs')
        .update({ 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', jobId);
    }
    
    throw error;
  }
}
