import { supabase } from './client'
import type { StorageError as SupabaseStorageError } from '@supabase/storage-js'

export interface UploadOptions {
  bucket?: string
  path?: string
  visibility?: 'public' | 'private'
  upsert?: boolean
}

export interface CustomStorageError extends Error {
  statusCode?: number
}

const DEFAULT_BUCKET = 'business-assets'
const DEFAULT_OPTIONS: UploadOptions = {
  bucket: DEFAULT_BUCKET,
  visibility: 'public',
  upsert: true
}

/**
 * Uploads a file to Supabase Storage
 * @param file The file to upload
 * @param options Upload configuration options
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<string> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options }
  const { bucket, path, upsert } = finalOptions

  // Generate a unique file path if not provided
  const filePath = path || `${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from(bucket!)
    .upload(filePath, file, { upsert })

  if (error) {
    const storageError = new Error(error.message) as CustomStorageError
    storageError.statusCode = (error as SupabaseStorageError).statusCode
    throw storageError
  }

  if (!data) {
    throw new Error('Upload failed: No data returned')
  }

  // Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from(bucket!)
    .getPublicUrl(data.path)

  return publicUrl
}

/**
 * Updates file permissions in Supabase Storage
 * @param path Path to the file
 * @param visibility New visibility setting
 * @param bucket Storage bucket name
 */
export async function updateFilePermissions(
  path: string,
  visibility: 'public' | 'private',
  bucket: string = DEFAULT_BUCKET
): Promise<void> {
  // Note: Supabase Storage v2 doesn't support direct permission updates
  // Files are public by default when uploaded to a public bucket
  // To make a file private, you need to move it to a private bucket
  const { error } = await supabase.storage
    .from(bucket)
    .move(path, `${visibility}/${path}`)

  if (error) {
    const storageError = new Error(error.message) as CustomStorageError
    storageError.statusCode = (error as SupabaseStorageError).statusCode
    throw storageError
  }
}

/**
 * Generates a public URL for a file in storage
 * @param path Path to the file
 * @param bucket Storage bucket name
 * @returns Public URL of the file
 */
export function getPublicUrl(
  path: string,
  bucket: string = DEFAULT_BUCKET
): string {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}

/**
 * Deletes a file from storage
 * @param path Path to the file
 * @param bucket Storage bucket name
 */
export async function deleteFile(
  path: string,
  bucket: string = DEFAULT_BUCKET
): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    const storageError = new Error(error.message) as CustomStorageError
    storageError.statusCode = (error as SupabaseStorageError).statusCode
    throw storageError
  }
} 