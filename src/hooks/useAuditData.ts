import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { fetchAuditData, type AuditData } from '@/lib/api'

export function useAuditData(
  businessSlug: string,
  options?: Omit<UseQueryOptions<AuditData, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['audit', businessSlug],
    queryFn: () => fetchAuditData(businessSlug),
    ...options,
  })
} 