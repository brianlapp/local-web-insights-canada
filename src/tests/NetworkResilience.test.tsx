import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { toast } from '@/components/ui/use-toast'
import { BusinessAuditPage } from '@/pages/[businessSlug]'
import { ToolsPage } from '@/pages/ToolsPage'

// Mock toast notifications
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}))

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock navigator.onLine
let mockOnline = true
Object.defineProperty(navigator, 'onLine', {
  configurable: true,
  get: () => mockOnline,
})

describe('Network Resilience', () => {
  const user = userEvent.setup()
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    mockOnline = true
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  const renderWithProviders = (route: string = '/') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/:businessSlug" element={<BusinessAuditPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('Offline Detection', () => {
    it('shows offline notification when connection is lost', async () => {
      renderWithProviders('/tools')

      // Simulate going offline
      mockOnline = false
      window.dispatchEvent(new Event('offline'))

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'You are offline',
          description: 'Some features may be limited',
          variant: 'destructive',
        })
      })
    })

    it('shows online notification when connection is restored', async () => {
      renderWithProviders('/tools')

      // Simulate going offline then online
      mockOnline = false
      window.dispatchEvent(new Event('offline'))
      mockOnline = true
      window.dispatchEvent(new Event('online'))

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'Back online',
          description: 'All features are now available',
          variant: 'default',
        })
      })
    })
  })

  describe('Cached Data Access', () => {
    it('serves cached business audit data when offline', async () => {
      const mockAuditData = {
        name: 'Test Business',
        score: 85,
        lastAudit: '2024-03-20',
      }

      // First request succeeds and caches
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAuditData),
      })

      renderWithProviders('/test-business')

      // Wait for data to be cached
      await waitFor(() => {
        expect(screen.getByText('Test Business')).toBeInTheDocument()
      })

      // Go offline and reload
      mockOnline = false
      window.dispatchEvent(new Event('offline'))

      // Data should still be available from cache
      expect(screen.getByText('Test Business')).toBeInTheDocument()
      expect(screen.getByText('85')).toBeInTheDocument()
    })
  })

  describe('Reconnection Behavior', () => {
    it('automatically retries failed requests when connection is restored', async () => {
      // Initial request fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      renderWithProviders('/tools')

      // Open Meta Tags Analyzer
      await user.click(screen.getByRole('button', { name: /use meta tags analyzer/i }))
      await user.type(screen.getByRole('textbox', { name: /url/i }), 'https://example.com')
      await user.click(screen.getByRole('button', { name: /analyze/i }))

      // Verify error state
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })

      // Mock successful retry after connection restored
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      // Simulate connection restoration
      mockOnline = true
      window.dispatchEvent(new Event('online'))

      // Verify auto-retry
      await waitFor(() => {
        expect(screen.queryByText(/network error/i)).not.toBeInTheDocument()
        expect(screen.getByRole('region', { name: /analysis results/i })).toBeInTheDocument()
      })
    })
  })

  describe('Timeout Handling', () => {
    it('handles request timeouts gracefully', async () => {
      // Simulate a timeout
      mockFetch.mockImplementationOnce(() => new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 5000)
      }))

      renderWithProviders('/tools')

      // Open Meta Tags Analyzer
      await user.click(screen.getByRole('button', { name: /use meta tags analyzer/i }))
      await user.type(screen.getByRole('textbox', { name: /url/i }), 'https://example.com')
      await user.click(screen.getByRole('button', { name: /analyze/i }))

      // Verify timeout handling
      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'Request Timeout',
          description: 'The request took too long to complete. Please try again.',
          variant: 'destructive',
        })
      })
    })

    it('allows manual retry after timeout', async () => {
      // First attempt times out
      mockFetch.mockImplementationOnce(() => new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 5000)
      }))

      // Second attempt succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      renderWithProviders('/tools')

      // Open Meta Tags Analyzer
      await user.click(screen.getByRole('button', { name: /use meta tags analyzer/i }))
      await user.type(screen.getByRole('textbox', { name: /url/i }), 'https://example.com')
      await user.click(screen.getByRole('button', { name: /analyze/i }))

      // Wait for timeout and retry button
      const retryButton = await screen.findByRole('button', { name: /retry/i })
      await user.click(retryButton)

      // Verify successful retry
      await waitFor(() => {
        expect(screen.getByRole('region', { name: /analysis results/i })).toBeInTheDocument()
      })
    })
  })
}) 