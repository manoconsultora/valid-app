import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  ''

/**
 * Cliente Supabase para Client Components (hooks, login).
 * Usa @supabase/ssr para compatibilidad con middleware y cookies.
 */
export const createClient = () =>
  createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey
  ) as unknown as SupabaseClient<Database>

/** Singleton para useAuth, authService y componentes cliente. */
export const supabase = createClient()
