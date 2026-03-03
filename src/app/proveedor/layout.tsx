'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { NavbarLogo } from '@/components/ui/NavbarLogo'
import { useMounted } from '@/hooks/useMounted'
import { useProveedorGuard } from '@/hooks/useProveedorGuard'
import { clearSession } from '@/lib/session'

export default function ProveedorLayout({
  children,
}: { children: React.ReactNode }) {
  const router = useRouter()
  const mounted = useMounted()

  useProveedorGuard(mounted)

  const handleLogout = useCallback(
    () => (clearSession(), router.replace('/login')),
    [router]
  )

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
          <NavbarLogo href="/proveedor" />
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
