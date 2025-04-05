
import { supabase } from './client'
import type { AuditData } from '@/lib/api'
import type { Database } from './schema'

/**
 * Fetches audit data for a business, respecting RLS policies:
 * - Auditors can access all audit data
 * - Business owners can only access their own business's audit data
 * - Unauthenticated users cannot access any audit data
 */
export async function fetchAuditDataWithRLS(businessSlug: string): Promise<AuditData> {
  // First check if user is authenticated
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!session) throw new Error('Authentication required')

  const { data, error } = await supabase
    .from('audits')
    .select()
    .eq('business_slug', businessSlug)
    .single<Database['public']['Tables']['audits']>()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('Audit not found')
  }

  return {
    score: data.score,
    metrics: data.metrics,
    recommendations: data.recommendations,
    lastUpdated: data.lastUpdated,
  }
}

/**
 * Updates audit data for a business, respecting RLS policies:
 * - Only auditors can update audit data
 * - Business owners cannot update audit data
 * - Unauthenticated users cannot update audit data
 */
export async function updateAuditDataWithRLS(
  businessSlug: string,
  auditData: AuditData
): Promise<AuditData> {
  // First check if user is authenticated and has auditor role
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!session) throw new Error('Authentication required')

  const userRole = session.user.user_metadata.role
  if (userRole !== 'auditor') {
    throw new Error('Only auditors can update audit data')
  }

  const { data, error } = await supabase
    .from('audits')
    .update({
      score: auditData.score,
      metrics: auditData.metrics,
      recommendations: auditData.recommendations,
      lastUpdated: auditData.lastUpdated,
    })
    .eq('business_slug', businessSlug)
    .select<string, Database['public']['Tables']['audits']>()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('Failed to update audit data')
  }

  return {
    score: data.score,
    metrics: data.metrics,
    recommendations: data.recommendations,
    lastUpdated: data.lastUpdated,
  }
}
