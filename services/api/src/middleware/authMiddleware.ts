import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getSupabaseClient } from '../utils/database';
import logger from '../utils/logger';
import { ApiError } from './errorMiddleware';
import { verifyToken, getUserRole } from '../utils/auth/supabaseAuth';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'default-dev-secret-do-not-use-in-production';
const API_KEY_HEADER = process.env.API_KEY_HEADER || 'x-api-key';

/**
 * Authenticate using JWT token from Supabase Auth
 */
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new ApiError('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    // Verify token with Supabase Auth
    const userData = await verifyToken(token);
    if (!userData) {
      return next(new ApiError('Invalid or expired token', 401));
    }
    
    // Get user role
    const role = await getUserRole(userData.sub);
    
    // Set user info in request
    req.user = {
      id: userData.sub,
      role: role || 'user',
      email: userData.email
    };
    
    next();
  } catch (error) {
    logger.error('JWT Authentication Error:', error);
    next(new ApiError('Authentication failed', 401));
  }
};

/**
 * Authenticate using API key
 */
export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const apiKey = req.headers[API_KEY_HEADER.toLowerCase()] as string;
  
  if (!apiKey) {
    return next(new ApiError('No API key provided', 401));
  }
  
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key', apiKey)
      .single();
    
    if (error || !data) {
      return next(new ApiError('Invalid API key', 401));
    }
    
    // Check if API key has expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return next(new ApiError('API key has expired', 401));
    }
    
    req.apiKey = {
      id: data.id,
      name: data.name,
      permissions: data.permissions || []
    };
    
    // If API key has user_id, simulate that user's session
    if (data.user_id) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user_id)
        .single();
      
      if (!userError && userData) {
        req.user = {
          id: data.user_id,
          role: userData.role,
          email: 'api@system'
        };
      }
    }
    
    next();
  } catch (error) {
    logger.error('API Key Authentication Error:', error);
    next(new ApiError('API key authentication failed', 401));
  }
};

/**
 * Require admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new ApiError('Authentication required', 401));
  }
  
  if (req.user.role !== 'admin') {
    return next(new ApiError('Admin privileges required', 403));
  }
  
  next();
};

/**
 * Require standard role or above
 */
export const requireStandard = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new ApiError('Authentication required', 401));
  }
  
  if (req.user.role !== 'standard' && req.user.role !== 'admin') {
    return next(new ApiError('Standard privileges required', 403));
  }
  
  next();
}; 