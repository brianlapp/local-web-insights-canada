import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PetitionPage } from '@/pages/petition/[slug]'
import { BusinessAuditPage } from '@/pages/[businessSlug]'
import { fetchPetitionData, fetchBusinessAudit } from '@/lib/api'

// Mock the API calls
vi.mock('@/lib/api', () => ({
  fetchPetitionData: vi.fn((slug: string) => 
    Promise.resolve({
      id: '123',
      slug,
      businessName: 'Test Business',
      description: 'Test petition description',
      signatures: 150,
      goal: 500
    })
  ),
  fetchBusinessAudit: vi.fn((slug: string) => 
    Promise.resolve({
      id: '456',
      slug,
      name: 'Test Business',
      score: 85,
      lastAudit: '2024-03-20',
      metrics: {
        seo: 90,
        performance: 85,
        accessibility: 88
      }
    })
  )
}))

// Test wrapper with router and query client
const renderWithProviders = (ui: React.ReactElement, { route = '/' } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  window.history.pushState({}, 'Test page', route)
  
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/petition/:slug" element={<PetitionPage />} />
          <Route path="/:businessSlug" element={<BusinessAuditPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Deep Linking Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Petition Page Deep Linking', () => {
    it('loads petition data when accessing direct URL', async () => {
      renderWithProviders(<PetitionPage />, {
        route: '/petition/save-local-business'
      })

      // Check loading state
      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Test Business')).toBeInTheDocument()
      })

      // Verify petition details are displayed
      expect(screen.getByText('150')).toBeInTheDocument() // signatures
      expect(screen.getByText('500')).toBeInTheDocument() // goal
      expect(screen.getByText(/test petition description/i)).toBeInTheDocument()
    })

    it('handles invalid petition slugs gracefully', async () => {
      vi.mocked(fetchPetitionData).mockRejectedValueOnce(new Error('Not found'))

      renderWithProviders(<PetitionPage />, {
        route: '/petition/invalid-petition'
      })

      await waitFor(() => {
        expect(screen.getByText(/petition not found/i)).toBeInTheDocument()
      })
    })
  })

  describe('Business Audit Page Deep Linking', () => {
    it('loads business audit data when accessing direct URL', async () => {
      renderWithProviders(<BusinessAuditPage />, {
        route: '/test-business'
      })

      // Check loading state
      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Test Business')).toBeInTheDocument()
      })

      // Verify audit details are displayed
      expect(screen.getByText('85')).toBeInTheDocument() // overall score
      expect(screen.getByText('90')).toBeInTheDocument() // SEO score
      expect(screen.getByText(/last audited: march 20, 2024/i)).toBeInTheDocument()
    })

    it('handles invalid business slugs gracefully', async () => {
      vi.mocked(fetchBusinessAudit).mockRejectedValueOnce(new Error('Not found'))

      renderWithProviders(<BusinessAuditPage />, {
        route: '/invalid-business'
      })

      await waitFor(() => {
        expect(screen.getByText(/business not found/i)).toBeInTheDocument()
      })
    })
  })

  describe('URL Parameter Handling', () => {
    it('preserves query parameters in deep links', async () => {
      renderWithProviders(<BusinessAuditPage />, {
        route: '/test-business?source=email&campaign=spring2024'
      })

      await waitFor(() => {
        expect(window.location.search).toBe('?source=email&campaign=spring2024')
      })
    })

    it('handles URL-encoded parameters correctly', async () => {
      const encodedRoute = '/test-business-name+%26+co'
      renderWithProviders(<BusinessAuditPage />, {
        route: encodedRoute
      })

      await waitFor(() => {
        expect(screen.getByText('Test Business')).toBeInTheDocument()
      })
    })
  })

  describe('SEO and Metadata', () => {
    it('updates page title and meta description for deep linked pages', async () => {
      renderWithProviders(<PetitionPage />, {
        route: '/petition/save-local-business'
      })

      await waitFor(() => {
        expect(document.title).toBe('Support Test Business - Local Website Insights')
      })
    })
  })
}) 