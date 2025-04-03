import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './AppRoutes'
import { createMemoryHistory } from 'history'

// Test wrapper component
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)
  return render(ui, { wrapper: MemoryRouter })
}

describe('AppRoutes', () => {
  // Test main navigation rendering
  describe('Navigation Structure', () => {
    beforeEach(() => {
      renderWithRouter(<AppRoutes />)
    })

    it('renders main navigation links', () => {
      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /audit/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /tools/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /signup/i })).toBeInTheDocument()
    })

    it('highlights active navigation item', () => {
      const homeLink = screen.getByRole('link', { name: /home/i })
      expect(homeLink).toHaveClass('text-primary')
    })
  })

  // Test route rendering
  describe('Route Rendering', () => {
    it('renders home page by default', () => {
      renderWithRouter(<AppRoutes />)
      expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument()
    })

    it('renders audit page on /audit route', () => {
      renderWithRouter(<AppRoutes />, { route: '/audit' })
      expect(screen.getByRole('heading', { name: /website audit/i })).toBeInTheDocument()
    })

    it('renders tools page on /tools route', () => {
      renderWithRouter(<AppRoutes />, { route: '/tools' })
      expect(screen.getByRole('heading', { name: /seo tools/i })).toBeInTheDocument()
    })

    it('renders signup page on /signup route', () => {
      renderWithRouter(<AppRoutes />, { route: '/signup' })
      expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument()
    })
  })

  // Test navigation behavior
  describe('Navigation Behavior', () => {
    it('navigates to audit page when clicking audit link', () => {
      renderWithRouter(<AppRoutes />)
      fireEvent.click(screen.getByRole('link', { name: /audit/i }))
      expect(screen.getByRole('heading', { name: /website audit/i })).toBeInTheDocument()
    })

    it('updates URL when navigating', () => {
      renderWithRouter(<AppRoutes />)
      fireEvent.click(screen.getByRole('link', { name: /tools/i }))
      expect(window.location.pathname).toBe('/tools')
    })

    it('preserves query parameters during navigation', () => {
      renderWithRouter(<AppRoutes />, { route: '/audit?site=example.com' })
      expect(window.location.search).toBe('?site=example.com')
    })
  })

  // Test error handling
  describe('Error Handling', () => {
    it('renders 404 page for unknown routes', () => {
      renderWithRouter(<AppRoutes />, { route: '/unknown-route' })
      expect(screen.getByRole('heading', { name: /404/i })).toBeInTheDocument()
    })

    it('provides navigation options on 404 page', () => {
      renderWithRouter(<AppRoutes />, { route: '/unknown-route' })
      expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument()
    })
  })

  // Test accessibility
  describe('Navigation Accessibility', () => {
    beforeEach(() => {
      renderWithRouter(<AppRoutes />)
    })

    it('has accessible navigation landmark', () => {
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('provides skip to main content link', () => {
      expect(screen.getByText(/skip to content/i)).toBeInTheDocument()
    })

    it('marks current page in navigation', () => {
      const currentLink = screen.getByRole('link', { name: /home/i })
      expect(currentLink).toHaveAttribute('aria-current', 'page')
    })
  })

  // Test layout persistence
  describe('Layout Persistence', () => {
    it('maintains header across route changes', () => {
      renderWithRouter(<AppRoutes />)
      const header = screen.getByRole('banner')
      fireEvent.click(screen.getByRole('link', { name: /tools/i }))
      expect(header).toBeInTheDocument()
    })

    it('maintains footer across route changes', () => {
      renderWithRouter(<AppRoutes />)
      const footer = screen.getByRole('contentinfo')
      fireEvent.click(screen.getByRole('link', { name: /audit/i }))
      expect(footer).toBeInTheDocument()
    })
  })
}) 