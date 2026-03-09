import type { SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

import type { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  ''

/**
 * Cliente Supabase para Client Components (login, hooks).
 * Usa @supabase/ssr para compatibilidad con cookies y middleware.
 */
export const createClient = () =>
  createBrowserClient<Database>(supabaseUrl, supabaseKey) as unknown as SupabaseClient<Database>

/** Singleton para uso en componentes. */
export const supabase = createClient()
