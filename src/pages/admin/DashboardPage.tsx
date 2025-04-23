
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPage() {
  // Fetch recent businesses
  const { data: recentBusinesses, isLoading: isLoadingRecentBusinesses } = useQuery({
    queryKey: ['recent-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, category, city, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
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
              <div className="space-y-2">
                {recentBusinesses.map((business) => (
                  <div key={business.id} className="flex justify-between text-sm">
                    <span className="font-medium">{business.name}</span>
                    <span className="text-muted-foreground">{business.city || 'Unknown location'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity to display
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              • Import new businesses from CSV
            </p>
            <p className="text-sm text-muted-foreground">
              • Review pending websites
            </p>
            <p className="text-sm text-muted-foreground">
              • Update business information
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
