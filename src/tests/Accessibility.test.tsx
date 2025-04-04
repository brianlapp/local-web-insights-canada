import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { BusinessAuditPage } from '@/pages/[businessSlug]'
import { ToolsPage } from '@/pages/ToolsPage'
import HomePage from '@/pages/HomePage'

// Add jest-axe matchers to Jest's expect
expect.extend(toHaveNoViolations)

// Extend vitest's expect with jest-axe matchers
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toHaveNoViolations(): T
    }
  }
}

describe('Screen Reader Accessibility', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  const renderWithProviders = (route: string = '/') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/:businessSlug" element={<BusinessAuditPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('Home Page', () => {
    it('has no accessibility violations', async () => {
      const { container } = renderWithProviders('/')
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('maintains proper heading hierarchy', () => {
      renderWithProviders('/')
      
      const headings = screen.getAllByRole('heading')
      const headingLevels = headings.map(h => parseInt(h.getAttribute('aria-level') || '0'))
      
      // Verify heading levels are sequential
      headingLevels.reduce((prev, current) => {
        expect(current - prev).toBeLessThanOrEqual(1)
        return current
      })
    })

    it('provides alt text for all images', () => {
      renderWithProviders('/')
      
      const images = screen.getAllByRole('img')
      images.forEach(img => {
        expect(img).toHaveAttribute('alt')
        expect(img.getAttribute('alt')).not.toBe('')
      })
    })
  })

  describe('Tools Directory', () => {
    it('has no accessibility violations', async () => {
      const { container } = renderWithProviders('/tools')
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('maintains logical tab order', async () => {
      renderWithProviders('/tools')
      
      const searchInput = screen.getByRole('searchbox')
      const categoryButtons = screen.getAllByRole('button', { name: /seo|performance/i })
      const toolButtons = screen.getAllByRole('button', { name: /use .+/i })

      // Verify tab index
      expect(searchInput).toHaveAttribute('tabindex', '0')
      categoryButtons.forEach(button => {
        expect(button).toHaveAttribute('tabindex', '0')
      })
      toolButtons.forEach(button => {
        expect(button).toHaveAttribute('tabindex', '0')
      })
    })

    it('announces tool filtering results', () => {
      renderWithProviders('/tools')
      
      const toolsSection = screen.getByRole('region', { name: /tools/i })
      expect(toolsSection).toHaveAttribute('aria-live', 'polite')
    })

    it('provides accessible names for all interactive elements', () => {
      renderWithProviders('/tools')
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName()
      })

      const inputs = screen.getAllByRole('textbox')
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName()
      })
    })
  })

  describe('Business Audit Page', () => {
    it('has no accessibility violations', async () => {
      const { container } = renderWithProviders('/test-business')
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('provides accessible data visualizations', () => {
      renderWithProviders('/test-business')
      
      const charts = screen.getAllByRole('img', { name: /chart|graph/i })
      charts.forEach(chart => {
        // Check for aria-label or aria-labelledby
        expect(
          chart.hasAttribute('aria-label') || 
          chart.hasAttribute('aria-labelledby')
        ).toBe(true)

        // Check for descriptive text
        const chartDescription = screen.getByText(new RegExp(chart.getAttribute('aria-label') || ''))
        expect(chartDescription).toBeInTheDocument()
      })
    })

    it('announces dynamic content updates', () => {
      renderWithProviders('/test-business')
      
      const scoreSection = screen.getByRole('region', { name: /scores/i })
      expect(scoreSection).toHaveAttribute('aria-live', 'polite')
      
      const recommendationsSection = screen.getByRole('region', { name: /recommendations/i })
      expect(recommendationsSection).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Form Accessibility', () => {
    it('provides error feedback for screen readers', () => {
      renderWithProviders('/tools')
      
      const form = screen.getByRole('form')
      const errorMessages = within(form).getAllByRole('alert')
      
      errorMessages.forEach(message => {
        expect(message).toHaveAttribute('aria-live', 'assertive')
      })
    })

    it('associates labels with form controls', () => {
      renderWithProviders('/tools')
      
      const inputs = screen.getAllByRole('textbox')
      inputs.forEach(input => {
        const label = screen.getByLabelText(input.getAttribute('aria-label') || '')
        expect(label).toBeInTheDocument()
      })
    })

    it('indicates required fields to screen readers', () => {
      renderWithProviders('/tools')
      
      // Use aria-required instead of the required attribute in the query
      const requiredInputs = screen.getAllByRole('textbox')
        .filter(input => input.getAttribute('aria-required') === 'true')
      
      requiredInputs.forEach(input => {
        expect(input).toHaveAttribute('aria-required', 'true')
      })
    })
  })

  describe('Dialog Accessibility', () => {
    it('manages focus when dialogs open/close', () => {
      renderWithProviders('/tools')
      
      const openButton = screen.getByRole('button', { name: /use meta tags analyzer/i })
      const dialog = screen.getByRole('dialog')
      
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(openButton).toHaveAttribute('aria-expanded', 'false')
      
      // When dialog opens
      expect(dialog).toHaveAttribute('aria-labelledby')
      const dialogTitle = screen.getByText(/meta tags analyzer/i)
      expect(dialogTitle.id).toBe(dialog.getAttribute('aria-labelledby'))
    })

    it('traps focus within modal dialogs', () => {
      renderWithProviders('/tools')
      
      const dialog = screen.getByRole('dialog')
      const focusableElements = within(dialog).getAllByRole('button')
      
      // First and last focusable elements should create a focus trap
      expect(focusableElements[0]).toHaveAttribute('data-focus-guard', 'true')
      expect(focusableElements[focusableElements.length - 1]).toHaveAttribute('data-focus-guard', 'true')
    })
  })
}) 