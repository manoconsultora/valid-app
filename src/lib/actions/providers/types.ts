import type { Database } from '@/types/database.types'

export type ProviderCategory = {
  id: string
  name: string
  slug: string
}

export type ProviderRow = {
  id: string
  user_id: string
  category_id: string
  razon_social: string
  cuit: string
  email: string
  phone: string | null
  contact_name: string | null
  contact_role: string | null
  created_at: string
  updated_at: string
}

/** ProviderRow + auth status (last_sign_in_at) for admin. */
export type ProviderRowWithStatus = ProviderRow & { last_sign_in_at: string | null }

export type ProviderInsert = Database['public']['Tables']['providers']['Insert']
export type ProviderUpdate = Database['public']['Tables']['providers']['Update']
