
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  fetchRecentBusinesses, 
  fetchRecentJobs, 
  startScraper, 
  runWebsiteAudit,
  checkScraperHealth,
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
  const [apiAvailable, setApiAvailable] = useState<boolean>(true);
  const { toast } = useToast();
  
  // Check if the scraper API is available
  const checkApiHealth = useCallback(async () => {
    try {
      const isHealthy = await checkScraperHealth();
      setApiAvailable(isHealthy);
      
      if (!isHealthy) {
        console.warn('Scraper API is not available. Some features may not work.');
      }
    } catch (error) {
      console.error('Error checking API health:', error);
      setApiAvailable(false);
    }
  }, []);
  
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
    
    if (!apiAvailable) {
      toast({
        title: 'Scraper API unavailable',
        description: 'Cannot connect to the scraper service. Please try again later.',
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
  }, [location, toast, fetchJobs, apiAvailable]);
  
  const handleRunWebsiteAudit = useCallback(async (businessId: string, website: string) => {
    if (!website) {
      toast({
        title: 'Website required',
        description: 'Business does not have a website to audit',
        variant: 'destructive',
      });
      return;
    }
    
    if (!apiAvailable) {
      toast({
        title: 'Scraper API unavailable',
        description: 'Cannot connect to the scraper service. Please try again later.',
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
  }, [toast, apiAvailable]);
  
  useEffect(() => {
    checkApiHealth();
    fetchBusinesses();
    fetchJobs();
  }, [fetchBusinesses, fetchJobs, checkApiHealth]);
  
  return {
    businesses,
    jobs,
    loading,
    jobLoading,
    location,
    currentJob,
    apiAvailable,
    setLocation,
    fetchBusinesses,
    fetchJobs,
    handleStartScraper,
    handleRunWebsiteAudit,
  };
};
