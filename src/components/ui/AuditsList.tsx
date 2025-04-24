
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AuditCard from './AuditCard';
import { Skeleton } from './skeleton';

interface AuditsListProps {
  limit?: number;
  showHeader?: boolean;
  title?: string;
}

export const AuditsList = ({ limit = 6, showHeader = true, title = "Latest Audit Highlights" }: AuditsListProps) => {
  const { data: recentAudits, isLoading, error } = useQuery({
    queryKey: ['recent-audits'],
    queryFn: async () => {
      console.log('Fetching recent audits...');
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        // Remove the scores filter to show all businesses
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching audits:', error);
        throw error;
      }

      // Add logging but don't filter out businesses
      (data || []).forEach(business => {
        if (!business.scores || typeof business.scores.overall !== 'number') {
          console.log(`Business ${business.id} (${business.name}) has missing/invalid scores:`, business.scores);
        }
      });

      return data || [];
    },
  });

  if (error) {
    console.error('Error fetching audits:', error);
    return (
      <div className="text-center text-civic-gray-600">
        Unable to load recent audits. Please try again later.
      </div>
    );
  }

  return (
    <div className="w-full">
      {showHeader && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-civic-gray-900">{title}</h2>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : recentAudits && recentAudits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentAudits.map((business) => (
            <AuditCard
              key={business.id}
              business={{
                name: business.name || 'Unnamed Business',
                city: business.city || 'Unknown location',
                slug: business.slug || '',
                category: business.category || 'Uncategorized',
                image: business.image || '',
                scores: {
                  overall: business.scores?.overall || 0,
                  performance: business.scores?.performance || 0,
                  seo: business.scores?.seo || 0,
                  accessibility: business.scores?.accessibility || 0,
                  bestPractices: business.scores?.bestPractices || 0
                },
                is_upgraded: business.is_upgraded || false,
                audit_date: business.audit_date || business.created_at
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-civic-gray-600">
          No audits available yet.
        </div>
      )}
    </div>
  );
};

export default AuditsList;
