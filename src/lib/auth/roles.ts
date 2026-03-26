import 'server-only'

import { redirect } from 'next/navigation'

import { createServerClient } from '@/lib/supabase/server'

export type AppRole = 'admin' | 'provider'

const isAppRole = (value: unknown): value is AppRole =>
  value === 'admin' || value === 'provider'

/**
 * Rol desde app_metadata del JWT (metadata-first, sin query a DB).
 * Fallback a public.users si app_metadata.role no está asignado aún
 * (ej: usuario creado antes de aceptar la invitación).
 * Retorna null si no hay usuario o no tiene rol asignado.
 */
export async function getUserRole(): Promise<AppRole | null> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) {
    return null
  }

  const metaRole = user.app_metadata?.role
  if (isAppRole(metaRole)) {
    return metaRole
  }

  const { data: row } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const dbRole = (row as { role: AppRole | null } | null)?.role ?? null
  return dbRole
}

/**
 * Exige el rol indicado.
 * - Sin rol → /unauthorized (pendiente de activación).
 * - Rol distinto → redirige a su área sin revelar la existencia de la otra.
 */
export async function requireRole(role: AppRole): Promise<void> {
  const currentRole = await getUserRole()
  if (currentRole === null) {
    redirect('/unauthorized')
  }
  if (currentRole !== role) {
    const home = currentRole === 'admin' ? '/admin' : '/proveedor'
    redirect(home)
  }
}
