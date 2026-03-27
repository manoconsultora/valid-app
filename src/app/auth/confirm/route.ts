import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

import type { Database } from '@/types/database.types'

const isInviteOrRecovery = (type: EmailOtpType | null): boolean =>
  type === 'invite' || type === 'recovery'

/**
 * Callback único para links de Supabase (invite, recovery, confirmación).
 * Recibe token_hash y type por query. En invite/recovery cierra antes la sesión
 * actual (p. ej. admin) para que verifyOtp establezca solo la del invitado y no
 * se redirija al dashboard por rol. Valida con verifyOtp, escribe la sesión en
 * cookies y redirige a set-password o a next.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL('/login?error=link-invalido', request.url))
  }

  const cookieStore = await cookies()
  const redirectTarget = isInviteOrRecovery(type)
    ? `/auth/set-password?type=${type}`
    : next
  const response = NextResponse.redirect(new URL(redirectTarget, request.url))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    ''

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet: { name: string; options?: object; value: string }[]) =>
        cookiesToSet.forEach(({ name, options, value }) =>
          response.cookies.set(name, value, options ?? {})
        ),
    },
  })

  // Invite/recovery: cerrar solo la sesión local para que verifyOtp establezca la del invitado,
  // sin invalidar otras sesiones del admin en otros dispositivos.
  if (isInviteOrRecovery(type)) {
    await supabase.auth.signOut({ scope: 'local' })
  }

  /* eslint-disable camelcase -- Supabase verifyOtp espera token_hash */
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  })
  /* eslint-enable camelcase */

  if (error) {
    return NextResponse.redirect(new URL('/login?error=link-expirado', request.url))
  }

  return response
}
