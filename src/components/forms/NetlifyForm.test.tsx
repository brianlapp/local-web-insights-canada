import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NetlifyForm } from './NetlifyForm'

// Test utilities for common validation scenarios
const fillFormFields = async (user: ReturnType<typeof userEvent.setup>, fields: Record<string, string>) => {
  for (const [name, value] of Object.entries(fields)) {
    const input = screen.getByRole('textbox', { name: new RegExp(name, 'i') })
    await user.type(input, value)
  }
}

describe('NetlifyForm Component', () => {
  // Setup user event for each test
  const user = userEvent.setup()

  // Test form rendering
  it('renders all form fields with proper labels and attributes', () => {
    render(<NetlifyForm />)
    
    // Check for required form fields
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    
    // Verify Netlify attributes
    const form = screen.getByRole('form')
    expect(form).toHaveAttribute('data-netlify', 'true')
    expect(form).toHaveAttribute('name', 'contact')
  })

  // Test email validation
  it('validates email format correctly', async () => {
    render(<NetlifyForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    
    // Test invalid email
    await user.type(emailInput, 'invalid-email')
    await user.tab() // Trigger blur event
    
    expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument()
    
    // Test valid email
    await user.clear(emailInput)
    await user.type(emailInput, 'test@example.com')
    await user.tab()
    
    expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument()
  })

  // Test required field validation
  it('shows validation messages for required fields', async () => {
    render(<NetlifyForm />)
    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    
    // Try submitting empty form
    await user.click(submitButton)
    
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/message is required/i)).toBeInTheDocument()
  })

  // Test successful form submission
  it('submits form data to Netlify when validation passes', async () => {
    const mockSubmit = vi.fn()
    render(<NetlifyForm onSubmit={mockSubmit} />)
    
    // Fill in valid form data
    await fillFormFields(user, {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message'
    })
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)
    
    // Verify form submission
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message'
      })
    })
    
    // Verify success message
    expect(await screen.findByText(/thank you for your message/i)).toBeInTheDocument()
  })

  // Test form reset after submission
  it('resets form after successful submission', async () => {
    render(<NetlifyForm />)
    
    // Fill and submit form
    await fillFormFields(user, {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message'
    })
    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)
    
    // Wait for success message
    await screen.findByText(/thank you for your message/i)
    
    // Verify form reset
    expect(screen.getByLabelText(/name/i)).toHaveValue('')
    expect(screen.getByLabelText(/email/i)).toHaveValue('')
    expect(screen.getByLabelText(/message/i)).toHaveValue('')
  })

  // Test loading state during submission
  it('shows loading state during form submission', async () => {
    render(<NetlifyForm />)
    
    // Fill form
    await fillFormFields(user, {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message'
    })
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)
    
    // Verify loading state
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/sending/i)).toBeInTheDocument()
    
    // Wait for submission to complete
    await screen.findByText(/thank you for your message/i)
  })
}) 