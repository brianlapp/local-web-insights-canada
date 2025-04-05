#!/usr/bin/env node

/**
 * This script checks if all required tables exist in the Supabase database.
 * If tables are missing, it provides instructions for creating them.
 * Run with: node scripts/check_tables.js
 */

// Load environment variables
require('dotenv').config();

// Check if required environment variables are set
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY'];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease set these variables in your .env file and try again.');
  process.exit(1);
}

// Import Supabase client
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the tables required by the API service
const requiredTables = [
  'users',
  'businesses',
  'business_insights',
  'business_metrics',
  'website_audits',
  'website_screenshots',
  'analyses',
  'analysis_businesses',
  'analysis_queue',
  'analysis_results',
  'analysis_metadata',
  'webhooks',
  'webhook_logs',
  'external_webhooks',
  'api_keys'
];

// Check if tables exist and create them if missing
async function checkAndFixTables() {
  console.log('🔍 Checking database tables...');
  
  // Get a list of all tables in the database
  const { data: tables, error } = await supabase
    .from('_postgrest_test')
    .select('*')
    .limit(1)
    .throwOnError();
  
  if (error) {
    console.error('❌ Failed to connect to Supabase:');
    console.error(error);
    process.exit(1);
  }
  
  // Check each required table
  const missingTables = [];
  const tableResults = {};
  
  for (const tableName of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);
      
      const exists = !error || !error.message.includes(`relation "${tableName}" does not exist`);
      tableResults[tableName] = exists;
      
      if (!exists) {
        missingTables.push(tableName);
      }
    } catch (error) {
      tableResults[tableName] = false;
      missingTables.push(tableName);
    }
  }
  
  // Display results
  console.log('\n📊 Table status:');
  for (const [table, exists] of Object.entries(tableResults)) {
    console.log(`${exists ? '✅' : '❌'} ${table}`);
  }
  
  // Provide migration instructions if tables are missing
  if (missingTables.length > 0) {
    console.log('\n⚠️ Some required tables are missing. You need to run the migration scripts:');
    console.log('\n1. Go to your Supabase dashboard: https://app.supabase.io');
    console.log('2. Open the SQL Editor for your project');
    console.log('3. Run the SQL files from the migrations directory:');
    console.log('   - First run: 01_create_tables.sql');
    console.log('   - Then run: 02_create_admin_user.sql');
    console.log('\nOr run them through the Supabase CLI if you have it set up.');
  } else {
    console.log('\n✅ All required tables exist in the database!');
  }
}

// Run the table check
checkAndFixTables(); 