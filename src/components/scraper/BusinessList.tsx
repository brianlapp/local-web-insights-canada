
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Tables } from '@/integrations/supabase/schema';

type Business = Tables['businesses'];

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
                    onClick={() => onRunAudit(business.id, business.website)}
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
        <Button variant="outline" className="w-full" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh List
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BusinessList;
