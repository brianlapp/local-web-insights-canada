
import type { StorageErrorMock } from './schema';

/**
 * Helper function to get error status from storage errors
 * Handles different error formats from Supabase storage
 */
export function getStorageErrorStatus(error: StorageErrorMock): number {
  // Try to get status from different potential properties
  if (typeof error.status === 'number') {
    return error.status;
  }
  
  if (typeof error.statusCode === 'number') {
    return error.statusCode; 
  }
  
  // Default to 500 if no status found
  return 500;
}
