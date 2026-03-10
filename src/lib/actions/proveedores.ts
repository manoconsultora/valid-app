'use server'

/* eslint-disable camelcase -- Schema y DB usan snake_case (PRD, Supabase). */
import { getUserRole, requireRole } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import {
  createProviderSchema,
  updateProviderSchema,
  type CreateProviderInput,
  type UpdateProviderInput,
} from '@/lib/validations/proveedor'
import type { Database } from '@/types/database.types'

type ProviderInsert = Database['public']['Tables']['providers']['Insert']

export type ProviderCategory = {
  id: string
  slug: string
  name: string
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

/** Lista categorías para selects. Autenticado puede leer (RLS). */
export async function getProviderCategories(): Promise<{
  data: ProviderCategory[] | null
  error: string | null
}> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('provider_categories')
      .select('id, slug, name')
      .order('name')

    if (error) return { data: null, error: error.message }
    return { data: data as ProviderCategory[], error: null }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error al cargar categorías'
    return { data: null, error: message }
  }
}

/** Lista proveedores: admin todos, provider solo el propio. */
export async function listProveedores(): Promise<{
  data: ProviderRow[] | null
  error: string | null
}> {
  const role = await getUserRole()
  if (!role) return { data: null, error: 'No autorizado' }

  const supabase = await createServerClient()
  if (role === 'admin') {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .order('razon_social')
    if (error) return { data: null, error: error.message }
    return { data: data as ProviderRow[], error: null }
  }

  const { data: user } = await supabase.auth.getUser()
  if (!user.user?.id) return { data: null, error: 'No hay sesión' }
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('user_id', user.user.id)
  if (error) return { data: null, error: error.message }
  return { data: (data ?? []) as ProviderRow[], error: null }
}

/**
 * Crea proveedor: usuario en auth (invite por email), asigna rol provider, inserta en providers.
 * Solo admin. No se envía contraseña por mail; Supabase envía link para definir contraseña.
 */
export async function createProveedor(
  input: CreateProviderInput
): Promise<{ data: { providerId: string } | null; error: string | null }> {
  try {
    await requireRole('admin')
  } catch {
    return { data: null, error: 'Solo administradores pueden crear proveedores' }
  }

  const parsed = createProviderSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors
    const msg = Object.values(first).flat().join('. ') || 'Datos inválidos'
    return { data: null, error: msg }
  }

  const {
    razon_social,
    cuit,
    category_id,
    email,
    phone,
    contact_name,
    contact_role,
  } = parsed.data

  const adminClient = createAdminClient()
  const serverClient = await createServerClient()

  const {
    data: { user: newUser },
    error: inviteError,
  } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { name: razon_social },
    redirectTo: undefined,
  })

  if (inviteError) {
    const msg =
      inviteError.message.includes('already been registered') ||
      inviteError.message.includes('already exists')
        ? 'Ya existe un usuario con ese email'
        : inviteError.message
    return { data: null, error: msg }
  }

  if (!newUser?.id) {
    return { data: null, error: 'No se pudo crear el usuario' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase RPC types not inferred from Database
  const { error: roleError } = await (serverClient as any).rpc('assign_user_role', {
    target_user_id: newUser.id,
    new_role: 'provider',
  })

  if (roleError) {
    return {
      data: null,
      error: 'Usuario creado pero falló la asignación de rol: ' + roleError.message,
    }
  }

  const insertPayload: ProviderInsert = {
    user_id: newUser.id,
    category_id,
    razon_social,
    cuit,
    email,
    phone: phone || null,
    contact_name: contact_name || null,
    contact_role: contact_role || null,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase table types not inferred in this project
  const { data: provider, error: insertError } = await (serverClient as any)
    .from('providers')
    .insert(insertPayload)
    .select('id')
    .single()

  if (insertError) {
    return {
      data: null,
      error: 'Usuario y rol creados pero falló el alta del proveedor: ' + insertError.message,
    }
  }

  if (!provider?.id) {
    return { data: null, error: 'No se devolvió el id del proveedor' }
  }
  return { data: { providerId: provider.id }, error: null }
}

/** Actualiza proveedor. Admin: cualquiera; provider: solo el propio. */
export async function updateProveedor(
  id: string,
  input: UpdateProviderInput
): Promise<{ error: string | null }> {
  const parsed = updateProviderSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors
    const msg = Object.values(first).flat().join('. ') || 'Datos inválidos'
    return { error: msg }
  }

  const supabase = await createServerClient()
  const role = await getUserRole()
  if (!role) return { error: 'No autorizado' }

  if (role === 'provider') {
    const { data: row } = await supabase
      .from('providers')
      .select('user_id')
      .eq('id', id)
      .single()
    const rowTyped = row as { user_id: string } | null
    const authRes = await supabase.auth.getUser()
    const currentUserId = authRes.data?.user?.id
    if (!rowTyped || !currentUserId || rowTyped.user_id !== currentUserId) {
      return { error: 'No puedes editar este proveedor' }
    }
  } else if (role !== 'admin') {
    return { error: 'No autorizado' }
  }

  const payload: Database['public']['Tables']['providers']['Update'] = {}
  if (parsed.data.razon_social !== undefined) payload.razon_social = parsed.data.razon_social
  if (parsed.data.cuit !== undefined) payload.cuit = parsed.data.cuit
  if (parsed.data.category_id !== undefined) payload.category_id = parsed.data.category_id
  if (parsed.data.email !== undefined) payload.email = parsed.data.email
  if (parsed.data.phone !== undefined) payload.phone = parsed.data.phone || null
  if (parsed.data.contact_name !== undefined) payload.contact_name = parsed.data.contact_name || null
  if (parsed.data.contact_role !== undefined) payload.contact_role = parsed.data.contact_role || null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase table types not inferred in this project
  const { error } = await (supabase as any).from('providers').update(payload).eq('id', id)

  if (error) return { error: error.message }
  return { error: null }
}
