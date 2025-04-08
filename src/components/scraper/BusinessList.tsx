
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { Business } from '@/services/scraperService';

interface BusinessListProps {
  businesses: Business[];
  loading: boolean;
  onRefresh: () => void;
  onRunAudit: (businessId: string, website: string) => void;
}

const BusinessList: React.FC<BusinessListProps> = ({
  businesses,
  loading,
  onRefresh,
  onRunAudit
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently Discovered Businesses</CardTitle>
        <CardDescription>
          Businesses found by the scraper
        </CardDescription>
      </CardHeader>
      <CardContent>
        {businesses.length > 0 ? (
          <div className="space-y-4">
            {businesses.map((business) => (
              <div 
                key={business.id} 
                className="p-4 border rounded-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{business.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {business.address || business.city || 'No location data'}
                    </p>
                    {business.category && (
                      <Badge variant="outline" className="mt-1">
                        {business.category}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    {business.scores?.overall ? (
                      <div className="text-sm">
                        <span className="font-medium">Score: </span>
                        <Badge 
                          variant={
                            business.scores.overall >= 80 ? 'default' :
                            business.scores.overall >= 60 ? 'secondary' :
                            'destructive'
                          }
                        >
                          {business.scores.overall}
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="outline">Not audited</Badge>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <div className="text-sm">
                    {business.website ? (
                      <a 
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit Website
                      </a>
                    ) : (
                      <span className="text-muted-foreground">No website</span>
                    )}
                  </div>
                  
                  {business.website && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRunAudit(business.id, business.website || '')}
                      disabled={!business.website}
                    >
                      Run Website Audit
                    </Button>
                  )}
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
        <Button variant="outline" className="w-full" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Businesses
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BusinessList;
