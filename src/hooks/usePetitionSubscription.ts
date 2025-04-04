import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface PetitionSignature {
  id: string
  petition_id: string
  name: string
  email: string
  created_at: string
}

export function usePetitionSubscription(petitionSlug: string) {
  const [signatures, setSignatures] = useState<PetitionSignature[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    let mounted = true

    const setupSubscription = async () => {
      try {
        // Create and subscribe to the channel
        const newChannel = supabase.channel(`petition-${petitionSlug}`, {
          config: {
            broadcast: { self: true },
          },
        })
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'petition_signatures',
            filter: `petition_id=eq.${petitionSlug}`,
          }, payload => {
            if (mounted) {
              setSignatures(current => {
                const newSignature = payload.new as PetitionSignature
                const updatedSignatures = [...current, newSignature]
                // Sort by created_at in descending order (newest first)
                return updatedSignatures.sort((a, b) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
              })
            }
          })

        await newChannel.subscribe()
        
        if (mounted) {
          setChannel(newChannel)
          setIsSubscribed(true)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to subscribe to petition updates'))
          setIsSubscribed(false)
        }
      }
    }

    setupSubscription()

    // Cleanup subscription on unmount
    return () => {
      mounted = false
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [petitionSlug])

  return {
    signatures,
    signatureCount: signatures.length,
    isSubscribed,
    error,
  }
} 