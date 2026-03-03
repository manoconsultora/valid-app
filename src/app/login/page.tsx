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
  onChange: (_value: string) => void
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
  );

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
              alt="VALID app"
              height={80}
              priority
              src="/VALID_logo_app.png"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              width={160}
            />
          </div>
          <div className="logo-icon">
            <Image
              alt="VALID"
              height={80}
              src="/logo.png"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              width={160}
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
