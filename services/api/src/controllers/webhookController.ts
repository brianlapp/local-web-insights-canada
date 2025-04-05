import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../utils/database';
import logger from '../utils/logger';
import { ApiError } from '../middleware/errorMiddleware';
import crypto from 'crypto';
import axios from 'axios';

/**
 * Register a new webhook
 */
export const registerWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, url, events, active = true, secret } = req.body;
    const userId = req.user?.id;
    const supabase = getSupabaseClient();
    
    if (!userId) {
      return next(new ApiError(401, 'User not authenticated'));
    }
    
    // Generate a secret if not provided
    const webhookSecret = secret || crypto.randomBytes(24).toString('hex');
    
    // Create webhook
    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        name,
        url,
        events,
        active,
        secret: webhookSecret,
        created_by: userId
      })
      .select()
      .single();
    
    if (error) {
      logger.error('Error registering webhook:', error);
      return next(new ApiError(500, 'Failed to register webhook'));
    }
    
    // Don't return the secret in the response
    const { secret: _, ...webhookData } = data;
    
    res.status(201).json({
      success: true,
      data: webhookData,
      message: 'Webhook registered successfully'
    });
  } catch (error) {
    logger.error('Error in registerWebhook:', error);
    next(new ApiError(500, 'An unexpected error occurred'));
  }
};

/**
 * Get all webhooks
 */
export const getAllWebhooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('webhooks')
      .select('id, name, url, events, active, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      logger.error('Error fetching webhooks:', error);
      return next(new ApiError(500, 'Failed to fetch webhooks'));
    }
    
    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    logger.error('Error in getAllWebhooks:', error);
    next(new ApiError(500, 'An unexpected error occurred'));
  }
};

/**
 * Get webhook by ID
 */
export const getWebhookById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('webhooks')
      .select('id, name, url, events, active, created_at, updated_at')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return next(new ApiError(404, 'Webhook not found'));
      }
      logger.error('Error fetching webhook by ID:', error);
      return next(new ApiError(500, 'Failed to fetch webhook'));
    }
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error in getWebhookById:', error);
    next(new ApiError(500, 'An unexpected error occurred'));
  }
};

/**
 * Update webhook
 */
export const updateWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, url, events, active, secret } = req.body;
    const supabase = getSupabaseClient();
    
    // Check if webhook exists
    const { data: existingWebhook, error: checkError } = await supabase
      .from('webhooks')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return next(new ApiError(404, 'Webhook not found'));
      }
      logger.error('Error checking webhook existence:', checkError);
      return next(new ApiError(500, 'Failed to update webhook'));
    }
    
    // Update webhook
    const updateData: Record<string, any> = {};
    
    if (name !== undefined) updateData.name = name;
    if (url !== undefined) updateData.url = url;
    if (events !== undefined) updateData.events = events;
    if (active !== undefined) updateData.active = active;
    if (secret !== undefined) updateData.secret = secret;
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('webhooks')
      .update(updateData)
      .eq('id', id)
      .select('id, name, url, events, active, created_at, updated_at')
      .single();
    
    if (error) {
      logger.error('Error updating webhook:', error);
      return next(new ApiError(500, 'Failed to update webhook'));
    }
    
    res.status(200).json({
      success: true,
      data,
      message: 'Webhook updated successfully'
    });
  } catch (error) {
    logger.error('Error in updateWebhook:', error);
    next(new ApiError(500, 'An unexpected error occurred'));
  }
};

/**
 * Delete webhook
 */
export const deleteWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    
    // Check if webhook exists
    const { data: existingWebhook, error: checkError } = await supabase
      .from('webhooks')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return next(new ApiError(404, 'Webhook not found'));
      }
      logger.error('Error checking webhook existence:', checkError);
      return next(new ApiError(500, 'Failed to delete webhook'));
    }
    
    // Delete webhook
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);
    
    if (error) {
      logger.error('Error deleting webhook:', error);
      return next(new ApiError(500, 'Failed to delete webhook'));
    }
    
    res.status(200).json({
      success: true,
      message: 'Webhook deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteWebhook:', error);
    next(new ApiError(500, 'An unexpected error occurred'));
  }
};

/**
 * Test webhook
 */
export const testWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { event, payload } = req.body;
    const supabase = getSupabaseClient();
    
    // Get webhook details
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (webhookError) {
      if (webhookError.code === 'PGRST116') {
        return next(new ApiError(404, 'Webhook not found'));
      }
      logger.error('Error fetching webhook for testing:', webhookError);
      return next(new ApiError(500, 'Failed to test webhook'));
    }
    
    // Check if event is in the webhook's events array
    if (!webhook.events.includes(event)) {
      return next(new ApiError(400, `Webhook is not subscribed to event: ${event}`));
    }
    
    // Prepare webhook payload
    const webhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data: payload
    };
    
    // Calculate signature
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(JSON.stringify(webhookPayload))
      .digest('hex');
    
    // Send test webhook
    try {
      const response = await axios.post(webhook.url, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
          'X-Webhook-Id': id
        },
        timeout: 5000 // 5 second timeout
      });
      
      // Log the attempt
      await supabase
        .from('webhook_logs')
        .insert({
          webhook_id: id,
          event,
          payload: webhookPayload,
          response_status: response.status,
          response_body: response.data,
          success: true
        });
      
      res.status(200).json({
        success: true,
        message: 'Webhook test sent successfully',
        status: response.status,
        response: response.data
      });
    } catch (error: any) {
      // Log the failed attempt
      await supabase
        .from('webhook_logs')
        .insert({
          webhook_id: id,
          event,
          payload: webhookPayload,
          response_status: error.response?.status || 0,
          response_body: error.response?.data || error.message,
          success: false
        });
      
      return next(new ApiError(500, `Failed to send webhook: ${error.message}`));
    }
  } catch (error) {
    logger.error('Error in testWebhook:', error);
    next(new ApiError(500, 'An unexpected error occurred'));
  }
};

/**
 * Get webhook delivery logs
 */
export const getWebhookLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    
    // Check if webhook exists
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('id, name')
      .eq('id', id)
      .single();
    
    if (webhookError) {
      if (webhookError.code === 'PGRST116') {
        return next(new ApiError(404, 'Webhook not found'));
      }
      logger.error('Error checking webhook existence:', webhookError);
      return next(new ApiError(500, 'Failed to fetch webhook logs'));
    }
    
    // Get the logs
    const { data: logs, error: logsError } = await supabase
      .from('webhook_logs')
      .select('id, event, success, response_status, created_at')
      .eq('webhook_id', id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (logsError) {
      logger.error('Error fetching webhook logs:', logsError);
      return next(new ApiError(500, 'Failed to fetch webhook logs'));
    }
    
    res.status(200).json({
      success: true,
      webhook: webhook.name,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    logger.error('Error in getWebhookLogs:', error);
    next(new ApiError(500, 'An unexpected error occurred'));
  }
};

/**
 * Handle external webhook
 */
export const handleExternalWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { eventType } = req.params;
    const { payload } = req.body;
    const apiKey = req.apiKey;
    const supabase = getSupabaseClient();
    
    logger.info(`Received external webhook: ${eventType}`);
    
    // Process the event
    const processResult = await processExternalEvent(eventType, payload, apiKey);
    
    // Save the webhook record
    await supabase
      .from('external_webhooks')
      .insert({
        event_type: eventType,
        payload,
        status: processResult.success ? 'processed' : 'failed',
        api_key_id: apiKey?.id || null,
        error: processResult.error
      });
    
    if (!processResult.success) {
      logger.error(`Failed to process external webhook: ${processResult.error}`);
      return next(new ApiError(400, processResult.error || 'Failed to process webhook'));
    }
    
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      data: processResult.data
    });
  } catch (error) {
    logger.error('Error in handleExternalWebhook:', error);
    next(new ApiError(500, 'An unexpected error occurred'));
  }
};

/**
 * Process external event
 */
async function processExternalEvent(
  eventType: string,
  payload: any,
  apiKey: any
): Promise<{ success: boolean; error?: string; data?: any }> {
  // This function would contain the specific logic for handling different event types
  // For now, we'll just have a basic implementation
  try {
    // Validate the event type and payload
    if (!['business.update', 'analysis.request', 'scraper.request'].includes(eventType)) {
      return { success: false, error: `Unsupported event type: ${eventType}` };
    }
    
    // Process based on event type
    switch (eventType) {
      case 'business.update':
        // Process business update
        // TODO: Implement business update logic
        return { success: true, data: { message: 'Business update processed' } };
        
      case 'analysis.request':
        // Process analysis request
        // TODO: Implement analysis request logic
        return { success: true, data: { message: 'Analysis request processed' } };
        
      case 'scraper.request':
        // Process scraper request
        // TODO: Implement scraper request logic
        return { success: true, data: { message: 'Scraper request processed' } };
        
      default:
        return { success: false, error: 'Unknown event type' };
    }
  } catch (error: any) {
    logger.error('Error processing external event:', error);
    return { success: false, error: error.message || 'Failed to process event' };
  }
}; 