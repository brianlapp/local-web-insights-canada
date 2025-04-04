import { useCallback, useEffect, useState } from 'react'
import { supabase } from './client'
import type { User } from '@supabase/supabase-js'

interface AuthCredentials {
  email: string
  password: string
}

interface SignUpData extends AuthCredentials {
  metadata?: {
    name?: string
    [key: string]: any
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        setUser(session?.user ?? null)
        setIsAuthenticated(!!session?.user)
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setIsAuthenticated(!!session?.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (credentials: AuthCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials)
    
    if (error) throw error
    
    setUser(data.session?.user ?? null)
    setIsAuthenticated(!!data.session?.user)
    
    return data
  }, [])

  const signUp = useCallback(async ({ email, password, metadata }: SignUpData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    
    if (error) throw error
    
    return data
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) throw error
    
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
  }
} 