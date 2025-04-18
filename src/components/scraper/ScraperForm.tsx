
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, RefreshCw, AlertTriangle, TimerReset } from 'lucide-react';
import { ScraperJob } from '@/services/scraperService';

interface ScraperFormProps {
  currentJob: ScraperJob | null;
  location: string;
  onLocationChange: (location: string) => void;
  onStartScraper: () => void;
  onRefreshJobs: () => void;
  onResetStatus?: (jobId?: string) => void;
  apiAvailable?: boolean;
}

const ScraperForm: React.FC<ScraperFormProps> = ({
  currentJob,
  location,
  onLocationChange,
  onStartScraper,
  onRefreshJobs,
  onResetStatus,
  apiAvailable = true
}) => {
  // Calculate progress as a percentage based on business count
  // For simplicity we'll use a mock progression that shows some movement
  const progressValue = currentJob ? Math.min(45, currentJob.businessesfound * 2) : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Start Business Scraper</CardTitle>
        <CardDescription>
          Scrape businesses from a specific location
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!apiAvailable && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>
                Cannot connect to the scraper service. Some features may be unavailable.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="col-span-2">
              <Input 
                placeholder="Location (e.g., Ottawa)" 
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                disabled={!!currentJob}
              />
            </div>
            <Button 
              onClick={onStartScraper} 
              disabled={!!currentJob || !location || !apiAvailable}
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
                <div className="flex items-center gap-2">
                  <Badge>
                    {currentJob.status}
                  </Badge>
                  
                  {currentJob.status === 'running' && onResetStatus && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onResetStatus(currentJob.id)}
                      title="Reset job status"
                    >
                      <TimerReset className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Businesses found:</span>
                  <span>{currentJob.businessesfound || 0}</span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onRefreshJobs}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
        
        {currentJob && currentJob.status === 'running' && onResetStatus && (
          <Button 
            variant="secondary"
            onClick={() => onResetStatus(currentJob.id)}
          >
            <TimerReset className="mr-2 h-4 w-4" />
            Reset Status
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ScraperForm;
