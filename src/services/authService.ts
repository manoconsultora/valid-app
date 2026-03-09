import type { AuthSession, SupabaseClient } from '@supabase/supabase-js'

import { dbUserToApp } from '@/lib/adapters/db-to-app'
import type { User } from '@/types'
import type { DbUser } from '@/types/db'
import type { Database } from '@/types/database.types'

/** Rol siempre desde public.users; nunca desde raw_user_meta_data (auth-rbac). */
export async function fetchProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role')
    .eq('id', userId)
    .single()
  if (error || !data) {
    return null
  }
  return dbUserToApp(data as DbUser)
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
  const { data, error: signInError } =
    await supabase.auth.signInWithPassword({
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
  const profile =
    data.user?.id ? await fetchProfile(supabase, data.user.id) : null
  if (!profile) {
    await supabase.auth.signOut()
    return {
      error:
        'No se pudo cargar tu perfil. Si acabas de registrarte, espera un momento e intenta de nuevo. Si el problema continúa, contacta a soporte.',
      session: null,
      user: null,
    }
  }
  return {
    error: null,
    session: data.session ?? null,
    user: profile,
  }
}

export async function signOut(supabase: SupabaseClient<Database>): Promise<void> {
  await supabase.auth.signOut()
}
