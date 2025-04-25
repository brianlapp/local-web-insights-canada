
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AuditCard from './AuditCard';
import { Skeleton } from './skeleton';

interface AuditsListProps {
  limit?: number; // Limit the number of results, used for homepage
  showHeader?: boolean;
  title?: string;
  // Add filters/sorting props if needed for a more complex audits page
  // filterCity?: string;
  // sortBy?: 'audit_date' | 'score' | 'name';
}

export const AuditsList = ({ 
    limit, // Keep limit optional
    showHeader = true, 
    title = "Latest Audit Highlights" 
}: AuditsListProps) => {
  
  // Adjust query key based on props to avoid caching conflicts if used elsewhere
  const queryKey = ['audits-list', { limit }]; 

  const { data: audits, isLoading, error } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      console.log(`Fetching audits with limit: ${limit}`);
      
      let query = supabase
        .from('businesses')
        .select('*')
        .not('audit_date', 'is', null) // Only fetch businesses that have been audited
        .order('audit_date', { ascending: false }); // Sort by the most recent audit date

      // Apply limit if provided (for homepage use case)
      if (limit) {
        query = query.limit(limit);
      }
      
      // Add filters or other sorting here if needed in the future
      // if (filterCity) query = query.eq('city', filterCity);
      // if (sortBy === 'score') query = query.order('scores->>overall', { ascending: false }); 
      // etc.

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audits:', error);
        throw error;
      }

      // Ensure scores object exists and has defaults
      const processedData = (data || []).map(business => ({
          ...business,
          scores: {
              overall: business.scores?.overall || 0,
              performance: business.scores?.performance || 0,
              seo: business.scores?.seo || 0,
              accessibility: business.scores?.accessibility || 0,
              bestPractices: business.scores?.bestPractices || 0
          }
      }));

      return processedData;
    },
     // Add stale time or cache time if needed
     // staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (error) {
    console.error('Error rendering AuditsList:', error);
    return (
      <div className="text-center text-red-600">
        Error loading audits. Please check console or try again later.
      </div>
    );
  }

  return (
    <div className="w-full">
      {showHeader && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-civic-gray-900">{title}</h2>
          {/* Add filter/sort controls here later if needed */}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit || 3)].map((_, i) => ( // Show skeleton based on limit or default
            <div key={i} className="p-4 border border-gray-100 rounded-lg">
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-3" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      ) : audits && audits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audits.map((business) => (
            <AuditCard
              key={business.id}
              business={{
                name: business.name || 'Unnamed Business',
                city: business.city || 'Unknown location',
                slug: business.slug || '',
                category: business.category || 'Uncategorized',
                image: business.image || '',
                scores: business.scores, // Already processed with defaults in queryFn
                is_upgraded: business.is_upgraded || false,
                // Use audit_date directly, fallback handled in AuditCard if needed
                audit_date: business.audit_date 
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-civic-gray-600 py-8">
          {showHeader && <p>No audits have been completed yet.</p>}
          {!showHeader && <p>No recent audit highlights available.</p>} 
        </div>
      )}
    </div>
  );
};

export default AuditsList;
