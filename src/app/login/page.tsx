 'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { loginDemo } from '@/lib/auth-demo'
import { setSession } from '@/lib/session'
import './login.css'

type FormFieldProps = {
  id: string
  label: string
  type: 'email' | 'password'
  placeholder: string
  autoComplete: string
  value: string
  onChange: (value: string) => void
}

function FormField({
  id,
  label,
  type,
  placeholder,
  autoComplete,
  value,
  onChange,
}: FormFieldProps) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="form-input"
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const user = loginDemo(email.trim(), password.trim())
    if (!user) {
      setError('❌ Email o contraseña incorrectos')
      return
    }
    setSession(user)
    if (user.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/proveedor')
    }
  }

  return (
    <div className="login-page">
      <main className="login-container">
        <div className="logo">
          <div className="logo-icon">
            <Image
              src="/VALID_logo_app.png"
              alt="VALID app"
              width={160}
              height={80}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              priority
            />
          </div>
          <div className="logo-icon">
            <Image
              src="/logo.png"
              alt="VALID"
              width={160}
              height={80}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>

          <div className="logo-subtitle">Sistema de Validación Documental</div>
          <div className="powered-by">powered by MANOBOT</div>
        </div>

        <div
          className={[
            'alert',
            error ? 'alert-error alert-visible' : '',
          ].join(' ')}
          role={error ? 'alert' : undefined}
        >
          {error}
        </div>

        <form onSubmit={handleSubmit}>
          <FormField
            id="email"
            label="Email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            value={email}
            onChange={setEmail}
          />

          <FormField
            id="password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
          />

          <button type="submit" className="btn-login">
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
            <a href="mailto:soporte@manobot.com" className="footer-link">
              Contactar soporte
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
