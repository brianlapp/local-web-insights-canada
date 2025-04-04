import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupForm from './SignupForm'

describe('SignupForm Validation', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows validation errors for empty required fields', async () => {
    render(<SignupForm />)

    // Submit empty form
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    // Check for validation messages
    expect(screen.getByLabelText(/email/i)).toBeInvalid()
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('validates email format', async () => {
    render(<SignupForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const invalidEmails = [
      'notanemail',
      'missing@domain',
      '@nodomain.com',
      'spaces@ domain.com',
      'multiple@dots..com',
    ]

    for (const email of invalidEmails) {
      await user.clear(emailInput)
      await user.type(emailInput, email)
      await user.tab() // trigger validation

      expect(emailInput).toBeInvalid()
    }
  })

  it('validates phone number format in SMS mode', async () => {
    render(<SignupForm />)
    await user.click(screen.getByLabelText(/sms/i))

    const phoneInput = screen.getByLabelText(/phone number/i)
    const invalidPhones = [
      '123', // too short
      'abc123', // contains letters
      '12345678901234', // too long
      '123456789', // missing country code
      '+12', // too short with country code
    ]

    for (const phone of invalidPhones) {
      await user.clear(phoneInput)
      await user.type(phoneInput, phone)
      await user.tab()

      expect(phoneInput).toBeInvalid()
    }
  })
}) 