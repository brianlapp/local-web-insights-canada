
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ScraperJob } from '@/services/scraperService';

interface JobListProps {
  jobs: ScraperJob[];
  loading: boolean;
  onRefresh: () => void;
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  loading,
  onRefresh
}) => {
  return (
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
            {loading ? (
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
        <Button variant="outline" className="w-full" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Jobs
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobList;
