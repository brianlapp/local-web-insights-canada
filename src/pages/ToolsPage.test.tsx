import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToolsPage } from '@/pages/ToolsPage'
import { toast } from '@/components/ui/use-toast'

// Mock toast
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}))

// Mock tools data
const mockTools = [
  {
    id: '1',
    name: 'Meta Tags Analyzer',
    description: 'Analyze and optimize your meta tags for better SEO',
    category: 'SEO',
    difficulty: 'Beginner',
    icon: '/icons/meta-tags.svg',
  },
  {
    id: '2',
    name: 'Image Optimizer',
    description: 'Optimize images for better performance and SEO',
    category: 'Performance',
    difficulty: 'Intermediate',
    icon: '/icons/image-opt.svg',
  },
  {
    id: '3',
    name: 'Schema Generator',
    description: 'Generate structured data for rich search results',
    category: 'SEO',
    difficulty: 'Advanced',
    icon: '/icons/schema.svg',
  },
]

// Mock the tools data module
vi.mock('@/data/tools', () => ({
  tools: mockTools,
}))

// Mock fetch for tool analysis
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ToolsPage', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Tool Listing', () => {
    it('displays a categorized list of SEO tools', () => {
      render(<ToolsPage />)

      // Check for tool categories
      expect(screen.getByRole('heading', { name: /seo/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /performance/i })).toBeInTheDocument()

      // Check that each tool is displayed with required information
      mockTools.forEach(tool => {
        const toolCard = screen.getByRole('article', { name: tool.name })
        
        // Check for required elements
        expect(within(toolCard).getByText(tool.name)).toBeInTheDocument()
        expect(within(toolCard).getByText(tool.description)).toBeInTheDocument()
        expect(within(toolCard).getByRole('img', { name: `${tool.name} icon` })).toBeInTheDocument()
        expect(within(toolCard).getByText(tool.difficulty)).toBeInTheDocument()
      })
    })

    it('allows filtering tools by category', async () => {
      render(<ToolsPage />)

      // Click SEO category filter
      await user.click(screen.getByRole('button', { name: /seo/i }))

      // Should only show SEO tools
      const seoTools = mockTools.filter(tool => tool.category === 'SEO')
      const performanceTools = mockTools.filter(tool => tool.category === 'Performance')

      seoTools.forEach(tool => {
        expect(screen.getByRole('article', { name: tool.name })).toBeInTheDocument()
      })

      performanceTools.forEach(tool => {
        expect(screen.queryByRole('article', { name: tool.name })).not.toBeInTheDocument()
      })
    })

    it('allows searching for tools', async () => {
      render(<ToolsPage />)

      // Type in search box
      const searchInput = screen.getByRole('searchbox', { name: /search tools/i })
      await user.type(searchInput, 'meta')

      // Should only show tools matching search
      expect(screen.getByRole('article', { name: /meta tags analyzer/i })).toBeInTheDocument()
      expect(screen.queryByRole('article', { name: /image optimizer/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('article', { name: /schema generator/i })).not.toBeInTheDocument()
    })
  })

  describe('Tool Interaction', () => {
    it('opens tool interface when clicking on a client-side tool', async () => {
      render(<ToolsPage />)

      // Click on Meta Tags Analyzer
      await user.click(screen.getByRole('button', { name: /use meta tags analyzer/i }))

      // Tool interface should be visible
      expect(screen.getByRole('dialog', { name: /meta tags analyzer/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /url/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument()
    })

    it('displays results within the tool interface', async () => {
      render(<ToolsPage />)

      // Open Meta Tags Analyzer
      await user.click(screen.getByRole('button', { name: /use meta tags analyzer/i }))

      // Enter URL and analyze
      await user.type(screen.getByRole('textbox', { name: /url/i }), 'https://example.com')
      await user.click(screen.getByRole('button', { name: /analyze/i }))

      // Results should be displayed
      expect(screen.getByRole('region', { name: /analysis results/i })).toBeInTheDocument()
    })
  })

  describe('Error Paths', () => {
    describe('Resource Loading', () => {
      it('shows error message when tool icon fails to load', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        
        render(<ToolsPage />)
        
        // Simulate image load error
        const toolIcon = screen.getAllByRole('img')[0]
        fireEvent.error(toolIcon)

        expect(screen.getByText(/failed to load tool icon/i)).toBeInTheDocument()
        expect(screen.getByRole('img', { name: /fallback icon/i })).toBeInTheDocument()
        
        consoleSpy.mockRestore()
      })
    })

    describe('Tool Analysis Errors', () => {
      it('handles invalid URL input', async () => {
        render(<ToolsPage />)

        // Open Meta Tags Analyzer
        await user.click(screen.getByRole('button', { name: /use meta tags analyzer/i }))

        // Enter invalid URL
        await user.type(screen.getByRole('textbox', { name: /url/i }), 'not-a-valid-url')
        await user.click(screen.getByRole('button', { name: /analyze/i }))

        // Should show validation error
        expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument()
      })

      it('handles network errors during analysis', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))
        
        render(<ToolsPage />)

        // Open Meta Tags Analyzer
        await user.click(screen.getByRole('button', { name: /use meta tags analyzer/i }))

        // Enter URL and analyze
        await user.type(screen.getByRole('textbox', { name: /url/i }), 'https://example.com')
        await user.click(screen.getByRole('button', { name: /analyze/i }))

        // Should show error message and retry button
        await waitFor(() => {
          expect(toast).toHaveBeenCalledWith({
            title: 'Error',
            description: expect.stringContaining('network error'),
            variant: 'destructive',
          })
        })
        
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      })

      it('handles rate limiting errors', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ error: 'Too many requests' })
        })
        
        render(<ToolsPage />)

        // Open Meta Tags Analyzer
        await user.click(screen.getByRole('button', { name: /use meta tags analyzer/i }))

        // Enter URL and analyze
        await user.type(screen.getByRole('textbox', { name: /url/i }), 'https://example.com')
        await user.click(screen.getByRole('button', { name: /analyze/i }))

        // Should show rate limit message with wait time
        await waitFor(() => {
          expect(toast).toHaveBeenCalledWith({
            title: 'Rate Limited',
            description: expect.stringContaining('try again'),
            variant: 'destructive',
          })
        })
      })

      it('allows retrying analysis after error', async () => {
        // First attempt fails
        mockFetch.mockRejectedValueOnce(new Error('Network error'))
        // Second attempt succeeds
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
        
        render(<ToolsPage />)

        // Open Meta Tags Analyzer
        await user.click(screen.getByRole('button', { name: /use meta tags analyzer/i }))

        // First attempt
        await user.type(screen.getByRole('textbox', { name: /url/i }), 'https://example.com')
        await user.click(screen.getByRole('button', { name: /analyze/i }))

        // Wait for error and retry button
        const retryButton = await screen.findByRole('button', { name: /retry/i })
        
        // Click retry
        await user.click(retryButton)

        // Should show success state
        await waitFor(() => {
          expect(screen.getByRole('region', { name: /analysis results/i })).toBeInTheDocument()
        })
      })
    })

    describe('Accessibility During Errors', () => {
      it('maintains focus management after error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))
        
        render(<ToolsPage />)

        // Open Meta Tags Analyzer
        await user.click(screen.getByRole('button', { name: /use meta tags analyzer/i }))

        // Enter URL and analyze
        const urlInput = screen.getByRole('textbox', { name: /url/i })
        await user.type(urlInput, 'https://example.com')
        await user.click(screen.getByRole('button', { name: /analyze/i }))

        // Focus should return to input after error
        await waitFor(() => {
          expect(urlInput).toHaveFocus()
        })
      })

      it('announces errors to screen readers', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))
        
        render(<ToolsPage />)

        // Open Meta Tags Analyzer
        await user.click(screen.getByRole('button', { name: /use meta tags analyzer/i }))

        // Enter URL and analyze
        await user.type(screen.getByRole('textbox', { name: /url/i }), 'https://example.com')
        await user.click(screen.getByRole('button', { name: /analyze/i }))

        // Error message should be announced
        const errorMessage = await screen.findByRole('alert')
        expect(errorMessage).toHaveAttribute('aria-live', 'assertive')
      })
    })
  })
}) 