
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, TimerReset } from 'lucide-react';
import { ScraperJob } from '@/services/scraperService';

interface JobListProps {
  jobs: ScraperJob[];
  loading: boolean;
  onRefresh: () => void;
  onResetStatus?: (jobId?: string) => void;
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  loading,
  onRefresh,
  onResetStatus
}) => {
  const hasRunningJobs = jobs.some(job => job.status === 'running');

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'running':
        return 'secondary';
      case 'failed':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

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
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getBadgeVariant(job.status)}
                    >
                      {job.status}
                    </Badge>
                    
                    {job.status === 'running' && onResetStatus && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onResetStatus(job.id)}
                        title="Reset this job's status"
                      >
                        <TimerReset className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm">
                    Businesses found: {job.businessesfound || 0}
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
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Jobs
        </Button>
        
        {hasRunningJobs && onResetStatus && (
          <Button 
            variant="secondary" 
            onClick={() => onResetStatus()}
            title="Reset all running jobs' status"
          >
            <TimerReset className="mr-2 h-4 w-4" />
            Reset Running Jobs
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default JobList;
