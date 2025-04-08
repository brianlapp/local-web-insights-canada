
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, ChartBar, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardPage() {
  // Fetch dashboard stats from the database
  const { data: businessCount, isLoading: isLoadingBusinesses } = useQuery({
    queryKey: ['business-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });
  
  const { data: auditCount, isLoading: isLoadingAudits } = useQuery({
    queryKey: ['audit-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('website_audits')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });
  
  const { data: averageScore, isLoading: isLoadingScores } = useQuery({
    queryKey: ['average-score'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('overall_score')
        .not('overall_score', 'is', null);
      
      if (error) throw error;
      
      if (!data || data.length === 0) return 0;
      
      const validScores = data.filter(item => item.overall_score !== null).map(item => item.overall_score || 0);
      if (validScores.length === 0) return 0;
      
      const total = validScores.reduce((sum, score) => sum + score, 0);
      return Math.round(total / validScores.length);
    }
  });
  
  const { data: pendingReviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['pending-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .is('latest_audit_id', null)
        .not('website', 'is', null);
      
      if (error) throw error;
      return data?.length || 0;
    }
  });

  const isLoading = isLoadingBusinesses || isLoadingAudits || isLoadingScores || isLoadingReviews;

  const stats = [
    {
      name: 'Total Businesses',
      value: isLoading ? '...' : businessCount?.toString() || '0',
      description: 'Businesses audited',
      icon: Building2,
    },
    {
      name: 'Total Audits',
      value: isLoading ? '...' : auditCount?.toString() || '0',
      description: 'Website audits completed',
      icon: Users,
    },
    {
      name: 'Average Score',
      value: isLoading ? '...' : averageScore?.toString() || '0',
      description: 'Overall audit score',
      icon: ChartBar,
    },
    {
      name: 'Pending Reviews',
      value: isLoading ? '...' : pendingReviews?.toString() || '0',
      description: 'Awaiting review',
      icon: AlertCircle,
    },
  ];

  // Fetch recent activity
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
          Overview of your business audits and petition signatures
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
              • Create a new business audit
            </p>
            <p className="text-sm text-muted-foreground">
              • Review pending websites
            </p>
            <p className="text-sm text-muted-foreground">
              • Update business status
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
