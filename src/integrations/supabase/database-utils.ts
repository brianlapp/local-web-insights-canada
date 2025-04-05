
import { Database } from './schema';
import { SupabaseClient } from '@supabase/supabase-js';

// Create a type-safe function for working with database tables
export function createTableQuery<T extends keyof Database['public']['Tables']>(
  client: SupabaseClient<Database>,
  table: T
) {
  return client.from(table);
}
