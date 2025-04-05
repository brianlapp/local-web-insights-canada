import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from '@/components/ui/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { AuthError } from '@supabase/supabase-js'
import SignupForm from './SignupForm'
import { createMockAuthError } from './test-utils/auth-mocks'

// Mock toast
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}))

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOtp: vi.fn(),
    },
  },
}))

describe('SignupForm API Errors', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles email already registered error', async () => {
    vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({
      data: { user: null, session: null },
      error: createMockAuthError('Email already registered', 400, 'email_taken'),
    })

    render(<SignupForm />)

    // Fill and submit form
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    // Check error handling
    expect(toast).toHaveBeenCalledWith({
      title: 'Error',
      description: expect.stringContaining('already registered'),
      variant: 'destructive',
    })

    // Form should retain values
    expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe')
    expect(screen.getByLabelText(/email/i)).toHaveValue('existing@example.com')
  })

  it('handles phone number already registered error', async () => {
    vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({
      data: { user: null, session: null },
      error: createMockAuthError('Phone number already registered', 400, 'phone_taken'),
    })

    render(<SignupForm />)
    await user.click(screen.getByLabelText(/sms/i))

    // Fill and submit form
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/phone number/i), '+1234567890')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    // Check error handling
    expect(toast).toHaveBeenCalledWith({
      title: 'Error',
      description: expect.stringContaining('already registered'),
      variant: 'destructive',
    })

    // Form should retain values
    expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe')
    expect(screen.getByLabelText(/phone number/i)).toHaveValue('+1234567890')
  })

  it('handles rate limiting error', async () => {
    vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({
      data: { user: null, session: null },
      error: createMockAuthError('Too many requests', 429, 'rate_limit_exceeded'),
    })

    render(<SignupForm />)

    // Fill and submit form
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    // Check error handling
    expect(toast).toHaveBeenCalledWith({
      title: 'Error',
      description: expect.stringContaining('too many requests'),
      variant: 'destructive',
    })
  })

  it('handles network error', async () => {
    vi.mocked(supabase.auth.signInWithOtp).mockRejectedValue(new Error('Network error'))

    render(<SignupForm />)

    // Fill and submit form
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    // Check error handling
    expect(toast).toHaveBeenCalledWith({
      title: 'Error',
      description: expect.stringContaining('try again'),
      variant: 'destructive',
    })
  })
})
