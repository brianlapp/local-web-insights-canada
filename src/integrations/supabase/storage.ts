
import { supabase } from './client';
import { getStorageErrorStatus } from './storage-utils';

/**
 * Upload a file to Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path within the bucket
 * @param file - File to upload
 * @returns Uploaded file URL
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  try {
    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === bucket);

    if (!bucketExists) {
      await supabase.storage.createBucket(bucket, {
        public: true,
      });
    }

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw new Error(
        `Failed to upload file: ${error.message} (${getStorageErrorStatus(error)})`
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Upload file error:', error);
    throw error;
  }
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path within the bucket
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      throw new Error(
        `Failed to delete file: ${error.message} (${getStorageErrorStatus(error)})`
      );
    }
  } catch (error) {
    console.error('Delete file error:', error);
    throw error;
  }
}

/**
 * List all files in a bucket directory
 * @param bucket - Storage bucket name
 * @param path - Directory path within the bucket
 * @returns Array of file paths
 */
export async function listFiles(
  bucket: string,
  path: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(path);

    if (error) {
      console.error('Error listing files:', error);
      throw new Error(
        `Failed to list files: ${error.message} (${getStorageErrorStatus(error)})`
      );
    }

    return data.map((file) => file.name);
  } catch (error) {
    console.error('List files error:', error);
    throw error;
  }
}
