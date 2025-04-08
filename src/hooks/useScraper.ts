
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  fetchRecentBusinesses, 
  fetchRecentJobs, 
  startScraper, 
  runWebsiteAudit,
  Business,
  ScraperJob
} from '@/services/scraperService';

export const useScraper = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [jobs, setJobs] = useState<ScraperJob[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [jobLoading, setJobLoading] = useState<boolean>(false);
  const [location, setLocation] = useState<string>('Ottawa');
  const [currentJob, setCurrentJob] = useState<ScraperJob | null>(null);
  const { toast } = useToast();
  
  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRecentBusinesses();
      setBusinesses(data);
    } catch (error: any) {
      toast({
        title: 'Error fetching businesses',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  const fetchJobs = useCallback(async () => {
    setJobLoading(true);
    try {
      const { jobs, currentJob } = await fetchRecentJobs();
      setJobs(jobs);
      setCurrentJob(currentJob);
    } catch (error: any) {
      toast({
        title: 'Error fetching jobs',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setJobLoading(false);
    }
  }, [toast]);
  
  const handleStartScraper = useCallback(async () => {
    if (!location.trim()) {
      toast({
        title: 'Location required',
        description: 'Please enter a location to scrape',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newJob = await startScraper(location);
      setCurrentJob(newJob);
      
      toast({
        title: 'Scraper started',
        description: `Started scraping businesses in ${location}`,
      });

      fetchJobs();
    } catch (error: any) {
      toast({
        title: 'Error starting scraper',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [location, toast, fetchJobs]);
  
  const handleRunWebsiteAudit = useCallback(async (businessId: string, website: string) => {
    if (!website) {
      toast({
        title: 'Website required',
        description: 'Business does not have a website to audit',
        variant: 'destructive',
      });
      return;
    }

    try {
      await runWebsiteAudit(businessId, website);
      
      toast({
        title: 'Website audit started',
        description: `Started auditing ${website}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error starting audit',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [toast]);
  
  useEffect(() => {
    fetchBusinesses();
    fetchJobs();
  }, [fetchBusinesses, fetchJobs]);
  
  return {
    businesses,
    jobs,
    loading,
    jobLoading,
    location,
    currentJob,
    setLocation,
    fetchBusinesses,
    fetchJobs,
    handleStartScraper,
    handleRunWebsiteAudit,
  };
};
