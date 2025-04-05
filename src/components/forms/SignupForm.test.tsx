import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from '@/components/ui/use-toast'
import { supabase } from '@/integrations/supabase/client'
import SignupForm from './SignupForm'
import { createMockAuthError } from './test-utils/auth-mocks'

// Mock toast
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}))

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(),
    })),
    auth: {
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
    },
  },
}))

describe('SignupForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('renders email signup form by default', () => {
      render(<SignupForm />)

      // Check for required fields
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()

      // Check for preference toggles
      expect(screen.getByLabelText(/newsletter/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/updates/i)).toBeInTheDocument()
    })

    it('shows SMS form when SMS option is selected', async () => {
      render(<SignupForm />)

      // Click SMS option
      await user.click(screen.getByLabelText(/sms/i))

      // Check for phone number field
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
      expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
    })
  })

  describe('Email Signup', () => {
    it('successfully submits email signup form', async () => {
      const mockSignInWithOtp = vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null,
      })
      vi.mocked(supabase.auth.signInWithOtp).mockImplementation(mockSignInWithOtp)

      render(<SignupForm />)

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.click(screen.getByLabelText(/newsletter/i))

      // Submit form
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      // Verify OTP email sent
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'john@example.com',
        options: {
          data: {
            name: 'John Doe',
            preferences: {
              newsletter: true,
              updates: false,
            },
          },
        },
      })

      // Check success message
      expect(toast).toHaveBeenCalledWith({
        title: 'Verification email sent',
        description: expect.stringContaining('john@example.com'),
      })

      // Form should be in confirmation state
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
      expect(screen.getByText(/john@example.com/i)).toBeInTheDocument()
    })

    it('shows loading state during email submission', async () => {
      const mockSignInWithOtp = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )
      vi.mocked(supabase.auth.signInWithOtp).mockImplementation(mockSignInWithOtp)

      render(<SignupForm />)

      // Fill and submit form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      // Check loading state
      expect(screen.getByRole('button')).toBeDisabled()
      expect(screen.getByText(/sending/i)).toBeInTheDocument()
    })
  })

  describe('SMS Signup', () => {
    it('successfully submits SMS signup form', async () => {
      const mockSignInWithOtp = vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null,
      })
      vi.mocked(supabase.auth.signInWithOtp).mockImplementation(mockSignInWithOtp)

      render(<SignupForm />)

      // Switch to SMS
      await user.click(screen.getByLabelText(/sms/i))

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890')
      await user.click(screen.getByLabelText(/updates/i))

      // Submit form
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      // Verify OTP SMS sent
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        phone: '+1234567890',
        options: {
          data: {
            name: 'John Doe',
            preferences: {
              newsletter: false,
              updates: true,
            },
          },
        },
      })

      // Check success message
      expect(toast).toHaveBeenCalledWith({
        title: 'Verification code sent',
        description: expect.stringContaining('+1234567890'),
      })

      // Form should show OTP input
      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument()
    })

    it('shows loading state during SMS submission', async () => {
      const mockSignInWithOtp = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )
      vi.mocked(supabase.auth.signInWithOtp).mockImplementation(mockSignInWithOtp)

      render(<SignupForm />)

      // Switch to SMS
      await user.click(screen.getByLabelText(/sms/i))

      // Fill and submit form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      // Check loading state
      expect(screen.getByRole('button')).toBeDisabled()
      expect(screen.getByText(/sending/i)).toBeInTheDocument()
    })

    it('validates phone number format', async () => {
      render(<SignupForm />)

      // Switch to SMS
      await user.click(screen.getByLabelText(/sms/i))

      // Test invalid phone numbers
      const phoneInput = screen.getByLabelText(/phone number/i)
      const invalidPhones = [
        '123', // too short
        'abc123', // contains letters
        '12345678901234', // too long
      ]

      for (const phone of invalidPhones) {
        await user.clear(phoneInput)
        await user.type(phoneInput, phone)
        await user.tab() // trigger validation

        expect(phoneInput).toBeInvalid()
      }

      // Test valid phone number
      await user.clear(phoneInput)
      await user.type(phoneInput, '+1234567890')
      await user.tab()

      expect(phoneInput).toBeValid()
    })

    it('handles OTP verification successfully', async () => {
      const mockVerifyOtp = vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user' }, session: {} },
        error: null,
      })
      vi.mocked(supabase.auth.verifyOtp).mockImplementation(mockVerifyOtp)

      render(<SignupForm />)

      // Switch to SMS and submit
      await user.click(screen.getByLabelText(/sms/i))
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      // Enter OTP
      const otpInput = screen.getByLabelText(/verification code/i)
      await user.type(otpInput, '123456')

      // Verify OTP submission
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        phone: '+1234567890',
        token: '123456',
        type: 'sms'
      })

      // Check success message
      expect(toast).toHaveBeenCalledWith({
        title: 'Verification successful',
        description: 'You are now signed up!',
      })
    })
  })

  describe('Error Paths', () => {
    describe('Form Validation', () => {
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

    describe('API Errors', () => {
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
            error: createMockAuthError('Invalid OTP code', 400),
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
            error: createMockAuthError('Code has expired', 400),
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
      })
    })
  })
})
