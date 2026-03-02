'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { loginDemo } from '@/lib/auth-demo'
import { setSession } from '@/lib/session'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const user = loginDemo(email.trim(), password)
    if (!user) {
      setError('Email o contraseña incorrectos.')
      return
    }
    setSession(user)
    if (user.role === 'admin') {router.push('/admin')}
    else {router.push('/proveedor')}
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <main
        className="w-full max-w-md rounded-lg border border-(--stroke) p-8 shadow-(--shadow-soft)"
        style={{
          backdropFilter: 'blur(var(--blur))',
          background: 'var(--surface-2)',
        }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-(--text)">
            VALID
          </h1>
          <p className="mt-1 text-sm text-(--muted)">
            Sistema de Validación Documental · powered by MANOBOT
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-(--text)"
              htmlFor="email"
            >
              Email
            </label>
            <input
              autoComplete="email"
              className="w-full rounded-(--radius) border border-(--stroke) bg-white/80 px-4 py-3 text-(--text) placeholder:text-(--muted) focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              type="email"
              value={email}
            />
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-(--text)"
              htmlFor="password"
            >
              Contraseña
            </label>
            <input
              autoComplete="current-password"
              className="w-full rounded-(--radius) border border-(--stroke) bg-white/80 px-4 py-3 text-(--text) placeholder:text-(--muted) focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              value={password}
            />
          </div>
          {error && (
            <p className="text-sm text-rejected" role="alert">
              {error}
            </p>
          )}
          <button
            className="mt-2 rounded-(--radius) bg-accent px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            type="submit"
          >
            Ingresar
          </button>
        </form>

        <div
          className="mt-6 rounded-(--radius) border border-(--stroke) bg-white/60 p-4 text-sm text-(--muted)"
          style={{ backdropFilter: 'blur(var(--blur))' }}
        >
          <p className="font-medium text-(--text)">Credenciales demo</p>
          <p className="mt-1 font-mono text-xs">
            Admin: admin@productora.com / admin123
          </p>
          <p className="mt-0.5 font-mono text-xs">
            Proveedor: proveedor@empresa.com / prov123
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-(--muted)">
          ¿Problemas para ingresar? Contactar soporte.
        </p>
      </main>
    </div>
  )
}
