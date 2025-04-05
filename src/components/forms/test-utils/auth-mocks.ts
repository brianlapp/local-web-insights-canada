
import type { AuthError } from '@supabase/supabase-js';

// Create a proper mock for AuthError since we can't extend the actual class
export function createMockAuthError(message: string, status: number, code?: string): AuthError {
  return {
    name: 'AuthApiError',
    message,
    status,
    // Make sure the code is either provided or defaults to status as string
    code: code || `${status}`,
  } as AuthError;
}

// Mock for the Subscription type
export function createMockSubscription() {
  return {
    id: 'mock-subscription-id',
    callback: () => {},
    unsubscribe: jest.fn()
  };
}
