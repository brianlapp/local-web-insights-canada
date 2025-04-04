import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { BusinessAuditPage } from './[businessSlug]'
import { fetchBusinessAudit } from '@/lib/api'

// Mock the API module
vi.mock('@/lib/api', () => ({
  fetchBusinessAudit: vi.fn(),
}))

const mockAuditData = {
  id: 'test-id',
  slug: 'test-business',
  name: 'Test Business',
  score: 85,
  lastAudit: '2024-03-20T12:00:00Z',
  metrics: {
    seo: 80,
    performance: 90,
    accessibility: 85,
  },
}

describe('BusinessAuditPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    vi.resetAllMocks()
  })

  const renderWithProviders = (businessSlug: string = 'test-business') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/${businessSlug}`]}>
          <Routes>
            <Route path="/:businessSlug" element={<BusinessAuditPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('Happy Path', () => {
    beforeEach(() => {
      vi.mocked(fetchBusinessAudit).mockResolvedValue(mockAuditData)
    })

    it('shows loading skeleton initially', () => {
      renderWithProviders()
      
      // Check for loading skeleton elements
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    })

    it('calls API with correct business slug', async () => {
      renderWithProviders('test-business')

      await waitFor(() => {
        expect(fetchBusinessAudit).toHaveBeenCalledWith('test-business')
      })
    })

    it('displays all audit sections with correct data', async () => {
      renderWithProviders()

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })

      // Check business name
      expect(screen.getByRole('heading', { name: mockAuditData.name })).toBeInTheDocument()

      // Check overall score
      expect(screen.getByText(mockAuditData.score.toString())).toBeInTheDocument()

      // Check metrics
      expect(screen.getByText('SEO')).toBeInTheDocument()
      expect(screen.getByText(mockAuditData.metrics.seo.toString())).toBeInTheDocument()

      expect(screen.getByText('Performance')).toBeInTheDocument()
      expect(screen.getByText(mockAuditData.metrics.performance.toString())).toBeInTheDocument()

      expect(screen.getByText('Accessibility')).toBeInTheDocument()
      expect(screen.getByText(mockAuditData.metrics.accessibility.toString())).toBeInTheDocument()

      // Check last audit date
      const formattedDate = new Date(mockAuditData.lastAudit).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
      expect(screen.getByText(new RegExp(formattedDate))).toBeInTheDocument()
    })

    it('updates document title with business name', async () => {
      renderWithProviders()

      await waitFor(() => {
        expect(document.title).toBe(`${mockAuditData.name} Website Audit - Local Website Insights`)
      })
    })
  })

  describe('Error Handling', () => {
    describe('Non-existent Business', () => {
      beforeEach(() => {
        vi.mocked(fetchBusinessAudit).mockRejectedValue(new Error('Business not found'))
      })

      it('displays error message when business is not found', async () => {
        renderWithProviders('non-existent-business')

        await waitFor(() => {
          expect(screen.getByText('Business Not Found')).toBeInTheDocument()
          expect(screen.getByText(/Sorry, we couldn't find the business audit/)).toBeInTheDocument()
        })
      })

      it('maintains error state in document title', async () => {
        renderWithProviders('non-existent-business')

        // Title should not be updated with non-existent business name
        await waitFor(() => {
          expect(document.title).not.toContain('non-existent-business')
        })
      })
    })

    describe('Database Connection Errors', () => {
      beforeEach(() => {
        vi.mocked(fetchBusinessAudit).mockRejectedValue(new Error('Database connection failed'))
      })

      it('displays generic error message for database failures', async () => {
        renderWithProviders('test-business')

        await waitFor(() => {
          expect(screen.getByText('Business Not Found')).toBeInTheDocument()
          expect(screen.getByText(/Sorry, we couldn't find the business audit/)).toBeInTheDocument()
        })
      })
    })

    describe('Invalid Response Data', () => {
      it('handles missing metrics gracefully', async () => {
        const invalidData = {
          ...mockAuditData,
          metrics: undefined
        }
        vi.mocked(fetchBusinessAudit).mockResolvedValue(invalidData as any)

        renderWithProviders()

        await waitFor(() => {
          expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
        })

        // Should still show business name and overall score
        expect(screen.getByRole('heading', { name: invalidData.name })).toBeInTheDocument()
        expect(screen.getByText(invalidData.score.toString())).toBeInTheDocument()

        // Metrics section should handle undefined gracefully
        expect(screen.getByText('SEO')).toBeInTheDocument()
        expect(screen.getByText('Performance')).toBeInTheDocument()
        expect(screen.getByText('Accessibility')).toBeInTheDocument()
      })

      it('handles malformed date gracefully', async () => {
        const invalidData = {
          ...mockAuditData,
          lastAudit: 'invalid-date'
        }
        vi.mocked(fetchBusinessAudit).mockResolvedValue(invalidData)

        renderWithProviders()

        await waitFor(() => {
          expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
        })

        // Should still show other data
        expect(screen.getByRole('heading', { name: invalidData.name })).toBeInTheDocument()
        expect(screen.getByText(invalidData.score.toString())).toBeInTheDocument()

        // Date should be handled gracefully
        expect(screen.getByText(/Last audited/)).toBeInTheDocument()
      })
    })

    describe('Network Errors', () => {
      it('handles network timeout', async () => {
        vi.mocked(fetchBusinessAudit).mockRejectedValue(new Error('Network timeout'))

        renderWithProviders('test-business')

        await waitFor(() => {
          expect(screen.getByText('Business Not Found')).toBeInTheDocument()
          expect(screen.getByText(/Sorry, we couldn't find the business audit/)).toBeInTheDocument()
        })
      })

      it('handles offline status', async () => {
        vi.mocked(fetchBusinessAudit).mockRejectedValue(new Error('Failed to fetch'))

        renderWithProviders('test-business')

        await waitFor(() => {
          expect(screen.getByText('Business Not Found')).toBeInTheDocument()
          expect(screen.getByText(/Sorry, we couldn't find the business audit/)).toBeInTheDocument()
        })
      })
    })
  })
}) 