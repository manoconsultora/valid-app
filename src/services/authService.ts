import type { AuthSession, SupabaseClient } from '@supabase/supabase-js'

import { dbUserToApp } from '@/lib/adapters/db-to-app'
import type { User } from '@/types'
import type { Database } from '@/types/database.types'
import type { DbUser } from '@/types/db'

/**
 * Carga el perfil del usuario desde public.users.
 * El rol se lee de app_metadata si está disponible (metadata-first),
 * con fallback al valor de la tabla para usuarios sin app_metadata aún.
 */
export async function fetchProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<User | null> {
  const [{ data: authData }, { data: row, error }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('users').select('id, email, name, role').eq('id', userId).single(),
  ])
  if (error || !row) {
    return null
  }

  const dbUser = row as DbUser
  const metaRole = authData?.user?.app_metadata?.role
  const role =
    metaRole === 'admin' || metaRole === 'provider'
      ? (metaRole as 'admin' | 'provider')
      : dbUser.role

  return dbUserToApp({ ...dbUser, role })
}

export async function getInitialSession(
  supabase: SupabaseClient<Database>
): Promise<AuthSession | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function performSignIn(
  supabase: SupabaseClient<Database>,
  email: string,
  password: string
): Promise<{
  error: string | null
  session: AuthSession | null
  user: User | null
}> {
  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  if (signInError) {
    const message =
      signInError.message === 'Invalid login credentials'
        ? 'Email o contraseña incorrectos'
        : signInError.message
    return { error: message, session: null, user: null }
  }
  const profile = data.user?.id ? await fetchProfile(supabase, data.user.id) : null
  if (!profile) {
    await supabase.auth.signOut()
    return {
      error:
        'No se pudo cargar tu perfil. Si acabas de registrarte, espera un momento e intenta de nuevo. Si el problema continúa, contacta a soporte.',
      session: null,
      user: null,
    }
  }
  return { error: null, session: data.session ?? null, user: profile }
}

export async function signOut(supabase: SupabaseClient<Database>): Promise<void> {
  await supabase.auth.signOut()
}
