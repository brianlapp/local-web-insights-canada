import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './auth';
import { supabase } from './client';

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
        subscription: { 
          unsubscribe: vi.fn(),
          id: 'test-id',
          callback: vi.fn()
        } 
      },
    });
  });

  it('initializes with no user when no session exists', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuth());

    await waitForNextUpdate();

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('initializes with a user when a session exists', async () => {
    const mockUser = { id: 'test-user', email: 'test@example.com' };
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuth());

    await waitForNextUpdate();

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles sign in successfully', async () => {
    const mockUser = { id: 'test-user', email: 'test@example.com' };
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session: { user: mockUser } as any, user: mockUser },
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
    const mockUser = { id: 'test-user', email: 'test@example.com' };
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: mockUser, session: { user: mockUser } as any },
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
  });

  it('handles sign out successfully', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ data: {}, error: null });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('updates auth state on auth state change event', async () => {
    const mockUser = { id: 'test-user', email: 'test@example.com' };
    const mockOnAuthStateChange = vi.fn((callback) => {
      // Simulate auth state change event
      callback('SIGNED_IN', { user: mockUser } as any);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(mockOnAuthStateChange);

    const { result, waitForNextUpdate } = renderHook(() => useAuth());

    await waitForNextUpdate();

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
