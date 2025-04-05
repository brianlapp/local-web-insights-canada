import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import logger from './logger';

// Load environment variables
dotenv.config();

// Initialize Supabase client
let supabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase client (singleton pattern)
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or Key not provided');
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    logger.info('Supabase client initialized');
  }
  
  return supabaseClient;
};

/**
 * Reset Supabase client (useful for testing)
 */
export const resetSupabaseClient = (): void => {
  supabaseClient = null;
};

/**
 * Execute a transaction using Supabase
 * This is a simple implementation since Supabase doesn't support
 * native transactions through the JS client yet.
 */
export const transaction = async <T>(
  client: SupabaseClient,
  callback: (client: SupabaseClient) => Promise<T>
): Promise<T> => {
  try {
    // Execute the callback with the client
    return await callback(client);
  } catch (error) {
    logger.error('Transaction error:', error);
    throw error;
  }
};

/**
 * Get paginated results with filter and sorting support
 */
export const getPaginatedResults = async (
  tableName: string,
  options: {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    columns?: string;
  }
) => {
  const {
    page = 1,
    limit = 10,
    filters = {},
    sortBy = 'created_at',
    sortOrder = 'desc',
    columns = '*'
  } = options;
  
  const offset = (page - 1) * limit;
  const supabase = getSupabaseClient();
  
  // Start query
  let query = supabase
    .from(tableName)
    .select(columns, { count: 'exact' });
  
  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'string' && value.includes('%')) {
        // Use ilike for partial string matches
        query = query.ilike(key, value);
      } else if (Array.isArray(value)) {
        // Use in for arrays
        query = query.in(key, value);
      } else {
        // Use eq for exact matches
        query = query.eq(key, value);
      }
    }
  });
  
  // Apply pagination and sorting
  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1);
  
  if (error) {
    logger.error(`Error fetching ${tableName}:`, error);
    throw error;
  }
  
  return {
    data,
    count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  };
}; 