'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useAuth } from '@/hooks/useAuth'

/**
 * Sin user → /login; admin → /admin; provider → /proveedor; sin rol → signOut + /login (limpia localStorage).
 */
export default function RedirectHome() {
  const router = useRouter()
  const { loading, signOut, user } = useAuth()

  useEffect(
    () =>
      loading
        ? undefined
        : !user
          ? router.replace('/login')
          : user.role === 'admin'
            ? router.replace('/admin')
            : user.role === 'provider'
              ? router.replace('/proveedor')
              : (void signOut().then(() => router.replace('/login')), undefined),
    [loading, router, signOut, user]
  )

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-(--muted)">Redirigiendo...</p>
    </div>
  )
}
