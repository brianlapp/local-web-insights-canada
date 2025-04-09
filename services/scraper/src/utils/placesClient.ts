import { Client, PlacesNearbyRanking, TextSearchResponse } from '@googlemaps/google-maps-services-js';
import { logger } from './logger.js';
import { placesApiConfig } from './placesApiConfig.js';
import { Coordinates, SubGrid, calculateOptimalGridSystem } from './gridCalculator.js';

/**
 * Interface for business data from Google Places API
 */
export interface PlaceData {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    }
  };
  business_status?: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  website?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  opening_hours?: {
    open_now?: boolean;
    periods?: any[];
    weekday_text?: string[];
  };
  url?: string;
}

/**
 * Delay execution for specified milliseconds
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Class for interacting with Google Places API
 */
export class PlacesClient {
  private client: Client;
  
  constructor() {
    this.client = placesApiConfig.getClient();
  }
  
  /**
   * Find places nearby with pagination support
   */
  async findNearbyPlaces(
    subGrid: SubGrid,
    type: string,
    maxResults: number = 60, // Google Places API has a hard limit of 60 results with pagination
    options: { keyword?: string, rankBy?: PlacesNearbyRanking } = {}
  ): Promise<PlaceData[]> {
    const results: PlaceData[] = [];
    let pageToken: string | undefined;
    let retryCount = 0;
    const maxRetries = 3;
    
    try {
      // Get first page of results
      const initialResponse = await this.findNearbyPlacesPage(
        subGrid.center, 
        subGrid.radius, 
        type, 
        undefined, 
        options
      );
      
      if (!initialResponse) {
        return [];
      }
      
      // Add results from first page
      if (initialResponse.results) {
        results.push(...initialResponse.results);
      }
      
      // Get next page token
      pageToken = initialResponse.next_page_token;
      
      // Continue fetching pages while we have a token and haven't reached max results
      while (pageToken && results.length < maxResults) {
        try {
          // Google requires a delay before using a next_page_token
          await delay(2000);
          
          // Get next page
          const nextPageResponse = await this.findNearbyPlacesPage(
            subGrid.center, 
            subGrid.radius, 
            type, 
            pageToken, 
            options
          );
          
          if (!nextPageResponse) {
            break;
          }
          
          // Add results from next page
          if (nextPageResponse.results) {
            results.push(...nextPageResponse.results);
          }
          
          // Update next page token
          pageToken = nextPageResponse.next_page_token;
          
          // Reset retry count on success
          retryCount = 0;
        } catch (error) {
          logger.error('Error getting next page of results:', error);
          
          // Retry a few times if we encounter an error
          retryCount++;
          if (retryCount > maxRetries) {
            logger.warn(`Max retries (${maxRetries}) reached for pagination`);
            break;
          }
          
          // Wait longer before retrying
          await delay(2000 * retryCount);
        }
      }
      
      return results.slice(0, maxResults);
    } catch (error) {
      logger.error('Error finding nearby places:', error);
      return [];
    }
  }
  
  /**
   * Find a single page of nearby places
   */
  private async findNearbyPlacesPage(
    center: Coordinates,
    radius: number,
    type: string,
    pageToken?: string,
    options: { keyword?: string, rankBy?: PlacesNearbyRanking } = {}
  ): Promise<{
    results: PlaceData[];
    next_page_token?: string;
  } | null> {
    try {
      // Check if we should throttle requests
      if (placesApiConfig.shouldThrottle()) {
        logger.warn('Rate limit approaching, throttling request');
        await delay(1000);
      }
      
      // Track this request with the API config
      placesApiConfig.trackRequest();
      
      // Make the API request
      const response = await this.client.placesNearby({
        params: {
          location: center,
          radius: radius,
          type: type as any,
          keyword: options.keyword,
          rankby: options.rankBy,
          key: placesApiConfig.getCurrentKey(),
          pagetoken: pageToken
        },
        timeout: 5000 // 5 second timeout
      });
      
      if (response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS') {
        return {
          results: response.data.results as PlaceData[],
          next_page_token: response.data.next_page_token
        };
      } else {
        logger.error(`API returned status: ${response.data.status}`, response.data.error_message);
        return null;
      }
    } catch (error) {
      logger.error('Error in findNearbyPlacesPage:', error);
      
      // If we get OVER_QUERY_LIMIT, we should rotate to a different API key
      if (error instanceof Error && error.message.includes('OVER_QUERY_LIMIT')) {
        throw new Error('OVER_QUERY_LIMIT');
      }
      
      return null;
    }
  }
  
  /**
   * Search for places by text query
   */
  async searchPlacesByText(
    query: string,
    center?: Coordinates,
    radius?: number
  ): Promise<PlaceData[]> {
    try {
      // Check if we should throttle
      if (placesApiConfig.shouldThrottle()) {
        logger.warn('Rate limit approaching, throttling request');
        await delay(1000);
      }
      
      // Track this request
      placesApiConfig.trackRequest();
      
      // Make the API request
      const response = await this.client.textSearch({
        params: {
          query,
          location: center,
          radius: radius,
          key: placesApiConfig.getCurrentKey()
        },
        timeout: 5000
      });
      
      if (response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS') {
        return response.data.results as PlaceData[];
      } else {
        logger.error(`API returned status: ${response.data.status}`, response.data.error_message);
        return [];
      }
    } catch (error) {
      logger.error('Error in searchPlacesByText:', error);
      return [];
    }
  }
  
  /**
   * Get details for a specific place
   */
  async getPlaceDetails(placeId: string): Promise<PlaceData | null> {
    try {
      // Check if we should throttle
      if (placesApiConfig.shouldThrottle()) {
        logger.warn('Rate limit approaching, throttling request');
        await delay(1000);
      }
      
      // Track this request
      placesApiConfig.trackRequest();
      
      // Make the API request
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'business_status',
            'formatted_phone_number',
            'international_phone_number',
            'opening_hours',
            'rating',
            'user_ratings_total',
            'types',
            'website',
            'url',
            'vicinity'
          ],
          key: placesApiConfig.getCurrentKey()
        },
        timeout: 5000
      });
      
      if (response.data.status === 'OK') {
        return response.data.result as PlaceData;
      } else {
        logger.error(`API returned status: ${response.data.status}`, response.data.error_message);
        return null;
      }
    } catch (error) {
      logger.error('Error in getPlaceDetails:', error);
      return null;
    }
  }
  
  /**
   * Get API key usage statistics
   */
  getApiKeyStats() {
    return placesApiConfig.getKeyStats();
  }
}

// Create a singleton instance
export const placesClient = new PlacesClient();

// Export for external usage
export default placesClient; 