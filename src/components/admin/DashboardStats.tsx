
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, ChartBar, AlertCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '@/integrations/supabase/client';

export function DashboardStats() {
  // Fetch total number of businesses
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

  // Fetch average score
  const { data: averageScore, isLoading: isLoadingScores } = useQuery({
    queryKey: ['average-score'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('scores');
      
      if (error) throw error;
      
      if (!data || data.length === 0) return 0;
      
      const scores = data
        .map(b => b.scores?.overall || 0)
        .filter(score => score > 0);
      
      if (scores.length === 0) return 0;
      
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
  });

  // Count unique cities
  const { data: citiesCount, isLoading: isLoadingCities } = useQuery({
    queryKey: ['cities-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('city');
      
      if (error) throw error;
      
      const uniqueCities = new Set(data?.map(b => b.city?.toLowerCase()).filter(Boolean));
      return uniqueCities.size;
    }
  });

  const isLoading = isLoadingBusinesses || isLoadingScores || isLoadingCities;

  const stats = [
    {
      name: 'Total Businesses',
      value: isLoading ? '...' : businessCount?.toString() || '0',
      description: 'Businesses in database',
      icon: Building2,
    },
    {
      name: 'Cities Covered',
      value: isLoading ? '...' : citiesCount?.toString() || '0',
      description: 'Unique locations',
      icon: Users,
    },
    {
      name: 'Average Score',
      value: isLoading ? '...' : `${averageScore}%`,
      description: 'Overall audit score',
      icon: ChartBar,
    },
    {
      name: 'Pending Reviews',
      value: isLoading ? '...' : '0',
      description: 'Awaiting audit',
      icon: AlertCircle,
    },
  ];

  return (
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
  );
}
