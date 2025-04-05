import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { supabase } from './client'
import { useAuth } from './auth'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { createMockAuthError } from '@/components/forms/test-utils/auth-mocks'

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

// Create mocks for Supabase types
const createMockUser = (): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {
    name: 'Test User',
  },
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00.000Z',
  role: '',
  identities: []
})

const createMockSession = (): Session => ({
  user: createMockUser(),
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  expires_at: new Date().getTime() + 3600 * 1000,
  token_type: 'bearer'
})

describe('Authentication', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Reset auth state between tests
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null })
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
  })

  describe('Sign In', () => {
    it('successfully signs in with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mockSession = createMockSession()
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      await result.current.signIn(credentials)

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(credentials)
      expect(result.current.user).toEqual(mockSession.user)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('handles sign in errors', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null, user: null },
        error: createMockAuthError('Invalid credentials', 400)
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

      const mockUser = createMockUser()
      const mockSession = createMockSession()

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
        error: createMockAuthError('Email already exists', 400)
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
      const mockSession = createMockSession()
      const authListener = vi.mocked(supabase.auth.onAuthStateChange).mock.calls[0][0]
      await authListener('SIGNED_IN', mockSession)

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).toEqual(mockSession.user)
      })
    })
  })
})
