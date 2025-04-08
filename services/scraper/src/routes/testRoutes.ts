
import express from 'express';
import { logger } from '../utils/logger';
import { getSupabaseClient } from '../utils/database';
import os from 'os';

const router = express.Router();

/**
 * Test the scraper service's functionality and performance
 */
router.get('/health-check', async (req, res) => {
  try {
    const startTime = process.hrtime();
    
    // Check system resources
    const memoryUsage = process.memoryUsage();
    const cpuInfo = os.cpus();
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();
    
    // Test database connection
    const supabase = getSupabaseClient();
    const { data: dbHealth, error: dbError } = await supabase.from('health_checks')
      .select('count(*)', { count: 'exact', head: true });
    
    // Calculate response time
    const endTime = process.hrtime(startTime);
    const responseTimeMs = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
    
    const healthData = {
      status: 'ok',
      version: process.env.npm_package_version || 'unknown',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
        systemTotal: `${Math.round(totalMemory / 1024 / 1024)} MB`,
        systemFree: `${Math.round(freeMemory / 1024 / 1024)} MB`,
        systemUsagePercent: `${(100 - (freeMemory / totalMemory) * 100).toFixed(1)}%`
      },
      cpu: {
        cores: cpuInfo.length,
        model: cpuInfo[0]?.model || 'unknown',
        speed: `${cpuInfo[0]?.speed || 0} MHz`
      },
      database: {
        connected: !dbError,
        error: dbError ? dbError.message : null
      },
      responseTime: `${responseTimeMs} ms`
    };
    
    // Log metrics for monitoring
    logger.info('Health check metrics', { metrics: healthData });
    
    res.json(healthData);
  } catch (error: any) {
    logger.error('Health check failed', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
});

/**
 * Test the scraper's performance with a small job
 */
router.post('/test-performance', async (req, res) => {
  try {
    const { test_type = 'small' } = req.body;
    const startTime = process.hrtime();
    
    let result;
    
    // Perform a lightweight test based on the test type
    switch(test_type) {
      case 'memory':
        // Allocate some memory and release it to test GC
        const arr = new Array(1000000).fill('test');
        result = { 
          memoryAllocated: `${Math.round(arr.length * 2 / 1024)} KB`,
          memoryBefore: process.memoryUsage().heapUsed / 1024 / 1024
        };
        // Force garbage collection if available (only in specific Node.js modes)
        if (global.gc) {
          global.gc();
        }
        result.memoryAfter = process.memoryUsage().heapUsed / 1024 / 1024;
        break;
        
      case 'cpu':
        // Perform CPU-intensive calculation
        let sum = 0;
        for (let i = 0; i < 1000000; i++) {
          sum += Math.sqrt(i);
        }
        result = { calculation: 'completed', sum: sum.toFixed(2) };
        break;
        
      case 'database':
        // Test database read performance
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('raw_business_data')
          .select('id')
          .limit(10);
          
        result = { 
          success: !error,
          recordsRetrieved: data?.length || 0,
          error: error?.message
        };
        break;
        
      default:
        // Default light test
        result = { 
          status: 'ok',
          timestamp: new Date().toISOString()
        };
    }
    
    // Calculate response time
    const endTime = process.hrtime(startTime);
    const responseTimeMs = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
    
    const response = {
      test_type,
      result,
      responseTime: `${responseTimeMs} ms`,
      memory: process.memoryUsage().heapUsed / 1024 / 1024,
      environment: process.env.NODE_ENV
    };
    
    // Log for monitoring
    logger.info('Performance test completed', { 
      test_type, 
      responseTimeMs: parseFloat(responseTimeMs),
      memory: process.memoryUsage().heapUsed / 1024 / 1024
    });
    
    res.json(response);
  } catch (error: any) {
    logger.error('Performance test failed', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
});

export default router;
