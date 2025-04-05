#!/usr/bin/env node

/**
 * This script tests the connection to Supabase.
 * Run with: node scripts/test_supabase_connection.js
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

// Test connection by fetching a simple ping
async function testConnection() {
  console.log('🔄 Testing connection to Supabase...');
  console.log(`🌐 URL: ${supabaseUrl}`);
  
  try {
    // Check if we can query the database
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log(`📊 Found ${data.length} user(s) in the database.`);
    
    // Now check if all required tables exist
    await checkTables();
    
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:');
    console.error(error);
    
    if (error.message && error.message.includes('relation "users" does not exist')) {
      console.log('\n⚠️  The database tables may not be set up correctly.');
      console.log('   Please run the database migrations using the SQL files in the migrations directory.');
    }
    
    process.exit(1);
  }
}

// Check if all required tables exist
async function checkTables() {
  console.log('\n🔍 Checking for required database tables...');
  
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
  
  const missingTables = [];
  
  for (const tableName of requiredTables) {
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    if (error && error.message && error.message.includes(`relation "${tableName}" does not exist`)) {
      missingTables.push(tableName);
    }
  }
  
  if (missingTables.length > 0) {
    console.log('⚠️  The following required tables are missing:');
    missingTables.forEach((tableName) => {
      console.log(`   - ${tableName}`);
    });
    console.log('\nPlease run the database migrations using the SQL files in the migrations directory.');
  } else {
    console.log('✅ All required tables found in the database.');
  }
}

// Run the test
testConnection(); 