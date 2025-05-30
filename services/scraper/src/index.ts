import express, { Request, Response, NextFunction } from 'express';

// We don't need this declaration anymore
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { setupRoutes } from './routes/index.js';
import { 
  setupQueues, 
  getScraperQueue, 
  getAuditQueue, 
  getDataProcessingQueue,
  ScraperJobData,
  AuditJobData
} from './queues/index.js';
import { getSupabaseClient } from './utils/database.js';
import { getRedisClient } from './config/redis.js';
import { Job, Queue } from 'bull';
import { Redis as RedisClient } from 'ioredis';

// Add at the top of the file, after imports
declare global {
  var redisClient: RedisClient | null;
}

// Load environment variables
dotenv.config();

// Create a separate debug app for diagnostics
const debugApp = express();
debugApp.get('/', (req, res) => {
  res.send('Debug server working');
});
debugApp.listen(process.env.PORT ? parseInt(process.env.PORT) + 1 : 3001, () => {
  console.log(`Debug server listening on port ${process.env.PORT ? parseInt(process.env.PORT) + 1 : 3001}`);
});

const app = express();
const port = process.env.PORT || 3000;

// Health check endpoint - MUST be first, before any middleware or initialization
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Service is healthy' });
});

// Add a super-simple debug endpoint that doesn't rely on anything
app.get('/super-debug', (_req: Request, res: Response) => {
  // Include check for Google Places API key
  const hasGoogleKey = !!process.env.GOOGLE_PLACES_API_KEY || !!process.env.GOOGLE_MAPS_API_KEYS;
  const googleKeyName = process.env.GOOGLE_PLACES_API_KEY ? 'GOOGLE_PLACES_API_KEY' : 
                        (process.env.GOOGLE_MAPS_API_KEYS ? 'GOOGLE_MAPS_API_KEYS' : 'none');
  
  res.status(200).json({ 
    status: 'ok', 
    message: 'Super debug endpoint is working',
    environment: process.env.NODE_ENV,
    hasGoogleKey,
    googleKeyName,
    time: new Date().toISOString(),
    port: process.env.PORT || 3000
  });
});

// Add direct version of start endpoint at root level
app.post('/start', (req: Request, res: Response) => {
  console.log('ROOT START ENDPOINT CALLED');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  res.status(200).json({
    status: 'success',
    message: 'Root start endpoint received request',
    receivedData: req.body
  });
});

// Add this at the very top of the file
console.log('=== Startup Verification ===');
console.log('Module path:', import.meta.url);
console.log('Process info:', {
  cwd: process.cwd(),
  pid: process.pid,
  version: process.version,
  env: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT
  }
});

// Queue instances
let scraperQueueInstance: Queue<ScraperJobData>;
let auditQueueInstance: Queue<AuditJobData>;
let dataProcessingQueueInstance: Queue;

// Log environment info
logger.info(`Starting scraper service in ${process.env.NODE_ENV || 'development'} mode`);
logger.info(`Node.js version: ${process.version}`);
logger.info(`Memory limits: ${JSON.stringify(process.memoryUsage())}`);

// Add startup diagnostics logging
logger.info('=== STARTUP DIAGNOSTICS ===');
logger.info(`Process ID: ${process.pid}`);
logger.info(`Working Directory: ${process.cwd()}`);
logger.info(`Node Version: ${process.version}`);
logger.info(`Platform: ${process.platform}`);
logger.info(`Architecture: ${process.arch}`);
logger.info(`Memory Usage: ${JSON.stringify(process.memoryUsage())}`);
logger.info(`Environment Variables: PORT=${process.env.PORT}`);
logger.info('=== END DIAGNOSTICS ===');

// Enhanced CORS configuration - apply first before any other middleware
// More permissive to allow frontend access
app.use((req: Request, res: Response, next: NextFunction) => {
  // Allow requests from any origin
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Log CORS requests for debugging
  if (req.method === 'OPTIONS') {
    console.log('Received OPTIONS request');
    return res.status(204).end();
  }
  
  next();
});

// Regular middleware
app.use(express.json());

// Add a specific CORS test endpoint with detailed diagnostics
app.get('/cors-test', (req: Request, res: Response) => {
  // Add extra CORS headers just to be sure
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  res.status(200).json({
    status: 'ok',
    message: 'CORS test successful',
    request: {
      method: req.method,
    },
    response: {
      corsEnabled: true,
      corsHeaders: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// API health check endpoint (for detailed status)
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const status = await getHealthStatus();
    res.status(200).json(status);
  } catch (error: any) {
    // Even on error, return 200 with error details
    res.status(200).json({
      status: 'ok',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Initialize services
async function initializeServices() {
  let redis = null;
  let queuesInitialized = false;

  try {
    // Initialize Redis connection
    redis = await getRedisClient();
    logger.info('Redis connection initialized');

    // Initialize queues
    await setupQueues();
    scraperQueueInstance = await getScraperQueue();
    auditQueueInstance = await getAuditQueue();
    dataProcessingQueueInstance = await getDataProcessingQueue();
    queuesInitialized = true;
    logger.info('Job queues initialized');
  } catch (error) {
    logger.error('Failed to initialize Redis and queues:', error);
    // Don't exit - continue with degraded functionality
  }

  try {
    // Initialize Supabase client
    getSupabaseClient();
    logger.info('Supabase client initialized');
  } catch (error) {
    logger.error('Failed to initialize Supabase:', error);
    // Don't exit - continue with degraded functionality
  }

  try {
    logger.info('Setting up routes...');
    
    // Set up routes with initialized queues (might be null if initialization failed)
    // Always provide the queues to avoid null reference errors
    const router = setupRoutes(
      queuesInitialized ? scraperQueueInstance : null,
      queuesInitialized ? auditQueueInstance : null,
      queuesInitialized ? dataProcessingQueueInstance : null
    );
    
    logger.info('Routes setup completed successfully');
    
    // Add a special debug endpoint
    app.get('/debug-routes', (req, res) => {
      res.json({
        queuesInitialized,
        redisAvailable: redis !== null,
        endpoints: ['GET /health', 'GET /api/health', 'POST /api/start', 'POST /api/audit']
      });
    });
    
    // Mount the router at /api
    app.use('/api', router);
    
    // Add more detailed debug logging
    logger.info('=== API ROUTES INITIALIZED ===');
    logger.info('Routes mounted at path prefix: /api');
    
    // Log all available API endpoints
    const apiRoutes = [
      'GET /api/health',
      'GET /api/health-detailed',
      'GET /api/test-minimal',
      'GET /api/test-places-api',
      'POST /api/test-start',
      'GET /api/start',
      'POST /api/start',
      'POST /api/audit'
    ];
    
    logger.info('Available API routes:');
    apiRoutes.forEach(route => logger.info(`- ${route}`));
    logger.info('=== END API ROUTES ===');
    
    // Add a direct test endpoint for debugging
    app.get('/api-test', (req, res) => {
      res.json({
        status: 'ok',
        message: 'Direct API test endpoint is working',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    logger.error('Failed to initialize routes:', error);
    // Don't exit - continue with basic endpoints
  }

  // Return initialization status
  return {
    redis: redis !== null,
    queues: queuesInitialized,
    supabase: true // We can add more detailed status if needed
  };
}

// Add type definitions for health check response
interface RedisStatus {
  configured_url: string;
  status: string;
  error?: string;
}

interface QueueStatus {
  scraper: any | null;
  audit: any | null;
  error?: string;
}

interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  redis: RedisStatus;
  queues: QueueStatus;
  system: {
    memory: NodeJS.MemoryUsage;
    uptime: number;
  };
  error?: string;
}

// Health check function that can be reused
async function getHealthStatus(): Promise<HealthStatus> {
  const healthStatus: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    redis: {
      configured_url: (process.env.REDIS_URL || 'redis://redis.railway.internal:6379').replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
      status: 'unknown'
    },
    queues: {
      scraper: null,
      audit: null
    },
    system: {
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  };

  // Check Redis connection
  try {
    const redis = await getRedisClient();
    await redis.ping();
    healthStatus.redis.status = 'connected';
  } catch (error) {
    healthStatus.redis.status = 'disconnected';
    healthStatus.redis.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Check queue status
  try {
    if (scraperQueueInstance) {
      const scraperCounts = await scraperQueueInstance.getJobCounts();
      healthStatus.queues.scraper = scraperCounts;
    }
    if (auditQueueInstance) {
      const auditCounts = await auditQueueInstance.getJobCounts();
      healthStatus.queues.audit = auditCounts;
    }
  } catch (error) {
    healthStatus.queues.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return healthStatus;
}

// Enhanced Redis test endpoint
app.get('/test-redis-connection', async (req: Request, res: Response) => {
  try {
    const redis = await getRedisClient();
    
    const startTime = Date.now();
    const pingResult = await redis.ping();
    const endTime = Date.now();

    const results = {
      connection_test: {
        success: pingResult === 'PONG',
        ping_time_ms: endTime - startTime,
        error: null
      },
      redis_status: {
        connected: true,
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      },
      queue_status: {
        scraper: await scraperQueueInstance.getJobCounts(),
        audit: await auditQueueInstance.getJobCounts()
      }
    };

    res.status(200).json(results);
  } catch (error: any) {
    logger.error('Redis test failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log detailed error information
  logger.error('Detailed error:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    // Only log body for non-GET requests
    body: req.method !== 'GET' ? req.body : undefined
  });
  
  // Send a more helpful response
  res.status(500).json({ 
    error: err.message || 'Internal server error'
  });
});

// Start server with detailed error handling
logger.info('Starting server...');
const server = app.listen(Number(port), '0.0.0.0', () => {
  logger.info('=== SERVER STARTED ===');
  logger.info(`Server listening on port ${port}`);
  logger.info(`Server address: ${JSON.stringify(server.address())}`);
  logger.info('=== END SERVER INFO ===');
  
  // Initialize services in background
  initializeServices()
    .then(status => {
      logger.info('=== SERVICES STATUS ===');
      logger.info('Services initialized:', status);
      logger.info('=== END SERVICES STATUS ===');
    })
    .catch(error => {
      logger.error('=== SERVICE ERROR ===');
      logger.error('Service initialization error:', error);
      logger.error('Stack trace:', error.stack);
      logger.error('=== END SERVICE ERROR ===');
    });
}).on('error', (error: Error) => {
  logger.error('=== SERVER ERROR ===');
  logger.error('Server failed to start:', error);
  logger.error('Error name:', error.name);
  logger.error('Error message:', error.message);
  logger.error('Stack trace:', error.stack);
  logger.error('=== END SERVER ERROR ===');
  process.exit(1);
});

// Enhanced error handling
process.on('uncaughtException', (error: Error) => {
  logger.error('=== UNCAUGHT EXCEPTION ===');
  logger.error('Uncaught exception:', error);
  logger.error('Stack trace:', error.stack);
  logger.error('=== END UNCAUGHT EXCEPTION ===');
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('=== UNHANDLED REJECTION ===');
  logger.error('Unhandled rejection at:', promise);
  logger.error('Reason:', reason);
  if (reason instanceof Error) {
    logger.error('Error name:', reason.name);
    logger.error('Error message:', reason.message);
    logger.error('Stack trace:', reason.stack);
  } else {
    logger.error('Non-Error reason type:', typeof reason);
    logger.error('String representation:', String(reason));
  }
  logger.error('=== END UNHANDLED REJECTION ===');
});

// Add direct route for testing starts
app.post('/direct-start', (req: Request, res: Response) => {
  console.log('DIRECT START ENDPOINT CALLED');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  res.status(200).json({
    status: 'success',
    message: 'Direct start endpoint called successfully',
    receivedData: req.body
  });
});

// Add a fallback 404 handler with more diagnostic info
app.use((req: Request, res: Response) => {
  // Log detailed request info without relying on potentially missing properties
  logger.warn(`Route not found: ${req.method}`, {
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
  });
  
  res.status(404).json({
    error: 'Not Found',
    message: `The requested endpoint does not exist: ${req.method}`,
    request: {
      method: req.method
    },
    availableRoutes: [
      'GET /health',
      'GET /super-debug',
      'GET /api/health',
      'GET /api-test',
      'GET /api/test-minimal',
      'GET /api/test-places-api',
      'POST /api/test-start',
      'GET /api/start',
      'POST /api/start',
      'POST /api/audit',
      'POST /direct-start'
    ]
  });
});
