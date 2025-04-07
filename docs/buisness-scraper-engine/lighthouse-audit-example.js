// Website Audit Service Implementation Example

import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';
import axios from 'axios';
import Queue from 'bull';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from '@google-cloud/storage';

// Initialize clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

// Create audit queue
const auditQueue = new Queue('website-audit', process.env.REDIS_URL);

// Run Lighthouse audit
async function runLighthouseAudit(url) {
  console.log(`Running Lighthouse audit for ${url}`);
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
  });
  
  try {
    const results = await lighthouse(url, {
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      output: 'json',
    });
    
    return {
      scores: {
        performance: results.lhr.categories.performance.score * 100,
        accessibility: results.lhr.categories.accessibility.score * 100,
        bestPractices: results.lhr.categories['best-practices'].score * 100,
        seo: results.lhr.categories.seo.score * 100
      },
      audits: results.lhr.audits,
      fullReport: results.lhr
    };
  } finally {
    await chrome.kill();
  }
}

// Capture screenshots (desktop and mobile)
async function captureScreenshots(url) {
  console.log(`Capturing screenshots for ${url}`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Desktop screenshot
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1280, height: 800 });
    await desktopPage.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const desktopPath = path.join('/tmp', `${uuidv4()}-desktop.png`);
    await desktopPage.screenshot({ path: desktopPath, fullPage: false });
    
    // Mobile screenshot
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 375, height: 667 });
    await mobilePage.emulate(puppeteer.devices['iPhone X']);
    await mobilePage.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const mobilePath = path.join('/tmp', `${uuidv4()}-mobile.png`);
    await mobilePage.screenshot({ path: mobilePath, fullPage: false });
    
    // Upload screenshots to storage
    const desktopUpload = await bucket.upload(desktopPath, {
      destination: `screenshots/${path.basename(desktopPath)}`,
      metadata: {
        contentType: 'image/png'
      }
    });
    
    const mobileUpload = await bucket.upload(mobilePath, {
      destination: `screenshots/${path.basename(mobilePath)}`,
      metadata: {
        contentType: 'image/png'
      }
    });
    
    // Make files public and get URLs
    await desktopUpload[0].makePublic();
    await mobileUpload[0].makePublic();
    
    const desktopUrl = `https://storage.googleapis.com/${bucket.name}/${desktopUpload[0].name}`;
    const mobileUrl = `https://storage.googleapis.com/${bucket.name}/${mobileUpload[0].name}`;
    
    // Clean up temp files
    fs.unlinkSync(desktopPath);
    fs.unlinkSync(mobilePath);
    
    return {
      desktop: desktopUrl,
      mobile: mobileUrl
    };
  } finally {
    await browser.close();
  }
}

// Detect technology stack using WhatRuns or similar API
async function detectTechnologyStack(url) {
  try {
    // This is a placeholder - you would replace with actual API call
    // to a service like WhatRuns, BuiltWith, or Wappalyzer
    const response = await axios.get(`https://api.madewidth.api/v1/lookup?url=${encodeURIComponent(url)}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MADEWITH_API_KEY}`
      }
    });
    
    return response.data.technologies || [];
  } catch (error) {
    console.error(`Error detecting technology stack for ${url}:`, error);
    return [];
  }
}

// Generate recommendations based on audit results
function generateRecommendations(lighthouseData) {
  const recommendations = [];
  const audits = lighthouseData.audits;
  
  // Performance recommendations
  if (audits['render-blocking-resources'] && !audits['render-blocking-resources'].score) {
    recommendations.push('Eliminate render-blocking resources to improve page load time');
  }
  
  if (audits['unminified-css'] && !audits['unminified-css'].score) {
    recommendations.push('Minify CSS to reduce file size and improve loading speed');
  }
  
  if (audits['uses-responsive-images'] && !audits['uses-responsive-images'].score) {
    recommendations.push('Use responsive images to improve mobile experience and load times');
  }
  
  // SEO recommendations
  if (audits['meta-description'] && !audits['meta-description'].score) {
    recommendations.push('Add a meta description to improve search engine results');
  }
  
  if (audits['document-title'] && !audits['document-title'].score) {
    recommendations.push('Add a proper document title for better SEO');
  }
  
  // Accessibility recommendations
  if (audits['image-alt'] && !audits['image-alt'].score) {
    recommendations.push('Add alt text to images to improve accessibility');
  }
  
  if (audits['color-contrast'] && !audits['color-contrast'].score) {
    recommendations.push('Improve color contrast for better readability and accessibility');
  }
  
  // Best practices
  if (audits['uses-https'] && !audits['uses-https'].score) {
    recommendations.push('Implement HTTPS to secure your website and improve trust');
  }
  
  if (audits['errors-in-console'] && !audits['errors-in-console'].score) {
    recommendations.push('Fix JavaScript errors that appear in the browser console');
  }
  
  // General recommendations based on overall scores
  if (lighthouseData.scores.performance < 50) {
    recommendations.push('Your website is very slow. Consider a complete performance overhaul or new website development');
  }
  
  if (lighthouseData.scores.seo < 60) {
    recommendations.push('Your SEO score is low. This may be affecting your search engine rankings');
  }
  
  if (lighthouseData.scores.bestPractices < 60) {
    recommendations.push('Your website does not follow modern web best practices. Consider updating your development approach');
  }
  
  return recommendations;
}

// Calculate overall website score
function calculateOverallScore(lighthouseData) {
  const weights = {
    performance: 0.35,
    seo: 0.30,
    bestPractices: 0.20,
    accessibility: 0.15
  };
  
  const scores = lighthouseData.scores;
  let overallScore = 0;
  
  for (const [category, weight] of Object.entries(weights)) {
    overallScore += scores[category] * weight;
  }
  
  return Math.round(overallScore);
}

// Process website audit request
auditQueue.process('audit-website', async (job) => {
  const { businessId, url } = job.data;
  console.log(`Processing audit for business ${businessId} with URL ${url}`);
  
  try {
    // Run Lighthouse audit
    const lighthouseData = await runLighthouseAudit(url);
    
    // Capture screenshots
    const screenshots = await captureScreenshots(url);
    
    // Detect technology stack
    const techStack = await detectTechnologyStack(url);
    
    // Generate recommendations
    const recommendations = generateRecommendations(lighthouseData);
    
    // Calculate overall score
    const overallScore = calculateOverallScore(lighthouseData);
    
    // Store audit data
    const { data: auditData, error } = await supabase
      .from('website_audits')
      .insert({
        business_id: businessId,
        lighthouse_data: lighthouseData.fullReport,
        technology_stack: techStack,
        screenshots: screenshots,
        scores: {
          overall: overallScore,
          performance: lighthouseData.scores.performance,
          accessibility: lighthouseData.scores.accessibility,
          bestPractices: lighthouseData.scores.bestPractices,
          seo: lighthouseData.scores.seo
        },
        recommendations: recommendations,
        audit_date: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error(`Error storing audit data for business ${businessId}:`, error);
      throw error;
    }
    
    // Update business with latest scores
    await supabase
      .from('businesses')
      .update({
        latest_audit_id: auditData.id,
        overall_score: overallScore,
        needs_improvement: overallScore < 70
      })
      .eq('id', businessId);
    
    return {
      status: 'completed',
      businessId,
      auditId: auditData.id,
      overallScore
    };
  } catch (error) {
    console.error(`Audit failed for business ${businessId}:`, error);
    
    // Record the failure
    await supabase
      .from('audit_errors')
      .insert({
        business_id: businessId,
        url,
        error: error.message,
        occurred_at: new Date().toISOString()
      });
      
    throw error;
  }
});

// Schedule audits for all businesses
async function scheduleAuditsForAllBusinesses() {
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, website')
    .not('website', 'is', null);
    
  if (error) {
    console.error('Error fetching businesses:', error);
    return;
  }
  
  console.log(`Scheduling audits for ${businesses.length} businesses`);
  
  for (const business of businesses) {
    await auditQueue.add('audit-website', {
      businessId: business.id,
      url: business.website
    }, {
      attempts: