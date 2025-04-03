import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { NotFoundPage } from './NotFound'
import { HomePage } from './Home'

// Test wrapper with router
const renderWithRouter = (initialRoute: string = '/not-found') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('404 Page', () => {
  // Content tests
  describe('Content Display', () => {
    it('displays 404 error message', () => {
      renderWithRouter()
      expect(screen.getByRole('heading', { name: /404/i })).toBeInTheDocument()
    })

    it('shows helpful error description', () => {
      renderWithRouter()
      expect(screen.getByText(/page (not found|doesn't exist)/i)).toBeInTheDocument()
    })

    it('provides navigation options', () => {
      renderWithRouter()
      expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument()
    })
  })

  // Navigation tests
  describe('Navigation Behavior', () => {
    it('redirects to home page when clicking home link', () => {
      renderWithRouter()
      const homeLink = screen.getByRole('link', { name: /back to home/i })
      fireEvent.click(homeLink)
      expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument()
    })

    it('preserves navigation history when using browser back button', () => {
      renderWithRouter('/valid-page')
      const historySpy = vi.spyOn(window.history, 'back')
      fireEvent.click(screen.getByRole('button', { name: /go back/i }))
      expect(historySpy).toHaveBeenCalled()
    })
  })

  // Route handling tests
  describe('Route Handling', () => {
    it('catches non-existent static routes', () => {
      renderWithRouter('/this-route-does-not-exist')
      expect(screen.getByRole('heading', { name: /404/i })).toBeInTheDocument()
    })

    it('catches invalid dynamic routes', () => {
      renderWithRouter('/petition/non-existent-petition')
      expect(screen.getByRole('heading', { name: /404/i })).toBeInTheDocument()
    })

    it('catches malformed URLs', () => {
      renderWithRouter('//@invalid-url-format')
      expect(screen.getByRole('heading', { name: /404/i })).toBeInTheDocument()
    })
  })

  // SEO tests
  describe('SEO and Metadata', () => {
    it('sets appropriate page title', () => {
      renderWithRouter()
      expect(document.title).toBe('Page Not Found - Local Website Insights')
    })

    it('includes canonical URL in metadata', () => {
      renderWithRouter()
      const canonical = document.querySelector('link[rel="canonical"]')
      expect(canonical).toHaveAttribute('href', 'https://localwebsiteinsights.ca/404')
    })
  })

  // Accessibility tests
  describe('Accessibility', () => {
    it('maintains focus management', () => {
      renderWithRouter()
      const homeLink = screen.getByRole('link', { name: /back to home/i })
      expect(homeLink).toHaveFocus()
    })

    it('provides clear error announcement for screen readers', () => {
      renderWithRouter()
      const errorRegion = screen.getByRole('alert')
      expect(errorRegion).toHaveAttribute('aria-live', 'polite')
    })

    it('maintains keyboard navigation', () => {
      renderWithRouter()
      const homeLink = screen.getByRole('link', { name: /back to home/i })
      const backButton = screen.getByRole('button', { name: /go back/i })
      
      homeLink.focus()
      fireEvent.keyDown(homeLink, { key: 'Tab' })
      expect(backButton).toHaveFocus()
    })
  })

  // Browser history tests
  describe('Browser History Integration', () => {
    it('updates browser history when navigating away', () => {
      renderWithRouter()
      const homeLink = screen.getByRole('link', { name: /back to home/i })
      fireEvent.click(homeLink)
      expect(window.location.pathname).toBe('/')
    })

    it('preserves query parameters when redirecting', () => {
      renderWithRouter('/non-existent?source=email')
      const homeLink = screen.getByRole('link', { name: /back to home/i })
      fireEvent.click(homeLink)
      expect(window.location.search).toBe('?source=email')
    })
  })
}) 