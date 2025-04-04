import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { toast } from '@/components/ui/use-toast'

interface NetworkContextType {
  isOnline: boolean
  retryFailedRequest: (request: () => Promise<any>) => Promise<any>
}

const NetworkContext = createContext<NetworkContextType | null>(null)

export function useNetwork() {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider')
  }
  return context
}

interface NetworkProviderProps {
  children: ReactNode
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [failedRequests, setFailedRequests] = useState<(() => Promise<any>)[]>([])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: 'Back online',
        description: 'All features are now available',
        variant: 'default',
      })

      // Retry failed requests
      failedRequests.forEach(request => {
        retryFailedRequest(request)
      })
      setFailedRequests([])
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: 'You are offline',
        description: 'Some features may be limited',
        variant: 'destructive',
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [failedRequests])

  const retryFailedRequest = async (request: () => Promise<any>) => {
    try {
      if (!isOnline) {
        setFailedRequests(prev => [...prev, request])
        throw new Error('No internet connection')
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await Promise.race([
        request(),
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Request timed out'))
          }, 30000)
        }),
      ])

      clearTimeout(timeoutId)
      return response

    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Request timed out') {
          toast({
            title: 'Request Timeout',
            description: 'The request took too long to complete. Please try again.',
            variant: 'destructive',
          })
        } else if (!isOnline) {
          // Queue for retry when back online
          setFailedRequests(prev => [...prev, request])
        }
      }
      throw error
    }
  }

  return (
    <NetworkContext.Provider value={{ isOnline, retryFailedRequest }}>
      {children}
    </NetworkContext.Provider>
  )
} 