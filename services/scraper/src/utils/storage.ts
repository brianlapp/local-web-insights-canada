
import { createClient } from '@supabase/supabase-js';
import { Storage } from '@google-cloud/storage';
import { logger } from './logger';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Initialize GCS client
let storage: Storage | null = null;
let gcsBucketName: string | null = null;

/**
 * Initialize the storage services (Supabase and/or GCS)
 */
export const initializeStorage = () => {
  // Check and initialize Supabase
  if (!supabaseUrl || !supabaseKey) {
    logger.warn('Supabase environment variables not set, screenshot storage to Supabase will be disabled');
  }
  
  // Check and initialize GCS
  const gcsCredentials = process.env.GCS_CREDENTIALS;
  gcsBucketName = process.env.GCS_BUCKET_NAME;
  
  if (!gcsCredentials || !gcsBucketName) {
    logger.warn('GCS environment variables not set, screenshot storage to GCS will be disabled');
  } else {
    try {
      // Create a temporary credentials file
      const tmpDir = os.tmpdir();
      const credentialsPath = path.join(tmpDir, 'gcs-credentials.json');
      
      fs.writeFileSync(credentialsPath, gcsCredentials);
      
      // Initialize GCS with the credentials file
      storage = new Storage({
        keyFilename: credentialsPath
      });
      
      logger.info(`GCS storage initialized with bucket: ${gcsBucketName}`);
    } catch (error) {
      logger.error('Failed to initialize GCS storage:', error);
      storage = null;
    }
  }
};

/**
 * Upload a screenshot to the storage service
 */
export const uploadScreenshot = async (
  businessId: string,
  screenshotType: 'desktop' | 'mobile',
  screenshotPath: string
): Promise<string | null> => {
  try {
    // Try to upload to GCS first if configured
    if (storage && gcsBucketName) {
      return await uploadToGCS(businessId, screenshotType, screenshotPath);
    }
    
    // Fall back to Supabase if GCS is not available
    if (supabaseUrl && supabaseKey) {
      return await uploadToSupabase(businessId, screenshotType, screenshotPath);
    }
    
    // If neither is configured, log an error
    logger.error('No storage service configured for screenshots');
    return null;
  } catch (error) {
    logger.error('Failed to upload screenshot:', error);
    return null;
  }
};

/**
 * Upload a screenshot to Google Cloud Storage
 */
const uploadToGCS = async (
  businessId: string,
  screenshotType: 'desktop' | 'mobile',
  screenshotPath: string
): Promise<string | null> => {
  try {
    if (!storage || !gcsBucketName) {
      throw new Error('GCS storage not initialized');
    }
    
    const bucket = storage.bucket(gcsBucketName);
    const fileName = `screenshots/${businessId}/${screenshotType}_${Date.now()}.png`;
    
    await bucket.upload(screenshotPath, {
      destination: fileName,
      metadata: {
        contentType: 'image/png',
      },
    });
    
    // Make the file publicly accessible
    await bucket.file(fileName).makePublic();
    
    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${gcsBucketName}/${fileName}`;
    logger.info(`Screenshot uploaded to GCS: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    logger.error('Error uploading to GCS:', error);
    return null;
  }
};

/**
 * Upload a screenshot to Supabase Storage
 */
const uploadToSupabase = async (
  businessId: string,
  screenshotType: 'desktop' | 'mobile',
  screenshotPath: string
): Promise<string | null> => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase client not initialized');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const bucketName = 'screenshots';
    
    // Check if the bucket exists, create if it doesn't
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      throw new Error(`Failed to list Supabase buckets: ${bucketsError.message}`);
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error: createBucketError } = await supabase
        .storage
        .createBucket(bucketName, {
          public: true
        });
      
      if (createBucketError) {
        throw new Error(`Failed to create Supabase bucket: ${createBucketError.message}`);
      }
      
      logger.info(`Created Supabase storage bucket: ${bucketName}`);
    }
    
    // Read the file
    const fileData = fs.readFileSync(screenshotPath);
    
    // Upload the file
    const filePath = `${businessId}/${screenshotType}_${Date.now()}.png`;
    const { error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, fileData, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (uploadError) {
      throw new Error(`Failed to upload to Supabase: ${uploadError.message}`);
    }
    
    // Get the public URL
    const { data: publicUrl } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    logger.info(`Screenshot uploaded to Supabase: ${publicUrl.publicUrl}`);
    
    return publicUrl.publicUrl;
  } catch (error) {
    logger.error('Error uploading to Supabase:', error);
    return null;
  }
};

// Initialize storage on module load
initializeStorage();
