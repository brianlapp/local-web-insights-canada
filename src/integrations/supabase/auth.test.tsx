
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './auth';
import { supabase } from './client';
import type { User, Session, Subscription } from '@supabase/supabase-js';

// Mock Supabase client
vi.mock('./client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

// Create a minimal mock User that satisfies type requirements
const createMockUser = (overrides = {}): User => ({
  id: 'test-user',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  ...overrides
});

// Create a mock Subscription that satisfies type requirements
const createMockSubscription = (): Subscription => ({
  id: 'mock-subscription-id',
  callback: () => {},
  unsubscribe: vi.fn()
});

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock default session state
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    // Mock auth state change subscription
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { 
        subscription: createMockSubscription()
      },
    });
  });

  it('initializes with no user when no session exists', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('initializes with a user when a session exists', async () => {
    const mockUser = createMockUser();
    const mockSession = { user: mockUser } as Session;
    
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('handles sign in successfully', async () => {
    const mockUser = createMockUser();
    const mockSession = { user: mockUser } as Session;
    
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session: mockSession, user: mockUser },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn({ email: 'test@example.com', password: 'password' });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('handles sign up successfully', async () => {
    const mockUser = createMockUser();
    const mockSession = { user: mockUser } as Session;
    
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    const signUpData = {
      email: 'test@example.com',
      password: 'password',
      metadata: { name: 'Test User' },
    };

    await act(async () => {
      await result.current.signUp(signUpData);
    });
    
    // Just verify the function was called correctly
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: signUpData.email,
      password: signUpData.password,
      options: { data: signUpData.metadata },
    });
  });

  it('handles sign out successfully', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('updates auth state on auth state change event', async () => {
    const mockUser = createMockUser();
    const mockSession = { user: mockUser } as Session;
    
    // Setup direct callback invocation for auth state change
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      callback('SIGNED_IN', mockSession);
      return { data: { subscription: createMockSubscription() } };
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
    
    expect(result.current.isAuthenticated).toBe(true);
  });
});
