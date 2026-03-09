'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'

import { FooterAdmin } from '@/components/FooterAdmin'
import { NavbarLogo } from '@/components/ui/NavbarLogo'
import { useAdminGuard } from '@/hooks/useAdminGuard'
import { useAuth } from '@/hooks/useAuth'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useMounted } from '@/hooks/useMounted'

const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

function AdminHeader({
  onLogout,
  userEmail,
  userName,
}: {
  onLogout: () => void
  userEmail: string
  userName: string
}) {
  const avatarRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const refs = useMemo(() => [dropdownRef, avatarRef], [])
  const closeDropdown = useCallback(() => setDropdownOpen(false), [])
  useClickOutside(refs, closeDropdown)

  const displayInitials = userName ? getInitials(userName) : 'A'
  const displayName = userName || 'Admin'
  const dropdownVisible = dropdownOpen ? 1 : 0
  const dropdownPointerEvents = dropdownOpen ? 'auto' : 'none'
  const dropdownTransform = dropdownOpen ? 'translateY(0)' : 'translateY(-10px)'

  return (
    <header
      className="flex items-center justify-between border-b px-6 py-4"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-6">
        <NavbarLogo href="/admin" />
        <nav className="flex gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Link className="hover:opacity-80" href="/admin">
            Dashboard
          </Link>
          <Link className="hover:opacity-80" href="/admin/eventos/crear">
            Crear evento
          </Link>
          <Link className="hover:opacity-80" href="/admin/proveedores">
            Proveedores
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border text-lg transition-colors hover:bg-(--bg)"
          style={{ borderColor: 'var(--border)' }}
          title="Notificaciones"
          type="button"
        >
          🔔
        </button>
        <div className="relative">
          <div
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full font-semibold text-white transition-opacity hover:opacity-85"
            onClick={() => setDropdownOpen((o) => !o)}
            ref={avatarRef}
            role="button"
            style={{ background: 'var(--accent)', fontSize: '15px' }}
            tabIndex={0}
          >
            {displayInitials}
          </div>
          <div
            className="absolute right-0 top-[52px] z-1000 min-w-[200px] rounded-(--radius) border bg-(--surface) py-1 transition-all"
            ref={dropdownRef}
            style={{
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-lg)',
              opacity: dropdownVisible,
              pointerEvents: dropdownPointerEvents,
              transform: dropdownTransform,
            }}
          >
            <div
              className="border-b px-4 py-3"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {displayName}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                {userEmail}
              </div>
            </div>
            <button
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] transition-colors hover:bg-(--bg)"
              onClick={onLogout}
              style={{ color: 'var(--rejected)' }}
              type="button"
            >
              <span>🚪</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const mounted = useMounted()

  useAdminGuard(mounted)

  const { signOut, user } = useAuth()
  const userName = user?.name ?? ''
  const userEmail = user?.email ?? ''

  const handleLogout = useCallback(
    () =>
      void (async function run() {
        await signOut()
        router.replace('/login')
      })(),
    [router, signOut]
  )

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-(--muted)">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <AdminHeader
        onLogout={handleLogout}
        userEmail={userEmail}
        userName={userName}
      />
      <main className="mx-auto px-6 py-6">{children}</main>
      <FooterAdmin />
    </div>
  )
}
