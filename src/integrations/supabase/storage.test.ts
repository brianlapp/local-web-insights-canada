import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from './client'
import { uploadFile, updateFilePermissions, getPublicUrl, deleteFile } from './storage'

// Mock the Supabase client
vi.mock('./client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
        move: vi.fn(),
        remove: vi.fn(),
      })),
    },
  },
}))

describe('Storage Operations', () => {
  const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
  const mockPath = 'test/test.txt'
  const mockBucket = 'business-assets'
  const mockPublicUrl = 'https://example.com/public/test.txt'

  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('File Upload', () => {
    it('successfully uploads a file and returns public URL', async () => {
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

      const result = await uploadFile(mockFile)

      expect(supabase.storage.from).toHaveBeenCalledWith(mockBucket)
      expect(mockStorageApi.upload).toHaveBeenCalledWith(
        expect.stringContaining(mockFile.name),
        mockFile,
        { upsert: true }
      )
      expect(result).toBe(mockPublicUrl)
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

      await expect(uploadFile(mockFile)).rejects.toThrow('Upload failed')
    })
  })

  describe('File Permissions', () => {
    it('successfully moves file to public directory', async () => {
      const mockStorageApi = {
        move: vi.fn().mockResolvedValue({ error: null }),
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageApi as any)

      await updateFilePermissions(mockPath, 'public')

      expect(supabase.storage.from).toHaveBeenCalledWith(mockBucket)
      expect(mockStorageApi.move).toHaveBeenCalledWith(
        mockPath,
        'public/test/test.txt'
      )
    })

    it('successfully moves file to private directory', async () => {
      const mockStorageApi = {
        move: vi.fn().mockResolvedValue({ error: null }),
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageApi as any)

      await updateFilePermissions(mockPath, 'private')

      expect(supabase.storage.from).toHaveBeenCalledWith(mockBucket)
      expect(mockStorageApi.move).toHaveBeenCalledWith(
        mockPath,
        'private/test/test.txt'
      )
    })

    it('handles move operation errors', async () => {
      const mockError = {
        message: 'Move operation failed',
        statusCode: 403,
      }

      const mockStorageApi = {
        move: vi.fn().mockResolvedValue({ error: mockError }),
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageApi as any)

      await expect(
        updateFilePermissions(mockPath, 'public')
      ).rejects.toThrow('Move operation failed')
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

      const result = getPublicUrl(mockPath)

      expect(supabase.storage.from).toHaveBeenCalledWith(mockBucket)
      expect(mockStorageApi.getPublicUrl).toHaveBeenCalledWith(mockPath)
      expect(result).toBe(mockPublicUrl)
    })
  })

  describe('File Deletion', () => {
    it('successfully deletes a file', async () => {
      const mockStorageApi = {
        remove: vi.fn().mockResolvedValue({ error: null }),
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageApi as any)

      await deleteFile(mockPath)

      expect(supabase.storage.from).toHaveBeenCalledWith(mockBucket)
      expect(mockStorageApi.remove).toHaveBeenCalledWith([mockPath])
    })

    it('handles deletion errors', async () => {
      const mockError = {
        message: 'Deletion failed',
        statusCode: 404,
      }

      const mockStorageApi = {
        remove: vi.fn().mockResolvedValue({ error: mockError }),
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageApi as any)

      await expect(deleteFile(mockPath)).rejects.toThrow('Deletion failed')
    })
  })
}) 