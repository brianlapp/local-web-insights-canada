import fs from 'fs';
import path from 'path';
import { getSupabaseClient } from './database';

/**
 * Run SQL migrations for analysis service
 */
async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // Get Supabase client
    const supabase = getSupabaseClient();
    
    // Read the SQL migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations.sql'),
      'utf8'
    );
    
    // Execute migrations
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });
    
    if (error) {
      console.error('Migration error:', error);
      process.exit(1);
    }
    
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Failed to run migrations:', error);
    process.exit(1);
  }
}

// Run migrations
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Uncaught error during migration:', error);
      process.exit(1);
    });
}

export default runMigrations; 