import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthContextType {
  session: Session | null
  user: SupabaseUser | null
  profile: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }
      return data as User
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    let mounted = true

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (!mounted) return

      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        const profileData = await fetchProfile(currentSession.user.id)
        if (mounted) {
          setProfile(profileData)
        }
      }

      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        console.log('Auth event:', event)

        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user) {
          const profileData = await fetchProfile(newSession.user.id)
          if (mounted) {
            setProfile(profileData)
          }
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setProfile(null)
  }

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
