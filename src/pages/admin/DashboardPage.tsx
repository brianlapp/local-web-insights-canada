
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { AuditBatchControls } from "@/components/admin/AuditBatchControls";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function DashboardPage() {
  // Fetch recent businesses
  const { data: recentBusinesses, isLoading: isLoadingRecentBusinesses } = useQuery({
    queryKey: ['recent-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, category, city, created_at, scores')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      console.log('Recent businesses fetched:', data);
      return data || [];
    }
  });

  // Fetch recent audit batches
  const { data: recentBatches, isLoading: isLoadingBatches } = useQuery({
    queryKey: ['recent-batches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_batches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      console.log('Recent batches fetched:', data);
      return data || [];
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your business audits and website analytics
        </p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AuditBatchControls />
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRecentBusinesses ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : recentBusinesses && recentBusinesses.length > 0 ? (
              <div className="space-y-3">
                {recentBusinesses.map((business) => (
                  <div key={business.id} className="flex justify-between items-center text-sm border-b pb-2">
                    <div>
                      <span className="font-medium">{business.name}</span>
                      <span className="text-muted-foreground ml-2">{business.city || 'Unknown location'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-3">
                        Score: {business.scores?.overall || 'N/A'}
                      </span>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                        <a href={`/${business.city?.toLowerCase()}/${business.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button variant="link" className="mt-2 p-0">
                  View all businesses
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity to display
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
