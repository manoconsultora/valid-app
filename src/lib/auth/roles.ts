import 'server-only'

import { redirect } from 'next/navigation'

import { createServerClient } from '@/lib/supabase/server'

export type AppRole = 'admin' | 'provider'

/**
 * Rol desde public.users; nunca desde user_metadata (auth-rbac).
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

  const { data: row } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (row as { role: AppRole | null } | null)?.role ?? null
  return role
}

/**
 * Exige el rol indicado.
 * - Sin rol → /unauthorized (pendiente de activación).
 * - Rol distinto → redirige a su área (admin → /admin, provider → /proveedor) sin revelar la existencia de la otra.
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
