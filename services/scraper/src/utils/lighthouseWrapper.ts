/**
 * Lighthouse Wrapper
 * 
 * This wrapper handles the compatibility issues between ESM and CommonJS modules
 * for Lighthouse. It provides a consistent interface regardless of how the module
 * is loaded.
 */

import type { RunnerResult } from 'lighthouse';
import { logger } from './logger';

// Define the type for the Lighthouse function
type LighthouseFunction = (
  url: string,
  options?: {
    port?: number;
    output?: string;
    logLevel?: string;
    formFactor?: 'desktop' | 'mobile';
    throttling?: {
      cpuSlowdownMultiplier?: number;
      requestLatencyMs?: number;
      downloadThroughputKbps?: number;
      uploadThroughputKbps?: number;
    };
    screenEmulation?: {
      width?: number;
      height?: number;
      deviceScaleFactor?: number;
      mobile?: boolean;
      disabled?: boolean;
    };
    onlyCategories?: string[];
    [key: string]: any;
  }
) => Promise<RunnerResult>;

/**
 * Load Lighthouse module using different approaches
 * to handle both ESM and CommonJS environments
 */
async function getLighthouse(): Promise<LighthouseFunction> {
  try {
    logger.info('Attempting to load Lighthouse module');
    
    // First, try dynamic import (works with ESM)
    try {
      logger.info('Trying dynamic import for Lighthouse');
      const lighthouseModule = await import('lighthouse');
      logger.info(`Lighthouse module imported type: ${typeof lighthouseModule}, keys: ${Object.keys(lighthouseModule).join(', ')}`);
      
      if (typeof lighthouseModule.default === 'function') {
        logger.info('Using Lighthouse from ESM default export');
        return lighthouseModule.default;
      } else if (typeof lighthouseModule === 'function') {
        logger.info('Using Lighthouse from ESM direct export');
        return lighthouseModule;
      }
    } catch (err) {
      logger.warn(`Dynamic import failed: ${err instanceof Error ? err.message : String(err)}`);
    }
    
    // Fall back to CommonJS require
    logger.info('Trying CommonJS require for Lighthouse');
    try {
      // @ts-ignore - Ignore TypeScript warning about require
      const lighthouse = require('lighthouse');
      logger.info(`Lighthouse from require type: ${typeof lighthouse}`);
      
      if (typeof lighthouse === 'function') {
        logger.info('Using Lighthouse from CommonJS require');
        return lighthouse;
      }
    } catch (err) {
      logger.error(`CommonJS require failed: ${err instanceof Error ? err.message : String(err)}`);
    }
    
    // Try requiring chrome-launcher separately (often needed with Lighthouse)
    try {
      logger.info('Trying to load chrome-launcher');
      // @ts-ignore
      const chromeLauncher = require('chrome-launcher');
      logger.info('Chrome launcher loaded successfully');
    } catch (err) {
      logger.warn(`Failed to load chrome-launcher: ${err instanceof Error ? err.message : String(err)}`);
    }
    
    throw new Error('Could not load Lighthouse function from module');
  } catch (error) {
    logger.error(`Failed to load Lighthouse: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Run Lighthouse audit with proper module loading
 */
export async function runLighthouse(
  url: string,
  options: any
): Promise<RunnerResult> {
  logger.info(`Running Lighthouse audit for ${url} with wrapper`);
  const lighthouse = await getLighthouse();
  logger.info('Lighthouse function loaded, starting audit');
  return lighthouse(url, options);
} 