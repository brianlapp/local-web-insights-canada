import { logger } from './logger.js';
import axios from 'axios';

/**
 * Result of URL validation
 */
export interface UrlValidationResult {
  isValid: boolean;
  normalizedUrl: string;
  originalUrl: string;
  redirectUrl?: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  isDomain?: boolean;
}

/**
 * Validate and normalize a URL
 * This ensures the URL is properly formatted and includes a protocol
 */
export function normalizeUrl(inputUrl: string): string {
  // Trim whitespace
  let url = inputUrl.trim();
  
  // Add https:// if no protocol is specified
  if (!url.match(/^(https?|ftp):\/\//i)) {
    url = `https://${url}`;
  }
  
  try {
    // Parse the URL to normalize it
    const parsedUrl = new URL(url);
    
    // Remove trailing slash
    let normalized = parsedUrl.origin + parsedUrl.pathname.replace(/\/$/, '');
    
    // Add back parameters and hash if present
    if (parsedUrl.search) {
      normalized += parsedUrl.search;
    }
    
    if (parsedUrl.hash) {
      normalized += parsedUrl.hash;
    }
    
    return normalized;
  } catch (error) {
    // If URL parsing fails, return the original input
    logger.warn(`Failed to normalize URL ${inputUrl}:`, error);
    return url;
  }
}

/**
 * Check if a URL has valid syntax
 */
export function isValidUrlSyntax(url: string): boolean {
  try {
    // Check if the URL can be parsed
    new URL(normalizeUrl(url));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if a URL is reachable by making an HTTP HEAD request
 */
export async function checkUrlReachability(url: string, timeoutMs: number = 10000): Promise<{
  isReachable: boolean;
  statusCode?: number;
  redirectUrl?: string;
  errorMessage?: string;
  responseTimeMs?: number;
}> {
  const normalizedUrl = normalizeUrl(url);
  const startTime = Date.now();
  
  try {
    // Make a HEAD request to check if the URL is reachable
    const response = await axios.head(normalizedUrl, {
      timeout: timeoutMs,
      maxRedirects: 5,
      validateStatus: () => true // Accept any status code
    });
    
    const responseTimeMs = Date.now() - startTime;
    
    // Check for redirects
    const redirectUrl = response.request.res.responseUrl;
    const finalUrl = redirectUrl !== normalizedUrl ? redirectUrl : undefined;
    
    return {
      isReachable: response.status >= 200 && response.status < 500,
      statusCode: response.status,
      redirectUrl: finalUrl,
      responseTimeMs
    };
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    
    // Handle different error types
    let errorMessage = 'Unknown error';
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timed out';
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'Domain not found';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'Request timed out';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused';
      } else if (error.response) {
        errorMessage = `HTTP error ${error.response.status}`;
      } else {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    logger.error(`URL validation error for ${normalizedUrl}:`, error);
    
    return {
      isReachable: false,
      errorMessage,
      responseTimeMs
    };
  }
}

/**
 * Extract domain from a URL
 */
export function extractDomain(url: string): string {
  try {
    const parsedUrl = new URL(normalizeUrl(url));
    return parsedUrl.hostname;
  } catch (error) {
    logger.warn(`Failed to extract domain from URL ${url}:`, error);
    return '';
  }
}

/**
 * Comprehensive URL validation that checks syntax and reachability
 */
export async function validateUrl(url: string, timeoutMs: number = 10000): Promise<UrlValidationResult> {
  // Start with normalized URL
  const normalizedUrl = normalizeUrl(url);
  
  // Check URL syntax
  if (!isValidUrlSyntax(normalizedUrl)) {
    return {
      isValid: false,
      normalizedUrl,
      originalUrl: url,
      error: 'Invalid URL syntax'
    };
  }
  
  // Parse the URL to extract components
  const parsedUrl = new URL(normalizedUrl);
  const domain = parsedUrl.hostname;
  
  // Check if the URL is reachable
  const reachabilityResult = await checkUrlReachability(normalizedUrl, timeoutMs);
  
  return {
    isValid: reachabilityResult.isReachable,
    normalizedUrl,
    originalUrl: url,
    redirectUrl: reachabilityResult.redirectUrl,
    statusCode: reachabilityResult.statusCode,
    responseTime: reachabilityResult.responseTimeMs,
    error: reachabilityResult.errorMessage,
    isDomain: domain === parsedUrl.pathname.replace(/\//g, '')
  };
}

/**
 * Check if a website is likely a single-page application (SPA)
 * This is useful for determining how to handle auditing
 */
export async function detectSpa(url: string): Promise<boolean> {
  try {
    // Make a GET request to get the HTML content
    const response = await axios.get(normalizeUrl(url), {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LocalWebInsightsBot/1.0; +https://localwebsiteaudit.ca)'
      }
    });
    
    const html = response.data;
    
    // Check for common SPA frameworks
    const spaSignatures = [
      'react.', 'react-dom.', 'angular.', 'vue.', 'ember.',
      'data-reactroot', 'ng-app', 'ng-controller', 'v-app', 'ember-app',
      '<div id="app">', '<div id="root">'
    ];
    
    return spaSignatures.some(signature => html.includes(signature));
  } catch (error) {
    logger.warn(`Failed to detect SPA for URL ${url}:`, error);
    return false;
  }
} 