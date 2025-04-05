
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotFound from './NotFound'

describe('NotFound Page', () => {
  it('renders the 404 error page', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
    expect(screen.getByText(/404/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /go back home/i })).toBeInTheDocument()
  })

  it('provides a way to navigate home', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )
    
    const homeLink = screen.getByRole('link', { name: /go back home/i })
    expect(homeLink).toHaveAttribute('href', '/')
  })
})
