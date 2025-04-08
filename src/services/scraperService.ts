
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

  if (error) throw error;
  return data || [];
};

// Fetch recent jobs
export const fetchRecentJobs = async (): Promise<{jobs: ScraperJob[], currentJob: ScraperJob | null}> => {
  const { data, error } = await supabase
    .from('scraper_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) throw error;
  
  const runningJob = data?.find(job => job.status === 'running') || null;
  
  return { 
    jobs: data || [],
    currentJob: runningJob
  };
};

// Start a new scraper job
export const startScraper = async (location: string): Promise<ScraperJob> => {
  const { data, error } = await supabase
    .from('scraper_runs')
    .insert({
      status: 'running' as const,
      location,
      businessesFound: 0
    })
    .select()
    .single();

  if (error) throw error;
  
  if (data) {
    const response = await fetch('/api/scraper/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location,
        jobId: data.id
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to start scraper');
    }
  }
  
  return data;
};

// Run a website audit for a business
export const runWebsiteAudit = async (businessId: string, website: string): Promise<void> => {
  const response = await fetch('/api/scraper/audit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      businessId,
      url: website
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to start website audit');
  }
};
