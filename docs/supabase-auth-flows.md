# Supabase Auth Flows — Admin Panel + Invite User

Stack asumido: **Next.js App Router** + `@supabase/ssr`

---

## Resumen de flujos

```
FLUJO 1 — Admin invita usuario
Admin Panel → inviteUserByEmail() → Email con link → /auth/confirm → /set-password

FLUJO 2 — Usuario establece contraseña
/set-password → updateUser({ password }) → /dashboard

FLUJO 3 — Login normal (post-onboarding)
/login → signInWithPassword() → /auth/confirm → /dashboard

FLUJO 4 — Recuperación de contraseña (usuario olvidó su pass)
/login → "Olvidé contraseña" → resetPasswordForEmail() → Email → /auth/confirm → /set-password → /dashboard
```

---

## Setup inicial

### Instalación

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # Solo en servidor
```

### Supabase Dashboard — URL Configuration

En **Authentication → URL Configuration** agregar:

```
Site URL:        https://tuapp.com
Redirect URLs:   https://tuapp.com/auth/confirm
                 https://tuapp.com/set-password
                 http://localhost:3000/auth/confirm     ← para desarrollo
                 http://localhost:3000/set-password     ← para desarrollo
```

---

## Clientes Supabase

### `utils/supabase/client.ts` — Cliente (browser)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `utils/supabase/server.ts` — Servidor (RSC, Server Actions, Route Handlers)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

### `utils/supabase/admin.ts` — Admin (solo servidor, usa service_role)

```typescript
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
```

---

## Middleware

### `middleware.ts` — Refresca sesión y protege rutas

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas protegidas — redirige a login si no hay sesión
  const protectedRoutes = ['/dashboard', '/admin']
  const isProtected = protectedRoutes.some(r => request.nextUrl.pathname.startsWith(r))

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rutas de auth — redirige a dashboard si ya hay sesión
  const authRoutes = ['/login']
  const isAuthRoute = authRoutes.some(r => request.nextUrl.pathname.startsWith(r))

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## FLUJO 1 — Admin invita usuario

### `app/admin/users/actions.ts` — Server Action

```typescript
'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function inviteUser(formData: FormData) {
  const email = formData.get('email') as string
  const nombre = formData.get('nombre') as string
  const rol = formData.get('rol') as string

  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
    data: {
      nombre,
      rol,
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true, userId: data.user.id }
}
```

### `app/admin/users/page.tsx` — UI del admin panel

```tsx
import { inviteUser } from './actions'

export default function AdminUsersPage() {
  return (
    <div>
      <h1>Gestión de usuarios</h1>

      <form action={inviteUser}>
        <div>
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" type="text" required />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>

        <div>
          <label htmlFor="rol">Rol</label>
          <select id="rol" name="rol">
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit">Invitar usuario</button>
      </form>
    </div>
  )
}
```

---

## FLUJO 2 — Callback de confirmación (punto de entrada desde email)

Este route handler es el que recibe **todos** los links de Supabase (invite, reset password, email confirm).

### `app/auth/confirm/route.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/error', request.url))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.verifyOtp({ token_hash, type })

  if (error) {
    return NextResponse.redirect(new URL(`/error?message=${error.message}`, request.url))
  }

  // Según el tipo de token, redirige a la página correcta
  if (type === 'invite' || type === 'recovery') {
    // Necesita establecer/restablecer contraseña
    return NextResponse.redirect(new URL('/set-password', request.url))
  }

  // Email confirmation u otros → va al destino original
  return NextResponse.redirect(new URL(next, request.url))
}
```

---

## FLUJO 2 y 4 — Página para establecer/restablecer contraseña

### `app/set-password/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Verifica que haya sesión activa (creada por /auth/confirm)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true)
      } else {
        // No hay sesión, el link expiró o ya fue usado
        router.push('/login?error=link-expired')
      }
    })
  }, [])

  const handleSubmit = async () => {
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  if (!sessionReady) {
    return <p>Verificando sesión...</p>
  }

  return (
    <div>
      <h1>Establecé tu contraseña</h1>

      <div>
        <label htmlFor="password">Nueva contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirmar contraseña</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleSubmit} disabled={loading || !password}>
        {loading ? 'Guardando...' : 'Guardar contraseña'}
      </button>
    </div>
  )
}
```

---

## FLUJO 3 — Login normal

### `app/login/actions.ts`

```typescript
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

### `app/login/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { login } from './actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(formData: FormData) {
    const result = await login(formData)
    if (result?.error) setError(result.error)
  }

  return (
    <div>
      <h1>Iniciar sesión</h1>

      <form action={handleLogin}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>

        <div>
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" required />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit">Ingresar</button>
      </form>

      <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
    </div>
  )
}
```

---

## FLUJO 4 — Recuperación de contraseña (olvidé mi contraseña)

### `app/forgot-password/actions.ts`

```typescript
'use server'

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string

  const { createClient } = await import('@/utils/supabase/server')
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
  })

  // Siempre retorna success para no revelar si el email existe
  if (error) console.error(error)

  return { success: true }
}
```

### `app/forgot-password/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { resetPassword } from './actions'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  async function handleSubmit(formData: FormData) {
    await resetPassword(formData)
    setSent(true)
  }

  if (sent) {
    return (
      <div>
        <h1>Revisá tu email</h1>
        <p>
          Si el email está registrado, recibirás un link para restablecer tu contraseña.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1>Recuperar contraseña</h1>

      <form action={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
        <button type="submit">Enviar link</button>
      </form>
    </div>
  )
}
```

---

## Estructura de archivos final

```
app/
├── middleware.ts
├── auth/
│   └── confirm/
│       └── route.ts          ← Callback universal de Supabase
├── login/
│   ├── page.tsx
│   └── actions.ts
├── forgot-password/
│   ├── page.tsx
│   └── actions.ts
├── set-password/
│   └── page.tsx              ← Invite + Reset comparten esta página
├── admin/
│   └── users/
│       ├── page.tsx
│       └── actions.ts
└── dashboard/
    └── page.tsx
utils/
└── supabase/
    ├── client.ts             ← Browser
    ├── server.ts             ← RSC / Server Actions
    └── admin.ts              ← service_role (solo servidor)
```

---

## Variables de entorno completas

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://tuapp.com   # http://localhost:3000 en desarrollo
```

---

## Notas importantes

- **`/auth/confirm`** es el único `redirectTo` que necesitás en todos los flows. Este route handler se encarga de rutear según el `type` del token (`invite`, `recovery`, `signup`, etc.)
- **`service_role`** nunca debe exponerse al cliente. Solo se usa en `admin.ts` y exclusivamente en Server Actions o Route Handlers.
- El link de invite **expira en 24h** por defecto. Se puede cambiar en Supabase Dashboard → Auth → Email Templates.
- La página `/set-password` es compartida por invite y recovery — ambos flujos llegan a ella tras pasar por `/auth/confirm`.
