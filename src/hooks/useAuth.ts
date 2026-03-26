import type { AuthSession } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase/client'
import {
  fetchProfile,
  getInitialSession,
  performSignIn as performSignInService,
  signOut as signOutService,
} from '@/services/authService'
import type { User } from '@/types'

function runInitialLoad(
  setLoading: (_l: boolean) => void,
  setSession: (_s: AuthSession | null) => void,
  setUser: (_u: User | null) => void
) {
  function applyInitialSession(session: AuthSession | null) {
    setSession(session)
    if (session?.user?.id) {
      fetchProfile(supabase, session.user.id)
        .then(profile => (setUser(profile), setLoading(false)))
        .catch(() => (setUser(null), setLoading(false)))
    } else {
      setUser(null)
      setLoading(false)
    }
  }
  getInitialSession(supabase)
    .then(applyInitialSession)
    .catch(() => (setSession(null), setUser(null), setLoading(false)))
}

function setupAuthSubscription(
  setSession: (_s: AuthSession | null) => void,
  setUser: (_u: User | null) => void
) {
  function handleAuthChange(_event: unknown, nextSession: AuthSession | null) {
    setSession(nextSession)
    if (nextSession?.user?.id) {
      fetchProfile(supabase, nextSession.user.id)
        .then(setUser)
        .catch(() => setUser(null))
    } else {
      setUser(null)
    }
  }
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(handleAuthChange)
  return () => subscription.unsubscribe()
}

export function useAuth(): {
  error: string | null
  loading: boolean
  session: AuthSession | null
  signIn: (
    _email: string,
    _password: string
  ) => Promise<{
    error: string | null
    session: AuthSession | null
    user: User | null
  }>
  signOut: () => Promise<void>
  user: User | null
} {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => void runInitialLoad(setLoading, setSession, setUser), [])

  useEffect(() => setupAuthSubscription(setSession, setUser), [])

  const signIn = useCallback(
    (email: string, password: string) => (
      setError(null),
      performSignInService(supabase, email, password).then(
        result => (
          result.error && setError(result.error),
          result.session &&
            result.user &&
            (setSession(result.session), setUser(result.user)),
          result
        )
      )
    ),
    []
  )

  const signOut = useCallback(
    () =>
      signOutService(supabase).then(
        () => (setError(null), setSession(null), setUser(null))
      ),
    []
  )

  return {
    error,
    loading,
    session,
    signIn,
    signOut,
    user,
  }
}
