
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from './client'
import { uploadFile, deleteFile, getFileUrl, getPublicUrl, updateFilePermissions } from './storage'

// Mock the Supabase client
vi.mock('./client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
        remove: vi.fn(),
        download: vi.fn(),
      })),
    },
  },
}))

describe('Storage Operations', () => {
  const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
  const mockPath = 'test/test.txt'
  const mockBucket = 'public'
  const mockPublicUrl = 'https://example.com/public/test.txt'

  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('File Upload', () => {
    it('successfully uploads a file', async () => {
      const mockUploadResponse = {
        data: { path: mockPath },
        error: null,
      }

      const mockUrlResponse = {
        data: { publicUrl: mockPublicUrl },
      }

      const mockStorageApi = {
        upload: vi.fn().mockResolvedValue(mockUploadResponse),
        getPublicUrl: vi.fn().mockReturnValue(mockUrlResponse),
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageApi as any)

      const result = await uploadFile(mockFile, mockPath, mockBucket)

      expect(supabase.storage.from).toHaveBeenCalledWith(mockBucket)
      expect(mockStorageApi.upload).toHaveBeenCalledWith(
        mockPath,
        mockFile
      )
      expect(result.data).toEqual({ path: mockPath })
    })

    it('handles upload errors', async () => {
      const mockError = {
        message: 'Upload failed',
        statusCode: 500,
      }

      const mockStorageApi = {
        upload: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageApi as any)

      const result = await uploadFile(mockFile, mockPath, mockBucket)
      expect(result.error).toEqual(mockError)
    })
  })

  describe('File Permissions', () => {
    it('updates file permissions to public', async () => {
      const mockStorageApi = {
        // No actual implementation needed for this mock
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageApi as any)

      const result = await updateFilePermissions(mockPath, true, mockBucket)

      expect(supabase.storage.from).toHaveBeenCalledWith(mockBucket)
      expect(result.data).toEqual({
        path: mockPath,
        isPublic: true,
        success: true
      })
    })

    it('updates file permissions to private', async () => {
      const mockStorageApi = {
        // No actual implementation needed for this mock
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageApi as any)

      const result = await updateFilePermissions(mockPath, false, mockBucket)

      expect(supabase.storage.from).toHaveBeenCalledWith(mockBucket)
      expect(result.data).toEqual({
        path: mockPath,
        isPublic: false,
        success: true
      })
    })
  })

  describe('Public URL Generation', () => {
    it('returns public URL for a file', () => {
      const mockStorageApi = {
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: mockPublicUrl },
        }),
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageApi as any)

      const result = getPublicUrl(mockPath, mockBucket)

      expect(supabase.storage.from).toHaveBeenCalledWith(mockBucket)
      expect(mockStorageApi.getPublicUrl).toHaveBeenCalledWith(mockPath)
      expect(result).toBe(mockPublicUrl)
    })
    
    it('returns file URL with error handling', async () => {
      const mockStorageApi = {
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: mockPublicUrl },
        }),
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageApi as any)

      const result = await getFileUrl(mockPath, mockBucket)

      expect(supabase.storage.from).toHaveBeenCalledWith(mockBucket)
      expect(mockStorageApi.getPublicUrl).toHaveBeenCalledWith(mockPath)
      expect(result).toEqual({ publicUrl: mockPublicUrl, error: null })
    })
  })

  describe('File Deletion', () => {
    it('successfully deletes a file', async () => {
      const mockStorageApi = {
        remove: vi.fn().mockResolvedValue({ data: {}, error: null }),
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageApi as any)

      const result = await deleteFile(mockPath, mockBucket)

      expect(supabase.storage.from).toHaveBeenCalledWith(mockBucket)
      expect(mockStorageApi.remove).toHaveBeenCalledWith([mockPath])
      expect(result.error).toBeNull()
    })

    it('handles deletion errors', async () => {
      const mockError = {
        message: 'Deletion failed',
        statusCode: 404,
      }

      const mockStorageApi = {
        remove: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageApi as any)

      const result = await deleteFile(mockPath, mockBucket)
      expect(result.error).toEqual(mockError)
    })
  })
})
