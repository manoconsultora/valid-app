'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { clearSession, getSession } from '@/lib/session'

export default function ProveedorLayout({
  children,
}: { children: React.ReactNode }) {
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
    if (!session || session.user.role !== 'proveedor') {
      router.replace('/login')
    }
  }, [mounted, router])

  const handleLogout = () => {
    clearSession()
    router.replace('/login')
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-(--muted)">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header
        className="flex items-center justify-between border-b border-(--stroke) px-6 py-4"
        style={{
          backdropFilter: 'blur(var(--blur))',
          background: 'var(--surface)',
        }}
      >
        <div className="flex items-center gap-6">
          <Link
            className="text-lg font-semibold text-(--text)"
            href="/proveedor"
          >
            VALID
          </Link>
          <span className="text-sm text-(--muted)">Proveedor</span>
        </div>
        <button
          className="text-sm text-(--muted) hover:text-(--text)"
          onClick={handleLogout}
          type="button"
        >
          Cerrar sesión
        </button>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
