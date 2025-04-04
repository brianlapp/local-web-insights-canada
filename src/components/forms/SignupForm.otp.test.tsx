import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from '@/components/ui/use-toast'
import { supabase } from '@/integrations/supabase/client'
import SignupForm from './SignupForm'

// Mock toast
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}))

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
    },
  },
}))

describe('SignupForm OTP Verification', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('OTP Verification Errors', () => {
    it('handles invalid OTP code', async () => {
      // Mock successful OTP send
      vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      })

      // Mock invalid OTP verification
      vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          name: 'AuthApiError',
          message: 'Invalid OTP code',
          status: 400,
        },
      })

      render(<SignupForm />)
      await user.click(screen.getByLabelText(/sms/i))

      // Submit phone number
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      // Enter invalid OTP
      const otpInput = await screen.findByLabelText(/verification code/i)
      await user.type(otpInput, '000000')

      // Check error handling
      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'Error',
          description: expect.stringContaining('Invalid verification code'),
          variant: 'destructive',
        })
      })
    })

    it('handles expired OTP code', async () => {
      // Mock successful OTP send
      vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      })

      // Mock expired OTP verification
      vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          name: 'AuthApiError',
          message: 'Code has expired',
          status: 400,
        },
      })

      render(<SignupForm />)
      await user.click(screen.getByLabelText(/sms/i))

      // Submit phone number
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      // Enter expired OTP
      const otpInput = await screen.findByLabelText(/verification code/i)
      await user.type(otpInput, '123456')

      // Check error handling
      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'Error',
          description: expect.stringContaining('Invalid verification code'),
          variant: 'destructive',
        })
      })
    })

    it('handles rate limiting during OTP verification', async () => {
      // Mock successful OTP send
      vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      })

      // Mock rate limit error
      vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          name: 'AuthApiError',
          message: 'Too many verification attempts',
          status: 429,
        },
      })

      render(<SignupForm />)
      await user.click(screen.getByLabelText(/sms/i))

      // Submit phone number
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      // Enter OTP multiple times
      const otpInput = await screen.findByLabelText(/verification code/i)
      await user.type(otpInput, '123456')

      // Check error handling
      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'Error',
          description: expect.stringContaining('Too many verification attempts'),
          variant: 'destructive',
        })
      })
    })
  })
}) 