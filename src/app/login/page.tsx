'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  type FieldErrors,
  type UseFormHandleSubmit,
  type UseFormRegister,
  useForm,
} from 'react-hook-form'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/client'

import './login.css'

const loginSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

type LoginFormProps = {
  errors: FieldErrors<LoginFormData>
  handleSubmit: UseFormHandleSubmit<LoginFormData>
  isSubmitting: boolean
  onSubmit: (_data: LoginFormData) => Promise<void>
  register: UseFormRegister<LoginFormData>
}

const LoginFormBody = ({
  errors,
  handleSubmit,
  isSubmitting,
  onSubmit,
  register,
}: LoginFormProps) => (
  <form noValidate onSubmit={handleSubmit(onSubmit)}>
    <div className="form-group">
      <label className="form-label" htmlFor="email">
        Email
      </label>
      <input
        aria-describedby={errors.email ? 'email-error' : undefined}
        aria-invalid={!!errors.email}
        aria-required="true"
        autoComplete="email"
        className="form-input"
        id="email"
        placeholder="tu@email.com"
        type="email"
        {...register('email')}
      />
      {errors.email != null && errors.email.message != null && (
        <span id="email-error" role="alert">
          {errors.email.message}
        </span>
      )}
    </div>
    <div className="form-group">
      <label className="form-label" htmlFor="password">
        Contraseña
      </label>
      <input
        aria-describedby={errors.password ? 'password-error' : undefined}
        aria-invalid={!!errors.password}
        aria-required="true"
        autoComplete="current-password"
        className="form-input"
        id="password"
        placeholder="••••••••"
        type="password"
        {...register('password')}
      />
      {errors.password != null && errors.password.message != null && (
        <span id="password-error" role="alert">
          {errors.password.message}
        </span>
      )}
    </div>
    <button className="btn-login" disabled={isSubmitting} type="submit">
      {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
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
)

const LoginLogo = () => (
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
)

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginFormData) {
    setServerError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError('Email o contraseña incorrectos')
      return
    }

    // ✅ Sin leer rol acá — el middleware y los layouts
    // server-side redirigen según el rol automáticamente
    router.push('/')
    router.refresh() // fuerza al middleware a re-evaluar la sesión
  }

  const error = serverError ?? errors.email?.message ?? errors.password?.message

  return (
    <div className="login-page">
      <main className="login-container">
        <LoginLogo />

        <div
          className={['alert', error ? 'alert-error alert-visible' : ''].join(
            ' '
          )}
          role={error ? 'alert' : undefined}
        >
          {error}
        </div>

        <LoginFormBody
          errors={errors}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          register={register}
        />

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