import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from '../logger';

// Initialize Supabase client for auth
let supabaseAuth: SupabaseClient | null = null;

/**
 * Get Supabase Auth client (singleton pattern)
 */
export const getSupabaseAuth = (): SupabaseClient => {
  if (!supabaseAuth) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or Key not provided');
    }
    
    supabaseAuth = createClient(supabaseUrl, supabaseKey);
    logger.info('Supabase Auth client initialized');
  }
  
  return supabaseAuth;
};

/**
 * Verify a JWT token using Supabase Auth
 */
export const verifyToken = async (token: string): Promise<any> => {
  try {
    const supabase = getSupabaseAuth();
    
    // Use Supabase to verify the token
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      logger.error('Error verifying token:', error);
      return null;
    }
    
    return data.user;
  } catch (error) {
    logger.error('Token verification error:', error);
    return null;
  }
};

/**
 * Get user role from Supabase
 */
export const getUserRole = async (userId: string): Promise<string> => {
  try {
    const supabase = getSupabaseAuth();
    
    // Query the users table for the role
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      logger.error('Error fetching user role:', error);
      return 'standard'; // Default role
    }
    
    return data?.role || 'standard';
  } catch (error) {
    logger.error('Error getting user role:', error);
    return 'standard';
  }
};

/**
 * Reset the Supabase Auth client (useful for testing)
 */
export const resetSupabaseAuth = (): void => {
  supabaseAuth = null;
  logger.debug('Supabase Auth client reset');
}; 