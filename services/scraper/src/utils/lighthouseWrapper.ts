/**
 * Lighthouse Wrapper
 * 
 * This wrapper handles the compatibility issues between ESM and CommonJS modules
 * for Lighthouse. It provides a consistent interface regardless of how the module
 * is loaded.
 */

import { launch } from 'puppeteer';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { Page } from 'puppeteer';
// Import types dynamically to handle CJS/ESM issues
// import type { LH } from 'lighthouse';
import { logger } from './logger.js';

// Type for the lighthouse function, assuming dynamic import
// We'll use 'any' for now to avoid complex type issues with dynamic imports
type LighthouseFunction = (url?: string, flags?: any, config?: any, page?: Page) => Promise<any | undefined>;

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
 * Runs Lighthouse audit on a given URL.
 */
export const runLighthouse = async (
  url: string,
  options: any = {},
  config: any = null
): Promise<any | undefined> => {
  let browser = null;
  const tempProfileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lighthouse-profile-'));

  try {
    // Dynamically import Lighthouse
    const { default: lighthouse } = await import('lighthouse');
    const lighthouseFunction = lighthouse as unknown as LighthouseFunction;

    // Use Puppeteer to control Chrome
    browser = await launch({
      headless: true, // Run in headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      userDataDir: tempProfileDir,
    });

    const flags: any = {
      port: +(new URL(browser.wsEndpoint())).port, // Ensure port is a number
      output: 'json', // Output format
      logLevel: 'info',
      ...options, // Allow overriding default flags
    };

    // Run Lighthouse
    const runnerResult = await lighthouseFunction(url, flags, config || undefined);
    
    return runnerResult;

  } catch (error) {
    logger.error('Error running Lighthouse:', error);
    return undefined;
  } finally {
    if (browser) {
      await browser.close();
    }
    // Clean up temporary profile directory
    try {
      fs.rmSync(tempProfileDir, { recursive: true, force: true });
    } catch (e: any) {
      logger.error(`Error removing temporary profile directory ${tempProfileDir}:`, e);
    }
  }
}; 