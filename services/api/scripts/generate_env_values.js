#!/usr/bin/env node

/**
 * This script generates secure values for environment variables.
 * Run with: node scripts/generate_env_values.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Function to generate a secure random string
function generateSecureString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Function to update environment file
function updateEnvFile(envPath, updates) {
  try {
    if (!fs.existsSync(envPath)) {
      console.error(`Environment file not found: ${envPath}`);
      return false;
    }

    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Apply updates
    for (const [key, value] of Object.entries(updates)) {
      // Escape special characters in the key for regex
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^${escapedKey}=.*$`, 'm');
      
      if (regex.test(envContent)) {
        // Update existing variable
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        // Add new variable
        envContent += `\n${key}=${value}`;
      }
    }
    
    fs.writeFileSync(envPath, envContent);
    return true;
  } catch (error) {
    console.error('Error updating environment file:', error);
    return false;
  }
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Main function
async function main() {
  console.log('📝 Generating secure environment variable values...');
  
  // Path to .env file
  const envPath = path.join(__dirname, '..', '.env');
  
  // Ask about Supabase details
  rl.question('Enter your Supabase URL (or press Enter to skip): ', (supabaseUrl) => {
    rl.question('Enter your Supabase API key (or press Enter to skip): ', (supabaseKey) => {
      rl.question('Enter your Supabase service role key (or press Enter to skip): ', (supabaseServiceKey) => {
        // Generate values
        const jwtSecret = generateSecureString(32);
        
        // Prepare updates
        const updates = {
          JWT_SECRET: jwtSecret
        };
        
        // Add Supabase values if provided
        if (supabaseUrl.trim()) updates.SUPABASE_URL = supabaseUrl.trim();
        if (supabaseKey.trim()) updates.SUPABASE_KEY = supabaseKey.trim();
        if (supabaseServiceKey.trim()) updates.SUPABASE_SERVICE_ROLE_KEY = supabaseServiceKey.trim();
        
        // Update .env file
        const success = updateEnvFile(envPath, updates);
        
        if (success) {
          console.log('✅ Environment variables updated successfully!');
          console.log('\nGenerated values:');
          console.log(`JWT_SECRET=${jwtSecret}`);
        } else {
          console.log('❌ Failed to update environment variables.');
        }
        
        rl.close();
      });
    });
  });
}

// Run the script
main(); 