import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSubmitAuditData } from './useSubmitAuditData'
import { submitAuditData, type AuditData } from '@/lib/api'

// Mock API response
const mockAuditData: AuditData = {
  score: 85,
  metrics: {
    performance: 90,
    accessibility: 85,
    seo: 80,
    bestPractices: 85
  },
  recommendations: [
    { id: 1, category: 'SEO', description: 'Add meta descriptions' },
    { id: 2, category: 'Performance', description: 'Optimize images' }
  ],
  lastUpdated: '2024-03-20T12:00:00Z'
}

// Mock the API module
vi.mock('@/lib/api', () => ({
  submitAuditData: vi.fn()
}))

// Create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useSubmitAuditData Hook', () => {
  const businessSlug = 'test-business'
  
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('Mutation Behavior', () => {
    it('submits audit data successfully', async () => {
      vi.mocked(submitAuditData).mockResolvedValue(mockAuditData)

      const { result } = renderHook(() => useSubmitAuditData(), {
        wrapper: createWrapper()
      })

      // Start the mutation
      result.current.mutate({ businessSlug, data: mockAuditData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockAuditData)
      expect(submitAuditData).toHaveBeenCalledWith(businessSlug, mockAuditData)
    })

    it('handles submission errors', async () => {
      const error = new Error('Failed to submit audit data')
      vi.mocked(submitAuditData).mockRejectedValue(error)

      const { result } = renderHook(() => useSubmitAuditData(), {
        wrapper: createWrapper()
      })

      result.current.mutate({ businessSlug, data: mockAuditData })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('Cache Invalidation', () => {
    it('invalidates related queries on successful submission', async () => {
      const queryClient = new QueryClient()
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')
      
      vi.mocked(submitAuditData).mockResolvedValue(mockAuditData)

      const { result } = renderHook(() => useSubmitAuditData(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )
      })

      result.current.mutate({ businessSlug, data: mockAuditData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['audit', businessSlug] })
    })
  })

  describe('Loading State', () => {
    it('tracks loading state during submission', async () => {
      vi.mocked(submitAuditData).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockAuditData), 100))
      )

      const { result } = renderHook(() => useSubmitAuditData(), {
        wrapper: createWrapper()
      })

      result.current.mutate({ businessSlug, data: mockAuditData })

      expect(result.current.isPending).toBe(true)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.isPending).toBe(false)
    })
  })
}) 