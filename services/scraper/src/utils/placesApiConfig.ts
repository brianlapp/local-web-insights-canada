import { Client } from '@googlemaps/google-maps-services-js';
import { logger } from './logger.js';

// Types
interface ApiKeyConfig {
  key: string;
  dailyQuota: number;
  requestsPerDay: number;
  remainingRequests: number;
  lastRotation: Date;
}

// Configuration
class PlacesApiConfig {
  private apiKeys: ApiKeyConfig[] = [];
  private currentKeyIndex: number = 0;
  private client: Client | null = null;
  
  // Rate limiting
  private requestsThisMinute: number = 0;
  private minuteStartTime: Date = new Date();
  private readonly maxRequestsPerMinute: number = 60; // Default Google Maps API limit
  
  constructor() {
    this.loadApiKeys();
    this.resetMinuteCounter();
    
    // Set up periodic reset of the minute counter
    setInterval(() => this.resetMinuteCounter(), 60000);
    
    // Set up daily key rotation/reset
    setInterval(() => this.resetDailyCounts(), 86400000);
  }
  
  /**
   * Load API keys from environment variables
   */
  private loadApiKeys() {
    const apiKeyString = process.env.GOOGLE_MAPS_API_KEYS;
    if (!apiKeyString) {
      logger.error('Missing GOOGLE_MAPS_API_KEYS environment variable');
      throw new Error('Missing GOOGLE_MAPS_API_KEYS environment variable');
    }
    
    // Format: key1:quota1,key2:quota2
    const keyPairs = apiKeyString.split(',');
    
    this.apiKeys = keyPairs.map(pair => {
      const [key, quotaStr] = pair.split(':');
      const quota = parseInt(quotaStr || '1000');
      
      return {
        key,
        dailyQuota: quota,
        requestsPerDay: 0,
        remainingRequests: quota,
        lastRotation: new Date()
      };
    });
    
    if (this.apiKeys.length === 0) {
      logger.error('No valid API keys found');
      throw new Error('No valid API keys found');
    }
    
    logger.info(`Loaded ${this.apiKeys.length} Google Maps API keys`);
  }
  
  /**
   * Reset the minute counter for rate limiting
   */
  private resetMinuteCounter() {
    this.requestsThisMinute = 0;
    this.minuteStartTime = new Date();
  }
  
  /**
   * Reset daily counts for all API keys
   */
  private resetDailyCounts() {
    this.apiKeys.forEach(key => {
      key.requestsPerDay = 0;
      key.remainingRequests = key.dailyQuota;
      key.lastRotation = new Date();
    });
    logger.info('Reset daily API key quotas');
  }
  
  /**
   * Get the current API key, rotating if necessary
   */
  public getCurrentKey(): string {
    const currentKey = this.apiKeys[this.currentKeyIndex];
    
    // Check if we need to rotate keys
    if (currentKey.remainingRequests <= 0) {
      this.rotateApiKey();
      return this.getCurrentKey();
    }
    
    return currentKey.key;
  }
  
  /**
   * Rotate to the next available API key
   */
  private rotateApiKey() {
    const originalIndex = this.currentKeyIndex;
    let rotated = false;
    
    // Try to find a key with remaining quota
    do {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
      
      // If we've checked all keys and come back to the original, we're out of quota
      if (this.currentKeyIndex === originalIndex && rotated) {
        logger.error('All API keys have exceeded their quota');
        throw new Error('All API keys have exceeded their quota');
      }
      
      rotated = true;
    } while (this.apiKeys[this.currentKeyIndex].remainingRequests <= 0);
    
    logger.info(`Rotated to API key #${this.currentKeyIndex}`);
  }
  
  /**
   * Check if we should throttle requests due to rate limiting
   */
  public shouldThrottle(): boolean {
    // Reset counter if we're in a new minute
    const now = new Date();
    if (now.getTime() - this.minuteStartTime.getTime() > 60000) {
      this.resetMinuteCounter();
    }
    
    return this.requestsThisMinute >= this.maxRequestsPerMinute;
  }
  
  /**
   * Track API request and update counters
   */
  public trackRequest() {
    // Update rate limiting counter
    this.requestsThisMinute++;
    
    // Update API key usage
    const currentKey = this.apiKeys[this.currentKeyIndex];
    currentKey.requestsPerDay++;
    currentKey.remainingRequests--;
    
    // Log if we're approaching quota limits
    if (currentKey.remainingRequests <= 50) {
      logger.warn(`API key #${this.currentKeyIndex} has only ${currentKey.remainingRequests} requests remaining today`);
    }
  }
  
  /**
   * Get the Google Maps client with proper configuration
   */
  public getClient(): Client {
    if (!this.client) {
      this.client = new Client({});
    }
    return this.client;
  }
  
  /**
   * Get current API key usage statistics
   */
  public getKeyStats() {
    return this.apiKeys.map((key, index) => ({
      keyIndex: index,
      isCurrent: index === this.currentKeyIndex,
      dailyQuota: key.dailyQuota,
      requestsPerDay: key.requestsPerDay,
      remainingRequests: key.remainingRequests,
      lastRotation: key.lastRotation
    }));
  }
}

// Singleton instance
export const placesApiConfig = new PlacesApiConfig();

// Export for external usage
export default placesApiConfig; 