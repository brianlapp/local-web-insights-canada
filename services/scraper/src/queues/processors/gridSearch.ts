import { Job } from 'bull';
import { logger } from '../../utils/logger.js';
import { getSupabaseClient } from '../../utils/database.js';

// Placeholder for the actual scraper implementation
async function scrapeBusiness(location: string, radius: number, searchTerm: string = '') {
  // Simulate finding businesses
  const numBusinesses = Math.floor(Math.random() * 10) + 1;
  logger.info(`Found ${numBusinesses} businesses for ${location}`);
  
  const businesses = [];
  
  for (let i = 0; i < numBusinesses; i++) {
    businesses.push({
      name: `Business ${i + 1} in ${location}`,
      address: `${i + 100} Main St, ${location}`,
      website: `https://business${i}.example.com`,
      phone: `555-${i}${i}${i}-${i}${i}${i}${i}`,
      city: location,
      source_id: 'google-places',
      external_id: `place-${location}-${i}`,
    });
  }
  
  return businesses;
}

export async function processGridSearch(job: Job) {
  const { location, radius, searchTerm, jobId } = job.data;
  logger.info(`Processing grid search for ${location} with radius ${radius}km`);

  try {
    // Get Supabase client
    const supabase = getSupabaseClient();
    
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error processing grid search for ${location}:`, error);
    
    // Update job status to failed
    if (jobId) {
      const supabase = getSupabaseClient();
      await supabase
        .from('scraper_runs')
        .update({ 
          status: 'failed',
          error: errorMessage
        })
        .eq('id', jobId);
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}
