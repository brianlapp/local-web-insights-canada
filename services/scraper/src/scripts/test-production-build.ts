import fetch from 'node-fetch';
import { logger } from '../utils/logger';

// Configuration
const SERVICE_URL = process.env.SERVICE_URL || 'http://localhost:3000';
const TEST_TYPES = ['memory', 'cpu', 'database'];

/**
 * Run a series of tests against the production build
 */
async function testProductionBuild() {
  logger.info('Starting production build test suite');
  logger.info(`Testing service at: ${SERVICE_URL}`);
  
  try {
    // Test 1: Health Check
    logger.info('Running health check test...');
    const healthResponse = await fetch(`${SERVICE_URL}/api/health`);
    
    if (!healthResponse.ok) {
      throw new Error(`Health check failed with status: ${healthResponse.status}`);
    }
    
    const healthData = await healthResponse.json();
    logger.info('Health check passed', { metrics: healthData });
    
    // Test 2: Performance Tests
    for (const testType of TEST_TYPES) {
      logger.info(`Running ${testType} performance test...`);
      
      const perfResponse = await fetch(`${SERVICE_URL}/api/test/test-performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test_type: testType }),
      });
      
      if (!perfResponse.ok) {
        throw new Error(`${testType} test failed with status: ${perfResponse.status}`);
      }
      
      const perfData = await perfResponse.json();
      logger.info(`${testType} test passed`, { metrics: perfData });
    }
    
    // Test 3: Queue status check
    logger.info('Checking queue status...');
    const queueResponse = await fetch(`${SERVICE_URL}/api/queue-status`);
    
    if (!queueResponse.ok) {
      throw new Error(`Queue status check failed with status: ${queueResponse.status}`);
    }
    
    const queueData = await queueResponse.json();
    logger.info('Queue status check passed', { metrics: queueData });
    
    // All tests passed
    logger.info('All tests passed! Production build is working correctly');
    process.exit(0);
  } catch (error: any) {
    logger.error('Production build test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testProductionBuild();
