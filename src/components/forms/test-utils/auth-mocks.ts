
import type { AuthError } from '@supabase/supabase-js';

// Create a proper mock for AuthError since we can't extend the actual class
export function createMockAuthError(message: string, status: number, code?: string): AuthError {
  return {
    name: 'AuthApiError',
    message,
    status,
    code: code || `${status}`,
  } as AuthError;
}
