import 'server-only'

import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'

/**
 * Cliente Supabase con service_role para operaciones admin (ej. inviteUserByEmail).
 * Solo usar en Server Actions; nunca exponer la key (no NEXT_PUBLIC_). auth-security.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for admin client'
    )
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
