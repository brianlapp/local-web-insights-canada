import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from './client'
import { fetchAuditDataWithRLS, updateAuditDataWithRLS } from './database'
import type { AuditData } from '@/lib/api'
import type { User, Session } from '@supabase/supabase-js'

// Mock the Supabase client
vi.mock('./client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      update: vi.fn(),
      eq: vi.fn(),
    })),
    auth: {
      getSession: vi.fn(),
    },
  },
}))

describe('Database Queries with RLS', () => {
  const mockAuditData: AuditData = {
    score: 85,
    metrics: {
      performance: 90,
      accessibility: 85,
      seo: 80,
      bestPractices: 85,
    },
    recommendations: [
      { id: 1, category: 'SEO', description: 'Add meta descriptions' },
    ],
    lastUpdated: new Date().toISOString(),
  }

  const mockAuditorUser: User = {
    id: 'auditor-123',
    email: 'auditor@example.com',
    user_metadata: {
      role: 'auditor',
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    role: 'authenticated',
    updated_at: new Date().toISOString(),
  }

  const mockBusinessOwnerUser: User = {
    id: 'owner-123',
    email: 'owner@example.com',
    user_metadata: {
      role: 'business_owner',
      business_id: 'test-business',
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    role: 'authenticated',
    updated_at: new Date().toISOString(),
  }

  const mockSession: Session = {
    user: mockAuditorUser,
    access_token: 'mock-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
  }

  const mockBusinessOwnerSession: Session = {
    ...mockSession,
    user: mockBusinessOwnerUser,
  }

  describe('Auditor Role', () => {
    beforeEach(() => {
      // Mock authenticated auditor session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: mockSession,
        },
        error: null,
      })
    })

    it('allows auditors to fetch audit data', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: [mockAuditData],
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        update: vi.fn(),
        eq: vi.fn(),
      } as any)

      const result = await fetchAuditDataWithRLS('test-business')

      expect(result).toEqual(mockAuditData)
      expect(supabase.from).toHaveBeenCalledWith('audits')
      expect(mockSelect).toHaveBeenCalled()
    })

    it('allows auditors to update audit data', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        data: mockAuditData,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(),
        update: mockUpdate,
        eq: vi.fn().mockReturnThis(),
      } as any)

      await updateAuditDataWithRLS('test-business', mockAuditData)

      expect(supabase.from).toHaveBeenCalledWith('audits')
      expect(mockUpdate).toHaveBeenCalledWith(mockAuditData)
    })
  })

  describe('Business Owner Role', () => {
    beforeEach(() => {
      // Mock authenticated business owner session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: mockBusinessOwnerSession,
        },
        error: null,
      })
    })

    it('allows owners to fetch their own audit data', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: [mockAuditData],
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        update: vi.fn(),
        eq: vi.fn(),
      } as any)

      const result = await fetchAuditDataWithRLS('test-business')

      expect(result).toEqual(mockAuditData)
      expect(supabase.from).toHaveBeenCalledWith('audits')
    })

    it('prevents owners from fetching other businesses audit data', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Row level security policy violation', code: '42501' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        update: vi.fn(),
        eq: vi.fn(),
      } as any)

      await expect(fetchAuditDataWithRLS('other-business')).rejects.toThrow(
        'Row level security policy violation'
      )
    })

    it('prevents owners from updating audit data', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Row level security policy violation', code: '42501' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(),
        update: mockUpdate,
        eq: vi.fn().mockReturnThis(),
      } as any)

      await expect(
        updateAuditDataWithRLS('test-business', mockAuditData)
      ).rejects.toThrow('Row level security policy violation')
    })
  })

  describe('Unauthenticated Access', () => {
    beforeEach(() => {
      // Mock unauthenticated session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      })
    })

    it('prevents unauthenticated access to audit data', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Authentication required', code: '42501' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        update: vi.fn(),
        eq: vi.fn(),
      } as any)

      await expect(fetchAuditDataWithRLS('test-business')).rejects.toThrow(
        'Authentication required'
      )
    })
  })
}) 