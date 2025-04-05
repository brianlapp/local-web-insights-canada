
import { Database } from './schema';
import { PostgrestQueryBuilder } from '@supabase/supabase-js';

// Create a type-safe function for working with database tables
export function createTableQuery<T extends keyof Database['public']['Tables']>(
  queryBuilder: PostgrestQueryBuilder<any, any, any>,
  table: T
): PostgrestQueryBuilder<Database, Database['public']['Tables'][T]['Row'], any> {
  return queryBuilder.from(table as string) as any;
}
