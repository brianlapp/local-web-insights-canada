import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { submitAuditData, type AuditData } from '@/lib/api'

interface SubmitAuditDataVariables {
  businessSlug: string
  data: AuditData
}

export function useSubmitAuditData(
  options?: Omit<
    UseMutationOptions<AuditData, Error, SubmitAuditDataVariables>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ businessSlug, data }: SubmitAuditDataVariables) =>
      submitAuditData(businessSlug, data),
    onSuccess: (_, { businessSlug }) => {
      // Invalidate the audit query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['audit', businessSlug] })
    },
    ...options,
  })
} 