import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../utils/database';
import { verifyToken, getUserRole } from '../utils/auth/supabaseAuth';
import logger from '../utils/logger';
import { ApiError } from './errorMiddleware';

/**
 * Authenticate using JWT token from Supabase Auth
 */
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'No token provided'));
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token using Supabase Auth
    const user = await verifyToken(token);
    
    if (!user) {
      return next(new ApiError(401, 'Invalid or expired token'));
    }
    
    // Get user role
    const role = await getUserRole(user.id);
    
    // Set user data on request object
    req.user = {
      id: user.id,
      email: user.email,
      role,
      firstName: user.user_metadata?.first_name,
      lastName: user.user_metadata?.last_name
    };
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    next(new ApiError(401, 'Authentication failed'));
  }
};

/**
 * Authenticate using API key
 */
export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKeyHeader = process.env.API_KEY_HEADER || 'x-api-key';
    const apiKey = req.headers[apiKeyHeader.toLowerCase()] as string;
    
    if (!apiKey) {
      return next(new ApiError(401, 'No API key provided'));
    }
    
    const supabase = getSupabaseClient();
    
    // Find API key in database
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key', apiKey)
      .single();
    
    if (error || !data) {
      return next(new ApiError(401, 'Invalid API key'));
    }
    
    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return next(new ApiError(401, 'API key has expired'));
    }
    
    // Store API key data on request
    req.apiKey = {
      id: data.id,
      name: data.name,
      permissions: data.permissions
    };
    
    // Simulate a user with read permissions
    req.user = {
      id: 'api',
      email: 'api@system',
      role: 'api'
    };
    
    next();
  } catch (error) {
    logger.error('API key authentication error:', error);
    next(new ApiError(401, 'API key authentication failed'));
  }
};

/**
 * Require admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }
  
  if (req.user.role !== 'admin') {
    return next(new ApiError(403, 'Admin privileges required'));
  }
  
  next();
};

/**
 * Require standard role or above
 */
export const requireStandard = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }
  
  if (!['admin', 'standard'].includes(req.user.role)) {
    return next(new ApiError(403, 'Standard privileges required'));
  }
  
  next();
}; 