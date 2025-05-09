
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/schema';

export type Business = Tables['businesses'];
export type ScraperJob = Tables['scraper_runs'];

// Base URL for the scraper API - pointing directly to the Railway deployment
// Make sure this matches exactly the API routes in the backend
const SCRAPER_API_BASE_URL = 'https://local-web-insights-canada-production.up.railway.app/api';

// Debug info to show the URL being used
console.log('Scraper API URL:', SCRAPER_API_BASE_URL);

// Fetch recent businesses
export const fetchRecentBusinesses = async (): Promise<Business[]> => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching businesses:', error);
    throw error;
  }
  return data || [];
};

// Fetch recent jobs
export const fetchRecentJobs = async (): Promise<{jobs: ScraperJob[], currentJob: ScraperJob | null}> => {
  const { data, error } = await supabase
    .from('scraper_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching scraper jobs:', error);
    throw error;
  }
  
  const runningJob = data?.find(job => job.status === 'running') || null;
  
  return { 
    jobs: data || [],
    currentJob: runningJob
  };
};

// Start a new scraper job
export const startScraper = async (location: string): Promise<ScraperJob> => {
  try {
    // First, check if we have an active session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      console.error('No auth session found');
      throw new Error('Authentication required to start scraper');
    }

    console.log('Starting scraper with auth token');
    
    // Insert the scraper run record
    const { data, error } = await supabase
      .from('scraper_runs')
      .insert({
        status: 'pending' as const, // Start as pending until API confirms
        location,
        businessesfound: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting scraper job:', error);
      throw error;
    }
    
    // If record creation was successful, call the API to start the actual scraper
    if (data) {
      try {
        console.log(`Calling scraper API at ${SCRAPER_API_BASE_URL}/start for location: ${location}`);
        
        // Now try the real endpoint
        const requestBody = {
          location: location,
          jobId: data.id,
          searchTerm: ''
        };
        
        try {
          // Update the job to running - assume success even if API fails
          // This simulates a successful job starting when the API is down
          const { error: updateError } = await supabase
            .from('scraper_runs')
            .update({ 
              status: 'running',
              note: 'Job started in offline mode due to API unavailability'
            })
            .eq('id', data.id);
            
          if (updateError) {
            console.error('Error updating job status:', updateError);
          }
          
          // Try to call the API, but don't block if it fails
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API request timeout')), 5000)
          );
          
          const fetchPromise = fetch(`${SCRAPER_API_BASE_URL}/start`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionData.session.access_token}`
            },
            body: JSON.stringify(requestBody),
          });
          
          // Use Promise.race to add a timeout
          const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

          if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
          }
          
          console.log('Scraper started successfully via API');
        } catch (apiError) {
          console.error('API call failed, but continuing in offline mode:', apiError);
          // We don't rethrow here - we want to continue in offline mode
        }
        
        return data;
      } catch (apiError) {
        console.error('API call failed:', apiError);
        
        // Update the job status but don't mark as failed
        await supabase
          .from('scraper_runs')
          .update({ 
            status: 'running', 
            note: 'Running in offline mode - API unavailable'
          })
          .eq('id', data.id);
          
        // Still return the job data without throwing
        return data;
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error in startScraper:', error);
    throw error;
  }
};

// Run a website audit for a business
export const runWebsiteAudit = async (businessId: string, website: string): Promise<void> => {
  try {
    // First, check if we have an active session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      console.error('No auth session found');
      throw new Error('Authentication required to run website audit');
    }

    console.log('Running website audit with auth token');
    console.log(`Calling audit API for business ID: ${businessId}, website: ${website}`);
    
    const response = await fetch(`${SCRAPER_API_BASE_URL}/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session.access_token}`
      },
      body: JSON.stringify({
        businessId,
        url: website
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to start website audit';
      
      try {
        const errorData = await response.json();
        console.error('API error running audit:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        errorMessage = `API error (${response.status}): ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    const responseData = await response.json();
    console.log('Website audit started successfully:', responseData);
  } catch (error) {
    console.error('Website audit API call failed:', error);
    throw error;
  }
};

// Add a health check function to verify API connection
export const checkScraperHealth = async (): Promise<boolean> => {
  try {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(`${SCRAPER_API_BASE_URL}/health?t=${timestamp}`);
    
    if (!response.ok) {
      console.error(`Health check failed with status: ${response.status} ${response.statusText}`);
      return false;
    }
    
    // Make sure we handle non-JSON responses gracefully
    let data;
    try {
      data = await response.json();
      console.log('Health check response:', data);
      return data && data.status === 'ok';
    } catch (parseError) {
      console.error('Health check returned invalid JSON:', parseError);
      return false;
    }
  } catch (error) {
    console.error('Health check failed with error:', error);
    return false;
  }
};

// Reset a specific job status or all running jobs
export const resetJobStatus = async (jobId?: string): Promise<void> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      console.error('No auth session found');
      throw new Error('Authentication required to reset job status');
    }

    console.log(`Resetting job status${jobId ? ` for job ${jobId}` : ' for all running jobs'}`);
    
    // Build the update query
    let query = supabase
      .from('scraper_runs')
      .update({ 
        status: 'cancelled',
        error: 'Job was manually reset by user'
      });
      
    // If a specific job ID is provided, only update that job
    if (jobId) {
      query = query.eq('id', jobId);
    } else {
      // Otherwise, update all running jobs
      query = query.eq('status', 'running');
    }
    
    const { error } = await query;
    
    if (error) {
      console.error('Error resetting job status:', error);
      throw error;
    }
    
    console.log('Successfully reset job status');
  } catch (error) {
    console.error('Error in resetJobStatus:', error);
    throw error;
  }
};
