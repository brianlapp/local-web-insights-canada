import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button Component', () => {
  // Test default state
  it('renders with default state correctly', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()
    expect(button).toHaveClass('inline-flex items-center justify-center')
  })

  // Test disabled state
  it('renders disabled state correctly', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })

  // Test accessibility attributes
  it('has proper accessibility attributes', () => {
    render(<Button aria-label="Submit form">Submit</Button>)
    const button = screen.getByRole('button', { name: /submit form/i })
    expect(button).toHaveAttribute('aria-label', 'Submit form')
  })

  // Test keyboard navigation
  it('can be focused via keyboard navigation', () => {
    render(<Button>Focusable Button</Button>)
    const button = screen.getByRole('button', { name: /focusable button/i })
    
    // Tab to the button
    fireEvent.keyDown(document.body, { key: 'Tab', shiftKey: false })
    expect(button).toHaveFocus()
  })

  // Test click handler
  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click Handler</Button>)
    
    const button = screen.getByRole('button', { name: /click handler/i })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  // Test variant styles
  it('applies correct variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button', { name: /delete/i })
    expect(button).toHaveClass('bg-destructive')
  })

  // Test size variants
  it('applies correct size styles', () => {
    render(<Button size="lg">Large Button</Button>)
    const button = screen.getByRole('button', { name: /large button/i })
    expect(button).toHaveClass('h-11')
  })
}) 