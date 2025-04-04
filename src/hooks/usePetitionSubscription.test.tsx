import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { supabase } from '@/integrations/supabase/client'
import { usePetitionSubscription } from './usePetitionSubscription'
import type { RealtimeChannel, RealtimeChannelOptions } from '@supabase/supabase-js'

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: vi.fn((name: string, opts: RealtimeChannelOptions) => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue(null),
      unsubscribe: vi.fn().mockResolvedValue(null),
    } as unknown as RealtimeChannel)),
  },
}))

describe('usePetitionSubscription Hook', () => {
  const petitionSlug = 'test-petition'
  const mockSignature = {
    id: 'sig-123',
    petition_id: 'pet-123',
    name: 'John Doe',
    email: 'john@example.com',
    created_at: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('subscribes to petition signature updates on mount', async () => {
    const { result } = renderHook(() => usePetitionSubscription(petitionSlug))

    expect(supabase.channel).toHaveBeenCalledWith(
      `petition-${petitionSlug}`,
      expect.objectContaining({
        config: {
          broadcast: { self: true },
        },
      })
    )
    expect(result.current.isSubscribed).toBe(true)
  })

  it('updates signature count when new signature is received', async () => {
    const { result } = renderHook(() => usePetitionSubscription(petitionSlug))

    // Get the subscription callback
    const channel = vi.mocked(supabase.channel).mock.results[0].value
    const onChangeCallback = vi.mocked(channel.on).mock.calls.find(
      ([event]) => event === 'postgres_changes'
    )?.[2]

    // Simulate new signature
    if (onChangeCallback) {
      onChangeCallback('INSERT', { new: mockSignature })
    }

    await waitFor(() => {
      expect(result.current.signatures).toContain(mockSignature)
      expect(result.current.signatureCount).toBe(1)
    })
  })

  it('handles multiple signatures correctly', async () => {
    const { result } = renderHook(() => usePetitionSubscription(petitionSlug))

    const channel = vi.mocked(supabase.channel).mock.results[0].value
    const onChangeCallback = vi.mocked(channel.on).mock.calls.find(
      ([event]) => event === 'postgres_changes'
    )?.[2]

    // Simulate multiple signatures
    const signatures = [
      mockSignature,
      { ...mockSignature, id: 'sig-124', name: 'Jane Doe' },
      { ...mockSignature, id: 'sig-125', name: 'Bob Smith' },
    ]

    if (onChangeCallback) {
      signatures.forEach(sig => {
        onChangeCallback('INSERT', { new: sig })
      })
    }

    await waitFor(() => {
      expect(result.current.signatures).toHaveLength(3)
      expect(result.current.signatureCount).toBe(3)
    })
  })

  it('unsubscribes from channel on unmount', () => {
    const { unmount } = renderHook(() => usePetitionSubscription(petitionSlug))

    const channel = vi.mocked(supabase.channel).mock.results[0].value
    unmount()

    expect(channel.unsubscribe).toHaveBeenCalled()
  })

  it('handles subscription errors gracefully', async () => {
    // Mock subscription error
    const errorChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockRejectedValue(new Error('Subscription failed')),
      unsubscribe: vi.fn().mockResolvedValue(null),
    } as unknown as RealtimeChannel

    vi.mocked(supabase.channel).mockReturnValue(errorChannel)

    const { result } = renderHook(() => usePetitionSubscription(petitionSlug))

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
      expect(result.current.isSubscribed).toBe(false)
    })
  })

  it('maintains signature order by timestamp', async () => {
    const { result } = renderHook(() => usePetitionSubscription(petitionSlug))

    const channel = vi.mocked(supabase.channel).mock.results[0].value
    const onChangeCallback = vi.mocked(channel.on).mock.calls.find(
      ([event]) => event === 'postgres_changes'
    )?.[2]

    // Simulate signatures with different timestamps
    const signatures = [
      { ...mockSignature, id: 'sig-1', created_at: '2024-03-01T12:00:00Z' },
      { ...mockSignature, id: 'sig-2', created_at: '2024-03-01T12:01:00Z' },
      { ...mockSignature, id: 'sig-3', created_at: '2024-03-01T11:59:00Z' },
    ]

    if (onChangeCallback) {
      signatures.forEach(sig => {
        onChangeCallback('INSERT', { new: sig })
      })
    }

    await waitFor(() => {
      const sortedSignatures = result.current.signatures
      expect(sortedSignatures[0].id).toBe('sig-2') // Most recent first
      expect(sortedSignatures[2].id).toBe('sig-3') // Oldest last
    })
  })
}) 