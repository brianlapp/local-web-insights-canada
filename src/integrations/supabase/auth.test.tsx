import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { supabase } from './client'
import { useAuth } from './auth'

// Mock the Supabase client
vi.mock('./client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))

describe('Authentication', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      name: 'Test User',
    },
  }

  const mockSession = {
    user: mockUser,
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
  }

  beforeEach(() => {
    vi.resetAllMocks()
    // Reset auth state between tests
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null })
  })

  describe('Sign In', () => {
    it('successfully signs in with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      await result.current.signIn(credentials)

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(credentials)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('handles sign in errors', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null },
        error: new Error('Invalid credentials'),
      })

      const { result } = renderHook(() => useAuth())

      await expect(result.current.signIn(credentials)).rejects.toThrow('Invalid credentials')
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Sign Up', () => {
    it('successfully creates a new account', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'password123',
        metadata: {
          name: 'New User',
        },
      }

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      await result.current.signUp(newUser)

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: newUser.metadata,
        },
      })
    })

    it('handles sign up errors', async () => {
      const newUser = {
        email: 'existing@example.com',
        password: 'password123',
      }

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: new Error('Email already exists'),
      })

      const { result } = renderHook(() => useAuth())

      await expect(result.current.signUp(newUser)).rejects.toThrow('Email already exists')
    })
  })

  describe('Sign Out', () => {
    it('successfully signs out the user', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuth())

      await result.current.signOut()

      expect(supabase.auth.signOut).toHaveBeenCalled()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Auth State Changes', () => {
    it('updates auth state when session changes', async () => {
      const { result } = renderHook(() => useAuth())

      // Simulate initial unauthenticated state
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()

      // Simulate auth state change
      const authListener = vi.mocked(supabase.auth.onAuthStateChange).mock.calls[0][0]
      await authListener('SIGNED_IN', { session: mockSession })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).toEqual(mockUser)
      })
    })
  })
}) 