'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { FooterProveedor } from '@/components/FooterProveedor'
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
    <div className="theme-proveedor flex min-h-screen flex-col">
      <main className="flex-1 p-6">{children}</main>
      <FooterProveedor onLogout={handleLogout} />
    </div>
  )
}
