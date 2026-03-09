'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useAuth } from '@/hooks/useAuth'
import './login.css'

type FormFieldProps = {
  autoComplete: string
  id: string
  label: string
  onChange: (_value: string) => void
  placeholder: string
  type: 'email' | 'password'
  value: string
}

const FormField = ({
  autoComplete,
  id,
  label,
  onChange,
  placeholder,
  type,
  value,
}: FormFieldProps) => (
  <div className="form-group">
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <input
      autoComplete={autoComplete}
      className="form-input"
      id={id}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required
      type={type}
      value={value}
    />
  </div>
)

export default function LoginPage() {
  const router = useRouter()
  const { error: authError, loading, signIn, signOut, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(
    () =>
      loading || !user
        ? undefined
        : user.role === 'admin'
          ? router.replace('/admin')
          : user.role === 'provider'
            ? router.replace('/proveedor')
            : (void signOut().then(() => router.replace('/login')), undefined),
    [loading, router, signOut, user]
  )

  const handleSubmit = (e: React.FormEvent) =>
    void (async function submit() {
      e.preventDefault()
      setSubmitError('')
      setSuccessMessage('')
      const trimmedEmail = email.trim().toLowerCase()
      const trimmedPassword = password.trim()
      const result = await signIn(trimmedEmail, trimmedPassword)
      if (result.error) {
        setSubmitError(result.error)
        return
      }
      if (result.user) {
        const r = result.user.role
        if (r === 'admin' || r === 'provider') {
          setSuccessMessage(`✅ Bienvenido/a ${result.user.name}!`)
          const path = r === 'admin' ? '/admin' : '/proveedor'
          setTimeout(() => router.push(path), 1000)
        } else {
          await signOut()
          setSubmitError(
            'Tu cuenta está pendiente de activación. Contactá al administrador.'
          )
        }
      } else {
        setSubmitError(
          result.error ?? 'No se pudo completar el acceso. Intenta de nuevo.'
        )
      }
    })()

  const error = submitError || authError
  const alertMessage = error || successMessage
  const alertClass =
    error ? 'alert-error' : successMessage ? 'alert-success' : ''

  return (
    <div className="login-page">
      <main className="login-container">
        <div className="logo">
          <div className="logo-icon">
            <Image
              alt="VALID app"
              height={80}
              priority
              src="/VALID_logo_app.png"
              style={{
                height: '100%',
                objectFit: 'contain',
                width: '100%',
              }}
              unoptimized
              width={160}
            />
          </div>
          <div className="logo-icon">
            <Image
              alt="VALID"
              height={80}
              src="/logo.png"
              style={{
                height: '100%',
                objectFit: 'contain',
                width: '100%',
              }}
              unoptimized
              width={160}
            />
          </div>

          <div className="logo-subtitle">Sistema de Validación Documental</div>
          <div className="powered-by">powered by MANOBOT</div>
        </div>

        <div
          className={['alert', alertClass, alertMessage ? 'alert-visible' : ''].join(' ')}
          role={alertMessage ? 'alert' : undefined}
        >
          {alertMessage}
        </div>

        <form onSubmit={handleSubmit}>
          <FormField
            autoComplete="email"
            id="email"
            label="Email"
            onChange={setEmail}
            placeholder="tu@email.com"
            type="email"
            value={email}
          />

          <FormField
            autoComplete="current-password"
            id="password"
            label="Contraseña"
            onChange={setPassword}
            placeholder="••••••••"
            type="password"
            value={password}
          />

          <button className="btn-login" type="submit">
            Ingresar
          </button>

          <div className="helper-box">
            <p className="helper-title">Credenciales Demo</p>
            <p className="helper-creds">
              Admin: admin@productora.com / admin123
              <br />
              Proveedor: proveedor@empresa.com / prov123
            </p>
          </div>

          <div className="update-info">
            <p className="update-text">
              Última Actualización: <strong>13/01/2026 - 15:30 PM</strong>
              <br />
              Deploy: <strong>deploy@manobot.com</strong>
              <br />
              <span style={{ fontSize: 9, opacity: 0.7 }}>
                MANO CONSULTORA - Digital Strategy for Growth
              </span>
            </p>
          </div>
        </form>

        <div className="login-footer">
          <p className="footer-text">
            ¿Problemas para ingresar?{' '}
            <a className="footer-link" href="mailto:soporte@manobot.com">
              Contactar soporte
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
