
import { Database } from './schema';
import { SupabaseClient } from '@supabase/supabase-js';

// Create a type-safe function for working with database tables
export function createTableQuery<T extends keyof Database['public']['Tables']>(
  client: SupabaseClient<Database>,
  table: T
) {
  return client.from(table);
}

// Helper function to type-check data before insertion
export function validateInsertData<T extends keyof Database['public']['Tables']>(
  table: T,
  data: Database['public']['Tables'][T]['Insert']
) {
  return data;
}

// Helper function to type-check data before update
export function validateUpdateData<T extends keyof Database['public']['Tables']>(
  table: T,
  data: Database['public']['Tables'][T]['Update']
) {
  return data;
}
