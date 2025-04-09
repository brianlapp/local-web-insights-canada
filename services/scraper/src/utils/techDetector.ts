import { logger } from './logger.js';
import axios from 'axios';
import { normalizeUrl } from './urlValidator.js';

/**
 * Interface for detected technologies
 */
export interface TechnologyCategory {
  name: string;
  technologies: Technology[];
}

export interface Technology {
  name: string;
  confidence: number;
  version?: string;
  icon?: string;
  website?: string;
  categories?: string[];
}

/**
 * Detect CMS from common patterns
 */
export async function detectCms(url: string): Promise<Technology[]> {
  const normalizedUrl = normalizeUrl(url);
  try {
    // Fetch the HTML content
    const response = await axios.get(normalizedUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LocalWebInsightsBot/1.0; +https://localwebsiteaudit.ca)'
      }
    });
    
    const html = response.data;
    
    const technologies: Technology[] = [];
    
    // WordPress detection
    if (
      html.includes('/wp-content/') ||
      html.includes('/wp-includes/') ||
      html.includes('wp-json') ||
      html.includes('WordPress')
    ) {
      let version: string | undefined;
      const versionMatch = html.match(/meta\s+name="generator"\s+content="WordPress\s+([0-9.]+)/i);
      if (versionMatch) {
        version = versionMatch[1];
      }
      
      technologies.push({
        name: 'WordPress',
        confidence: 80,
        version,
        website: 'https://wordpress.org',
        categories: ['CMS']
      });
    }
    
    // Shopify detection
    if (
      html.includes('cdn.shopify.com') ||
      html.includes('shopify-section') ||
      html.includes('shopify.com')
    ) {
      technologies.push({
        name: 'Shopify',
        confidence: 80,
        website: 'https://shopify.com',
        categories: ['eCommerce', 'CMS']
      });
    }
    
    // Wix detection
    if (
      html.includes('wix.com') ||
      html.includes('wixsite.com') ||
      html.includes('_wixCssModules')
    ) {
      technologies.push({
        name: 'Wix',
        confidence: 80,
        website: 'https://wix.com',
        categories: ['Website Builder', 'CMS']
      });
    }
    
    // Squarespace detection
    if (
      html.includes('squarespace.com') ||
      html.includes('static.squarespace.com') ||
      html.includes('static1.squarespace.com')
    ) {
      technologies.push({
        name: 'Squarespace',
        confidence: 80,
        website: 'https://squarespace.com',
        categories: ['Website Builder', 'CMS']
      });
    }
    
    // Drupal detection
    if (
      html.includes('drupal.js') ||
      html.includes('drupal.min.js') ||
      html.includes('Drupal.settings')
    ) {
      let version: string | undefined;
      const versionMatch = html.match(/meta\s+name="generator"\s+content="Drupal\s+([0-9.]+)/i);
      if (versionMatch) {
        version = versionMatch[1];
      }
      
      technologies.push({
        name: 'Drupal',
        confidence: 80,
        version,
        website: 'https://drupal.org',
        categories: ['CMS']
      });
    }
    
    // Joomla detection
    if (
      html.includes('/media/jui/') ||
      html.includes('/media/system/js/') ||
      html.includes('joomla')
    ) {
      let version: string | undefined;
      const versionMatch = html.match(/meta\s+name="generator"\s+content="Joomla!\s+([0-9.]+)/i);
      if (versionMatch) {
        version = versionMatch[1];
      }
      
      technologies.push({
        name: 'Joomla',
        confidence: 80,
        version,
        website: 'https://joomla.org',
        categories: ['CMS']
      });
    }
    
    return technologies;
  } catch (error) {
    logger.error(`Error detecting CMS for ${normalizedUrl}:`, error);
    return [];
  }
}

/**
 * Detect JavaScript frameworks from common patterns
 */
export async function detectJsFrameworks(url: string): Promise<Technology[]> {
  const normalizedUrl = normalizeUrl(url);
  try {
    // Fetch the HTML content
    const response = await axios.get(normalizedUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LocalWebInsightsBot/1.0; +https://localwebsiteaudit.ca)'
      }
    });
    
    const html = response.data;
    
    const technologies: Technology[] = [];
    
    // React detection
    if (
      html.includes('react.') ||
      html.includes('react-dom.') ||
      html.includes('data-reactroot') ||
      html.includes('__REACT_ROOT_ID__')
    ) {
      technologies.push({
        name: 'React',
        confidence: 80,
        website: 'https://reactjs.org',
        categories: ['JavaScript Framework']
      });
    }
    
    // Vue detection
    if (
      html.includes('vue.js') ||
      html.includes('vue.min.js') ||
      html.includes('__vue__') ||
      html.includes('v-app')
    ) {
      technologies.push({
        name: 'Vue.js',
        confidence: 80,
        website: 'https://vuejs.org',
        categories: ['JavaScript Framework']
      });
    }
    
    // Angular detection
    if (
      html.includes('angular.js') ||
      html.includes('angular.min.js') ||
      html.includes('ng-app') ||
      html.includes('ng-controller')
    ) {
      let version: string | undefined;
      if (html.includes('angular2') || html.includes('@angular/core')) {
        version = '2+';
        technologies.push({
          name: 'Angular',
          confidence: 80,
          version,
          website: 'https://angular.io',
          categories: ['JavaScript Framework']
        });
      } else {
        version = '1.x';
        technologies.push({
          name: 'AngularJS',
          confidence: 80,
          version,
          website: 'https://angularjs.org',
          categories: ['JavaScript Framework']
        });
      }
    }
    
    // jQuery detection
    if (
      html.includes('jquery') ||
      html.includes('jQuery')
    ) {
      let version: string | undefined;
      const versionMatch = html.match(/jquery[.-]([0-9.]+)(?:\.min)?\.js/i);
      if (versionMatch) {
        version = versionMatch[1];
      }
      
      technologies.push({
        name: 'jQuery',
        confidence: 80,
        version,
        website: 'https://jquery.com',
        categories: ['JavaScript Library']
      });
    }
    
    return technologies;
  } catch (error) {
    logger.error(`Error detecting JS frameworks for ${normalizedUrl}:`, error);
    return [];
  }
}

/**
 * Detect analytics and marketing tools from common patterns
 */
export async function detectAnalyticsTools(url: string): Promise<Technology[]> {
  const normalizedUrl = normalizeUrl(url);
  try {
    // Fetch the HTML content
    const response = await axios.get(normalizedUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LocalWebInsightsBot/1.0; +https://localwebsiteaudit.ca)'
      }
    });
    
    const html = response.data;
    
    const technologies: Technology[] = [];
    
    // Google Analytics detection
    if (
      html.includes('google-analytics.com/analytics.js') ||
      html.includes('ga.js') ||
      html.includes('gtag')
    ) {
      technologies.push({
        name: 'Google Analytics',
        confidence: 90,
        website: 'https://analytics.google.com',
        categories: ['Analytics']
      });
    }
    
    // Google Tag Manager detection
    if (
      html.includes('googletagmanager.com') ||
      html.includes('gtm.js')
    ) {
      technologies.push({
        name: 'Google Tag Manager',
        confidence: 90,
        website: 'https://tagmanager.google.com',
        categories: ['Tag Manager']
      });
    }
    
    // Facebook Pixel detection
    if (
      html.includes('connect.facebook.net') ||
      html.includes('fbevents.js') ||
      html.includes('facebook-jssdk')
    ) {
      technologies.push({
        name: 'Facebook Pixel',
        confidence: 80,
        website: 'https://www.facebook.com/business/help/952192354843755',
        categories: ['Analytics', 'Marketing']
      });
    }
    
    // HubSpot detection
    if (
      html.includes('js.hs-scripts.com') ||
      html.includes('js.hubspot.com') ||
      html.includes('hs-analytics')
    ) {
      technologies.push({
        name: 'HubSpot',
        confidence: 80,
        website: 'https://hubspot.com',
        categories: ['Marketing Automation', 'Analytics']
      });
    }
    
    return technologies;
  } catch (error) {
    logger.error(`Error detecting analytics tools for ${normalizedUrl}:`, error);
    return [];
  }
}

/**
 * Categorize detected technologies
 */
export function categorizeTechnologies(technologies: Technology[]): TechnologyCategory[] {
  const categories: Record<string, Technology[]> = {};
  
  // Group technologies by category
  for (const tech of technologies) {
    for (const category of tech.categories || ['Unknown']) {
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(tech);
    }
  }
  
  // Convert to array format
  return Object.entries(categories).map(([name, techs]) => ({
    name,
    technologies: techs
  }));
}

/**
 * Main function to detect all technologies
 */
export async function detectTechnologies(url: string): Promise<TechnologyCategory[]> {
  try {
    // Run all detection methods in parallel
    const [cms, jsFrameworks, analyticsTools] = await Promise.all([
      detectCms(url),
      detectJsFrameworks(url),
      detectAnalyticsTools(url)
    ]);
    
    // Combine all detected technologies
    const allTechnologies = [...cms, ...jsFrameworks, ...analyticsTools];
    
    // Categorize the technologies
    return categorizeTechnologies(allTechnologies);
  } catch (error) {
    logger.error(`Error detecting technologies for ${url}:`, error);
    return [];
  }
} 