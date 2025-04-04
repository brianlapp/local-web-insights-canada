import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { toast } from '@/components/ui/use-toast'
import PetitionForm from './PetitionForm'
import { supabase } from '@/integrations/supabase/client'

// Mock the toast component
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}))

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(),
    })),
  },
}))

describe('PetitionForm', () => {
  const mockProps = {
    businessId: 'test-business',
    businessName: 'Test Business',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Happy Path', () => {
    it('renders all form fields correctly', () => {
      render(<PetitionForm {...mockProps} />)

      // Check for required fields
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()

      // Check for optional fields
      expect(screen.getByLabelText(/local resident/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/why.*important/i)).toBeInTheDocument()

      // Check for submit button
      expect(screen.getByRole('button', { name: /sign petition/i })).toBeInTheDocument()
    })

    it('allows filling out the form', () => {
      render(<PetitionForm {...mockProps} />)

      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const localCheckbox = screen.getByLabelText(/local resident/i)
      const messageInput = screen.getByLabelText(/why.*important/i)

      // Fill out the form
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.click(localCheckbox)
      fireEvent.change(messageInput, { 
        target: { value: 'This business needs a better website!' }
      })

      // Check if values are set
      expect(nameInput).toHaveValue('John Doe')
      expect(emailInput).toHaveValue('john@example.com')
      expect(localCheckbox).toBeChecked()
      expect(messageInput).toHaveValue('This business needs a better website!')
    })

    it('successfully submits the form', async () => {
      // Mock successful insert
      const mockInsert = vi.fn().mockResolvedValue({ 
        data: { id: 'test-sig-1' }, 
        error: null 
      })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)

      render(<PetitionForm {...mockProps} />)

      // Fill out the form
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'John Doe' }
      })
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' }
      })
      fireEvent.click(screen.getByLabelText(/local resident/i))
      fireEvent.change(screen.getByLabelText(/why.*important/i), {
        target: { value: 'This business needs a better website!' }
      })

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /sign petition/i }))

      // Check if submission is handled correctly
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith({
          petition_id: mockProps.businessId,
          name: 'John Doe',
          email: 'john@example.com',
          is_local: true,
          message: 'This business needs a better website!',
        })
      })

      // Verify success toast
      expect(toast).toHaveBeenCalledWith({
        title: 'Petition submitted',
        description: expect.stringContaining(mockProps.businessName),
      })

      // Form should be reset
      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toHaveValue('')
        expect(screen.getByLabelText(/email/i)).toHaveValue('')
        expect(screen.getByLabelText(/local resident/i)).not.toBeChecked()
        expect(screen.getByLabelText(/why.*important/i)).toHaveValue('')
      })
    })

    it('shows loading state during submission', async () => {
      // Mock a delayed insert
      const mockInsert = vi.fn().mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => 
            resolve({ data: { id: 'test-sig-1' }, error: null }), 100
          )
        )
      )
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)

      render(<PetitionForm {...mockProps} />)

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'John Doe' }
      })
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' }
      })
      fireEvent.click(screen.getByRole('button', { name: /sign petition/i }))

      // Check loading state
      expect(screen.getByRole('button', { name: /submitting/i })).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()

      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign petition/i })).toBeInTheDocument()
        expect(screen.getByRole('button')).not.toBeDisabled()
      })
    })
  })

  describe('Error Paths', () => {
    describe('Form Validation', () => {
      it('shows validation errors for empty required fields', async () => {
        render(<PetitionForm {...mockProps} />)
        
        // Try to submit empty form
        fireEvent.click(screen.getByRole('button', { name: /sign petition/i }))

        // Check for HTML5 validation messages
        const nameInput = screen.getByLabelText(/name/i)
        const emailInput = screen.getByLabelText(/email/i)

        expect(nameInput).toBeInvalid()
        expect(emailInput).toBeInvalid()
        expect(nameInput).toHaveAttribute('aria-invalid', 'true')
        expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      })

      it('validates email format', async () => {
        render(<PetitionForm {...mockProps} />)

        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
        
        // Test invalid email formats
        const invalidEmails = [
          'notanemail',
          'missing@domain',
          '@nodomain.com',
          'spaces@ domain.com',
          'multiple@dots..com'
        ]

        for (const invalidEmail of invalidEmails) {
          fireEvent.change(emailInput, { target: { value: invalidEmail } })
          expect(emailInput.validity.valid).toBe(false)
        }

        // Test valid email
        fireEvent.change(emailInput, { target: { value: 'valid@email.com' } })
        expect(emailInput.validity.valid).toBe(true)
      })

      it('trims whitespace from inputs before submission', async () => {
        const mockInsert = vi.fn().mockResolvedValue({ data: { id: 'test-sig-1' }, error: null })
        vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

        render(<PetitionForm {...mockProps} />)

        // Fill form with whitespace
        fireEvent.change(screen.getByLabelText(/name/i), {
          target: { value: '  John Doe  ' }
        })
        fireEvent.change(screen.getByLabelText(/email/i), {
          target: { value: '  john@example.com  ' }
        })
        fireEvent.change(screen.getByLabelText(/why.*important/i), {
          target: { value: '  Important message  ' }
        })

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /sign petition/i }))

        // Check if whitespace was trimmed
        await waitFor(() => {
          expect(mockInsert).toHaveBeenCalledWith({
            petition_id: mockProps.businessId,
            name: 'John Doe',
            email: 'john@example.com',
            is_local: false,
            message: 'Important message',
          })
        })
      })
    })

    describe('Database Errors', () => {
      it('handles duplicate email error', async () => {
        const mockError = {
          message: 'Email already exists',
          code: '23505', // Postgres unique constraint violation
        }
        const mockInsert = vi.fn().mockResolvedValue({ data: null, error: mockError })
        vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

        render(<PetitionForm {...mockProps} />)

        // Fill and submit form
        fireEvent.change(screen.getByLabelText(/name/i), {
          target: { value: 'John Doe' }
        })
        fireEvent.change(screen.getByLabelText(/email/i), {
          target: { value: 'john@example.com' }
        })
        fireEvent.click(screen.getByRole('button', { name: /sign petition/i }))

        // Check error handling
        await waitFor(() => {
          expect(toast).toHaveBeenCalledWith({
            title: 'Error submitting petition',
            description: expect.stringContaining('already signed'),
            variant: 'destructive',
          })
        })

        // Form should retain values
        expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe')
        expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com')
      })

      it('handles database connection error', async () => {
        const mockError = {
          message: 'Database connection failed',
          code: '08006', // Postgres connection failure
        }
        const mockInsert = vi.fn().mockResolvedValue({ data: null, error: mockError })
        vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

        render(<PetitionForm {...mockProps} />)

        // Fill and submit form
        fireEvent.change(screen.getByLabelText(/name/i), {
          target: { value: 'John Doe' }
        })
        fireEvent.change(screen.getByLabelText(/email/i), {
          target: { value: 'john@example.com' }
        })
        fireEvent.click(screen.getByRole('button', { name: /sign petition/i }))

        // Check error handling
        await waitFor(() => {
          expect(toast).toHaveBeenCalledWith({
            title: 'Error submitting petition',
            description: 'Please try again later.',
            variant: 'destructive',
          })
        })

        // Form should retain values
        expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe')
        expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com')
      })

      it('handles rate limiting error', async () => {
        const mockError = {
          message: 'Too many requests',
          code: '429',
        }
        const mockInsert = vi.fn().mockResolvedValue({ data: null, error: mockError })
        vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

        render(<PetitionForm {...mockProps} />)

        // Fill and submit form
        fireEvent.change(screen.getByLabelText(/name/i), {
          target: { value: 'John Doe' }
        })
        fireEvent.change(screen.getByLabelText(/email/i), {
          target: { value: 'john@example.com' }
        })
        fireEvent.click(screen.getByRole('button', { name: /sign petition/i }))

        // Check error handling
        await waitFor(() => {
          expect(toast).toHaveBeenCalledWith({
            title: 'Error submitting petition',
            description: expect.stringContaining('too many requests'),
            variant: 'destructive',
          })
        })

        // Form should retain values
        expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe')
        expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com')
      })
    })
  })
}) 