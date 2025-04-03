import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuditData } from '@/hooks/useAuditData'
import { fetchAuditData } from '@/lib/api'

// Mock API response
const mockAuditData = {
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
  fetchAuditData: vi.fn()
}))

// Create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useAuditData Hook', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  // Test loading state
  describe('Loading State', () => {
    it('returns loading state initially', () => {
      const { result } = renderHook(() => useAuditData('test-business'), {
        wrapper: createWrapper()
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
    })
  })

  // Test successful data fetching
  describe('Successful Data Fetching', () => {
    beforeEach(() => {
      vi.mocked(fetchAuditData).mockResolvedValue(mockAuditData)
    })

    it('fetches and returns audit data', async () => {
      const { result } = renderHook(() => useAuditData('test-business'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockAuditData)
      expect(result.current.error).toBeNull()
    })

    it('caches data for subsequent requests', async () => {
      const { result, rerender } = renderHook(() => useAuditData('test-business'), {
        wrapper: createWrapper()
      })

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.data).toEqual(mockAuditData)
      })

      // Rerender and verify fetch isn't called again
      rerender()
      expect(vi.mocked(fetchAuditData)).toHaveBeenCalledTimes(1)
    })
  })

  // Test error handling
  describe('Error Handling', () => {
    const error = new Error('Failed to fetch audit data')

    beforeEach(() => {
      vi.mocked(fetchAuditData).mockRejectedValue(error)
    })

    it('handles error states correctly', async () => {
      const { result } = renderHook(() => useAuditData('test-business'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.data).toBeUndefined()
    })
  })

  // Test stale data handling
  describe('Stale Data Handling', () => {
    it('refetches when data is stale', async () => {
      const { result } = renderHook(() => useAuditData('test-business', { staleTime: 0 }), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.data).toEqual(mockAuditData)
      })

      // Trigger a refetch
      result.current.refetch()

      expect(vi.mocked(fetchAuditData)).toHaveBeenCalledTimes(2)
    })
  })

  // Test data transformation
  describe('Data Transformation', () => {
    it('transforms raw API data correctly', async () => {
      const { result } = renderHook(() => useAuditData('test-business'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.data).toBeTruthy()
      })

      expect(result.current.data?.metrics).toHaveProperty('performance')
      expect(result.current.data?.recommendations).toBeInstanceOf(Array)
    })
  })

  // Test query invalidation
  describe('Query Invalidation', () => {
    it('invalidates cache when manually triggered', async () => {
      const queryClient = new QueryClient()
      const { result } = renderHook(() => useAuditData('test-business'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )
      })

      await waitFor(() => {
        expect(result.current.data).toBeTruthy()
      })

      // Invalidate the query
      queryClient.invalidateQueries({ queryKey: ['audit', 'test-business'] })

      // Should trigger a refetch
      expect(vi.mocked(fetchAuditData)).toHaveBeenCalledTimes(2)
    })
  })
}) 