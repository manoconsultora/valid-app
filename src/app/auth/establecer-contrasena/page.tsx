'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { acceptProviderInvitation } from '@/lib/actions/providers/actions'
import { supabase } from '@/lib/supabase/client'
import './establecer-contrasena.css'

type Status = 'invalid_link' | 'loading' | 'ready'

export default function EstablecerContrasenaPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(function initAuthCheck() {
    let mounted = true
    void supabase.auth.getUser().then(function onGetUser({ data: { user }, error }) {
      if (!mounted) {
        return
      }
      if (error || !user) {
        setStatus('invalid_link')
        return
      }
      setStatus('ready')
    })
    return function cleanup() {
      mounted = false
    }
  }, [])

  function getRedirectPath(role: string | undefined): string {
    if (role === 'admin') {
      return '/admin'
    }
    if (role === 'provider') {
      return '/proveedor'
    }
    return '/login'
  }

  async function handlePasswordUpdate(
    trimmed: string
  ): Promise<{ error: string } | { role: string | undefined }> {
    const { error } = await supabase.auth.updateUser({ password: trimmed })
    if (error) {
      const msg =
        error.message === 'New password should be different from the old password.'
          ? 'La nueva contraseña debe ser distinta a la anterior.'
          : error.message
      return { error: msg }
    }
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user?.id) {
      await acceptProviderInvitation(user.id)
    }
    await supabase.auth.refreshSession()
    const {
      data: { user: refreshed },
    } = await supabase.auth.getUser()
    return { role: refreshed?.app_metadata?.role as string | undefined }
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setSubmitError('')
    const trimmed = password.trim()
    const trimmedConfirm = confirm.trim()
    if (trimmed.length < 6) {
      setSubmitError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (trimmed !== trimmedConfirm) {
      setSubmitError('Las contraseñas no coinciden.')
      return
    }
    setSubmitting(true)
    const outcome = await handlePasswordUpdate(trimmed)
    setSubmitting(false)
    if ('error' in outcome) {
      setSubmitError(outcome.error)
      return
    }
    setSuccessMessage('Contraseña guardada. Redirigiendo…')
    setTimeout(() => router.replace(getRedirectPath(outcome.role)), 1000)
  }

  const alertMessage = submitError || successMessage
  const alertClass = submitError ? 'alert-error' : successMessage ? 'alert-success' : ''

  if (status === 'invalid_link') {
    return (
      <div className="set-password-page">
        <main className="set-password-container">
          <div className="logo" style={{ marginBottom: 24 }}>
            <div
              className="logo-icon"
              style={{ height: 80, margin: '0 auto 16px', width: 160 }}
            >
              <Image
                alt="VALID app"
                height={80}
                priority
                src="/VALID_logo_app.png"
                style={{ height: '100%', objectFit: 'contain', width: '100%' }}
                unoptimized
                width={160}
              />
            </div>
            <div
              className="logo-subtitle"
              style={{ color: 'var(--muted)', fontSize: 14 }}
            >
              Sistema de Validación Documental
            </div>
          </div>
          <p className="set-password-title">Link inválido o expirado</p>
          <p className="set-password-subtitle">
            El enlace para establecer tu contraseña no es válido o ya venció. Solicitá uno
            nuevo desde el login.
          </p>
          <div className="set-password-footer">
            <Link className="footer-link" href="/login">
              Volver al inicio de sesión
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="set-password-page">
        <main className="set-password-container">
          <div className="logo" style={{ marginBottom: 24 }}>
            <div
              className="logo-icon"
              style={{ height: 80, margin: '0 auto 16px', width: 160 }}
            >
              <Image
                alt="VALID app"
                height={80}
                priority
                src="/VALID_logo_app.png"
                style={{ height: '100%', objectFit: 'contain', width: '100%' }}
                unoptimized
                width={160}
              />
            </div>
          </div>
          <p className="set-password-subtitle">Cargando…</p>
        </main>
      </div>
    )
  }

  return (
    <div className="set-password-page">
      <main className="set-password-container">
        <div className="logo" style={{ marginBottom: 24 }}>
          <div
            className="logo-icon"
            style={{ height: 80, margin: '0 auto 16px', width: 160 }}
          >
            <Image
              alt="VALID app"
              height={80}
              priority
              src="/VALID_logo_app.png"
              style={{ height: '100%', objectFit: 'contain', width: '100%' }}
              unoptimized
              width={160}
            />
          </div>
          <div
            className="logo-icon"
            style={{ height: 80, margin: '0 auto 16px', width: 160 }}
          >
            <Image
              alt="VALID"
              height={80}
              src="/logo.png"
              style={{ height: '100%', objectFit: 'contain', width: '100%' }}
              unoptimized
              width={160}
            />
          </div>
          <div className="logo-subtitle" style={{ color: 'var(--muted)', fontSize: 14 }}>
            Sistema de Validación Documental
          </div>
        </div>

        <p className="set-password-title">Elegí tu contraseña</p>
        <p className="set-password-subtitle">
          Ingresá una contraseña segura para acceder a tu cuenta. Usá al menos 6
          caracteres.
        </p>

        <div
          className={['alert', alertClass, alertMessage ? 'alert-visible' : ''].join(' ')}
          role={alertMessage ? 'alert' : undefined}
        >
          {alertMessage}
        </div>

        <form className="set-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Contraseña
            </label>
            <input
              autoComplete="new-password"
              className="form-input"
              id="password"
              minLength={6}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              type="password"
              value={password}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirm">
              Confirmar contraseña
            </label>
            <input
              autoComplete="new-password"
              className="form-input"
              id="confirm"
              minLength={6}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              type="password"
              value={confirm}
            />
          </div>
          <button className="btn-set-password" disabled={submitting} type="submit">
            {submitting ? 'Guardando…' : 'Guardar contraseña'}
          </button>
        </form>

        <div className="set-password-footer">
          <Link className="footer-link" href="/login">
            Volver al inicio de sesión
          </Link>
        </div>
      </main>
    </div>
  )
}
