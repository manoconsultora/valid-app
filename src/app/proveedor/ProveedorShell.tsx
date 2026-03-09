'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { FooterProveedor } from '@/components/FooterProveedor'
import { useAuth } from '@/hooks/useAuth'
import { useMounted } from '@/hooks/useMounted'
import { useProveedorGuard } from '@/hooks/useProveedorGuard'

export function ProveedorShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const mounted = useMounted()

  useProveedorGuard(mounted)

  const { signOut } = useAuth()
  const handleLogout = useCallback(
    () =>
      void (async function run() {
        await signOut()
        router.replace('/login')
      })(),
    [router, signOut]
  )

  return (
    <div className="theme-proveedor flex min-h-screen w-full flex-col">
      {!mounted ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-(--muted)">Cargando...</p>
        </div>
      ) : (
        <>
          <main className="min-w-0 flex-1 p-6 w-full">{children}</main>
          <FooterProveedor onLogout={handleLogout} />
        </>
      )}
    </div>
  )
}
