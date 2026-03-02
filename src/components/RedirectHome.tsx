'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { getSession } from '@/lib/session'

/**
 * Redirige a /login, /admin o /proveedor según sesión (solo cliente).
 */
export default function RedirectHome() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => {
      clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (!mounted) {
      return
    }
    const session = getSession()
    if (!session) {
      router.replace('/login')
      return
    }
    if (session.user.role === 'admin') {
      router.replace('/admin')
    } else {
      router.replace('/proveedor')
    }
  }, [mounted, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-(--muted)">Redirigiendo...</p>
    </div>
  )
}
