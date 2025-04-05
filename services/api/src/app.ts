import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Setup middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // CORS headers
app.use(express.json({ limit: '1mb' })); // Parse JSON with size limit
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => {
          logger.http(message.trim());
        }
      }
    })
  );
}

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app; 