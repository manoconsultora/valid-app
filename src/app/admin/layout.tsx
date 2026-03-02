'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { clearSession, getSession } from '@/lib/session'

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const session = getSession()
    if (!session || session.user.role !== 'admin') {
      router.replace('/login')
      return
    }
    setUserName(session.user.name)
    setUserEmail(session.user.email)
  }, [mounted, router])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

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
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header
        className="flex items-center justify-between border-b px-6 py-4"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-6">
          <Link
            className="text-lg font-semibold tracking-tight"
            href="/admin"
            style={{ color: 'var(--text)' }}
          >
            VALID
          </Link>
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
            className="flex h-10 w-10 items-center justify-center rounded-full border text-lg transition-colors hover:bg-[var(--bg)]"
            style={{ borderColor: 'var(--border)' }}
            title="Notificaciones"
            type="button"
          >
            🔔
          </button>
          <div className="relative">
            <div
              ref={avatarRef}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full font-semibold text-white transition-opacity hover:opacity-85"
              onClick={() => setDropdownOpen((o) => !o)}
              role="button"
              style={{ background: 'var(--accent)', fontSize: '15px' }}
              tabIndex={0}
            >
              {userName ? getInitials(userName) : 'A'}
            </div>
            <div
              ref={dropdownRef}
              className="absolute right-0 top-[52px] z-[1000] min-w-[200px] rounded-[var(--radius)] border bg-[var(--surface)] py-1 transition-all"
              style={{
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-lg)',
                opacity: dropdownOpen ? 1 : 0,
                pointerEvents: dropdownOpen ? 'auto' : 'none',
                transform: dropdownOpen ? 'translateY(0)' : 'translateY(-10px)',
              }}
            >
              <div
                className="border-b px-4 py-3"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {userName || 'Admin'}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  {userEmail}
                </div>
              </div>
              <button
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] transition-colors hover:bg-[var(--bg)]"
                onClick={handleLogout}
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
      <main className="mx-auto px-6 py-6">{children}</main>
    </div>
  )
}
