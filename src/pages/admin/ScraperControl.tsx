
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Search, RefreshCw } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  website: string;
  city: string;
  scores?: {
    overall: number;
  };
  auditDate?: string;
}

interface ScraperJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  location: string;
  businessesFound?: number;
  error?: string;
}

export default function ScraperControl() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [jobs, setJobs] = useState<ScraperJob[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [jobLoading, setJobLoading] = useState<boolean>(false);
  const [location, setLocation] = useState<string>('Ottawa');
  const [currentJob, setCurrentJob] = useState<ScraperJob | null>(null);
  const { toast } = useToast();

  // Fetch recent businesses and jobs on component mount
  useEffect(() => {
    fetchRecentBusinesses();
    fetchJobs();
  }, []);

  const fetchRecentBusinesses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching businesses',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    setJobLoading(true);
    try {
      const { data, error } = await supabase
        .from('scraper_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setJobs(data || []);
      
      // Check if there's an active job
      const runningJob = data?.find(job => job.status === 'running');
      if (runningJob) {
        setCurrentJob(runningJob);
      } else {
        setCurrentJob(null);
      }
    } catch (error: any) {
      toast({
        title: 'Error fetching jobs',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setJobLoading(false);
    }
  };

  const startScraper = async () => {
    if (!location.trim()) {
      toast({
        title: 'Location required',
        description: 'Please enter a location to scrape',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create a new scraper run
      const { data, error } = await supabase
        .from('scraper_runs')
        .insert({
          status: 'running',
          location,
          businessesFound: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Set the current job
      setCurrentJob(data);
      
      // Call the scraper API endpoint
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

      toast({
        title: 'Scraper started',
        description: `Started scraping businesses in ${location}`,
      });

      // Refresh the job list
      fetchJobs();
    } catch (error: any) {
      toast({
        title: 'Error starting scraper',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const runWebsiteAudit = async (businessId: string, website: string) => {
    if (!website) {
      toast({
        title: 'Website required',
        description: 'Business does not have a website to audit',
        variant: 'destructive',
      });
      return;
    }

    try {
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
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Scraper Control Panel</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Start Business Scraper</CardTitle>
          <CardDescription>
            Scrape businesses from a specific location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="col-span-2">
                <Input 
                  placeholder="Location (e.g., Ottawa)" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={!!currentJob}
                />
              </div>
              <Button 
                onClick={startScraper} 
                disabled={!!currentJob || !location}
                className="w-full"
              >
                <Search className="mr-2 h-4 w-4" />
                Start Scraper
              </Button>
            </div>

            {currentJob && (
              <div className="space-y-2 p-4 border rounded-md bg-muted">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">Current Job: {currentJob.location}</h3>
                    <p className="text-sm text-muted-foreground">
                      Started: {new Date(currentJob.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge>
                    {currentJob.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Businesses found:</span>
                    <span>{currentJob.businessesFound || 0}</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={fetchJobs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Status
          </Button>
        </CardFooter>
      </Card>

      <Tabs defaultValue="businesses">
        <TabsList className="mb-4">
          <TabsTrigger value="businesses">Recent Businesses</TabsTrigger>
          <TabsTrigger value="jobs">Recent Jobs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="businesses">
          <Card>
            <CardHeader>
              <CardTitle>Recent Businesses</CardTitle>
              <CardDescription>
                Recently discovered businesses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {businesses.length > 0 ? (
                <div className="space-y-4">
                  {businesses.map((business) => (
                    <div 
                      key={business.id} 
                      className="p-4 border rounded-md space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{business.name}</h3>
                          <p className="text-sm text-muted-foreground">{business.city}</p>
                          {business.website && (
                            <a 
                              href={business.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {business.website}
                            </a>
                          )}
                        </div>
                        <div className="text-right">
                          {business.scores?.overall ? (
                            <Badge variant="outline">
                              Score: {business.scores.overall}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50">
                              No Audit
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => runWebsiteAudit(business.id, business.website)}
                          disabled={!business.website}
                        >
                          Run Audit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  {loading ? (
                    <p>Loading businesses...</p>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No businesses found</AlertTitle>
                      <AlertDescription>
                        Run the scraper to discover businesses
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={fetchRecentBusinesses}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh List
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>
                Recently run scraper jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="p-4 border rounded-md"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Location: {job.location}</h3>
                          <p className="text-sm text-muted-foreground">
                            Started: {new Date(job.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            job.status === 'completed' ? 'default' :
                            job.status === 'running' ? 'secondary' :
                            job.status === 'failed' ? 'destructive' : 'outline'
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm">
                          Businesses found: {job.businessesFound || 0}
                        </p>
                        {job.error && (
                          <p className="text-sm text-red-500 mt-1">
                            Error: {job.error}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  {jobLoading ? (
                    <p>Loading jobs...</p>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No jobs found</AlertTitle>
                      <AlertDescription>
                        Run the scraper to create new jobs
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={fetchJobs}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Jobs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
