
import { supabase } from './client';
import type { StorageErrorMock } from './schema';

/**
 * Uploads a file to the specified bucket
 * @param bucketName - The name of the storage bucket
 * @param filePath - The path where the file will be stored in the bucket
 * @param file - The file to upload
 * @returns The public URL of the uploaded file or null if error
 */
export async function uploadFile(bucketName: string, filePath: string, file: File) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    
    return getPublicUrl(bucketName, data.path);
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

/**
 * Gets the public URL for a file
 * @param bucketName - The name of the storage bucket
 * @param filePath - The path of the file in the bucket
 * @returns The public URL of the file
 */
export function getPublicUrl(bucketName: string, filePath: string) {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Updates file permissions to make it publicly accessible or private
 * @param bucketName - The name of the storage bucket
 * @param filePath - The path of the file in the bucket
 * @param isPublic - Whether the file should be publicly accessible
 */
export async function updateFilePermissions(bucketName: string, filePath: string, isPublic: boolean) {
  try {
    // Update permissions based on isPublic flag
    if (isPublic) {
      await supabase.storage.from(bucketName).makePublic(filePath);
    } else {
      await supabase.storage.from(bucketName).makePrivate(filePath);
    }
    return true;
  } catch (error) {
    console.error('Error updating file permissions:', error);
    return false;
  }
}

/**
 * Deletes a file from storage
 * @param bucketName - The name of the storage bucket
 * @param filePath - The path of the file to delete
 */
export async function deleteFile(bucketName: string, filePath: string) {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Lists all files in a bucket or folder
 * @param bucketName - The name of the storage bucket
 * @param folderPath - Optional folder path to list files from
 */
export async function listFiles(bucketName: string, folderPath?: string) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath || '');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}
