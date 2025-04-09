import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/schema';

export type Business = Tables['businesses'];
export type ScraperJob = Tables['scraper_runs'];

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
        status: 'running' as const,
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
        console.log(`Calling scraper API at /api/scraper/start for location: ${location}`);
        
        const response = await fetch('/api/scraper/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`
          },
          body: JSON.stringify({
            location,
            jobId: data.id
          }),
        });

        if (!response.ok) {
          let errorMessage = 'Failed to start scraper';
          
          try {
            const errorData = await response.json();
            console.error('API error starting scraper:', errorData);
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            console.error('Could not parse error response:', parseError);
            // Use status text if the response isn't valid JSON
            errorMessage = `API error (${response.status}): ${response.statusText}`;
          }
          
          // Update the job status to failed
          await supabase
            .from('scraper_runs')
            .update({ status: 'failed', error: errorMessage })
            .eq('id', data.id);
            
          throw new Error(errorMessage);
        }
        
        const responseData = await response.json();
        console.log('Scraper started successfully:', responseData);
        
        return data;
      } catch (apiError) {
        console.error('API call failed:', apiError);
        
        // Update the job status to failed
        await supabase
          .from('scraper_runs')
          .update({ 
            status: 'failed', 
            error: apiError instanceof Error 
              ? apiError.message 
              : 'API call failed' 
          })
          .eq('id', data.id);
          
        throw apiError;
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
    
    const response = await fetch('/api/scraper/audit', {
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
    const response = await fetch(`/api/scraper/health?t=${timestamp}`);
    
    if (!response.ok) {
      console.error(`Health check failed with status: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    console.log('Health check response:', data);
    return data && data.status === 'ok';
  } catch (error) {
    console.error('Health check failed with error:', error);
    return false;
  }
};
