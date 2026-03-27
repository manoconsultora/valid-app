'use server'

/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase client: inferencia no coincide con Database; cast en .from necesario. */
import { getUserRole } from '@/lib/auth/roles'
import { inviteSystem } from '@/lib/invite-system-impl/instance'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { updateProviderSchema } from '@/lib/validations/provider'
import type { CreateProviderInput, UpdateProviderInput } from '@/lib/validations/provider'

import {
  enrichProvidersWithAuthStatus,
  ensureCanEditProvider,
  fetchProviderForResend,
  performCreateProviderSteps,
  prepareCreateProviderContext,
  prepareResendInviteContext,
  requireAdmin,
} from './helpers'
import type { ProviderCategory, ProviderRow, ProviderRowWithStatus } from './types'
import {
  buildProviderUpdatePayload,
  getInviteBaseUrl,
  parseZodFieldError,
  toErrorString,
} from './utils'

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
    if (error) {
      return { data: null, error: error.message }
    }
    return { data: data as ProviderCategory[], error: null }
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : 'Error al cargar categorías',
    }
  }
}

export async function listProviders(): Promise<{
  data: ProviderRow[] | null
  error: string | null
}> {
  const role = await getUserRole()
  if (!role) {
    return { data: null, error: 'No autorizado' }
  }
  const supabase = await createServerClient()
  if (role === 'admin') {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .order('razon_social')
    if (error) {
      return { data: null, error: error.message }
    }
    return { data: data as ProviderRow[], error: null }
  }
  const { data: user } = await supabase.auth.getUser()
  if (!user.user?.id) {
    return { data: null, error: 'No hay sesión' }
  }
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('user_id', user.user.id)
  if (error) {
    return { data: null, error: error.message }
  }
  return { data: (data ?? []) as ProviderRow[], error: null }
}

export async function listProvidersWithStatus(): Promise<{
  data: ProviderRowWithStatus[] | null
  error: string | null
}> {
  const role = await getUserRole()
  if (role !== 'admin') {
    return { data: null, error: 'No autorizado' }
  }
  const supabase = await createServerClient()
  const { data: providers, error } = await supabase
    .from('providers')
    .select('*')
    .order('razon_social')
  if (error) {
    return { data: null, error: error.message }
  }
  if (!providers?.length) {
    return { data: [], error: null }
  }
  const withStatus = await enrichProvidersWithAuthStatus(providers as ProviderRow[])
  return { data: withStatus, error: null }
}

export async function createProvider(
  input: CreateProviderInput
): Promise<{ data: { providerId: string } | null; error: string | null }> {
  const out = (data: { providerId: string } | null, error: string | null) =>
    ({ data, error }) as const
  try {
    const prep = await prepareCreateProviderContext(input)
    if (prep.error || !prep.context) {
      return out(null, toErrorString(prep.error ?? 'Error de configuración'))
    }
    const result = await performCreateProviderSteps(prep.context)
    if (result.error) {
      return out(null, toErrorString(result.error))
    }
    const { providerId } = result
    if (!providerId || typeof providerId !== 'string') {
      return out(null, 'No se devolvió el id del proveedor')
    }
    return out({ providerId }, null)
  } catch (e) {
    return out(
      null,
      e instanceof Error ? e.message : 'Error inesperado al crear proveedor'
    )
  }
}

export async function updateProvider(
  id: string,
  input: UpdateProviderInput
): Promise<{ error: string | null }> {
  const parsed = updateProviderSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parseZodFieldError(parsed) }
  }
  const role = await getUserRole()
  const authResult = await ensureCanEditProvider(id, role)
  if (authResult.error) {
    return authResult
  }
  const supabase = await createServerClient()
  const payload = buildProviderUpdatePayload(parsed.data)
  const { error } = await (supabase as any).from('providers').update(payload).eq('id', id)
  if (error) {
    return { error: error.message }
  }
  if (parsed.data.email) {
    const { data: row } = await (supabase as any)
      .from('providers')
      .select('user_id')
      .eq('id', id)
      .single()
    const userId = (row as { user_id: string } | null)?.user_id
    if (userId) {
      const admin = createAdminClient()
      const { error: authErr } = await admin.auth.admin.updateUserById(userId, {
        email: parsed.data.email,
        /* eslint-disable-next-line camelcase -- required by Supabase auth admin API */
        email_confirm: true,
      })
      if (authErr) {
        return {
          error: `Proveedor actualizado pero falló la sincronización del email en Auth: ${authErr.message}`,
        }
      }
      const { error: userErr } = await admin
        .from('users')
        .update({ email: parsed.data.email })
        .eq('id', userId)
      if (userErr) {
        return {
          error: `Email actualizado en Auth pero falló en public.users: ${userErr.message}`,
        }
      }
    }
  }
  return { error: null }
}

export async function resendProviderInvite(
  id: string
): Promise<{ error: string | null }> {
  const prep = await prepareResendInviteContext(id)
  if (prep.error || !prep.context) {
    return { error: prep.error ?? 'Error de configuración' }
  }
  const { baseUrl, provider } = prep.context
  const result = await inviteSystem.invitations.resendInvitation({
    redirectTo: `${baseUrl}/auth/confirm`,
    resourceId: provider.id,
  })
  if (!result.ok) {
    return { error: result.error.message }
  }
  return { error: null }
}

export async function resetProviderPassword(
  id: string
): Promise<{ error: string | null }> {
  const role = await getUserRole()
  if (role !== 'admin') {
    return { error: 'Solo administradores pueden resetear contraseñas' }
  }
  const { data: provider, error: fetchErr } = await fetchProviderForResend(id)
  if (fetchErr || !provider) {
    return { error: fetchErr ?? 'No se encontró el proveedor' }
  }
  const baseUrl = getInviteBaseUrl()
  if (!baseUrl) {
    return { error: 'Falta configurar NEXT_PUBLIC_APP_URL' }
  }
  const result = await inviteSystem.user.requestPasswordReset({
    email: provider.email,
    redirectTo: `${baseUrl}/auth/confirm`,
  })
  if (!result.ok) {
    return { error: result.error.message }
  }
  return { error: null }
}

export async function acceptProviderInvitation(
  userId: string
): Promise<{ error: string | null }> {
  const result = await inviteSystem.invitations.acceptInvitation({ userId })
  if (!result.ok && result.error.code !== 'NOT_FOUND') {
    return { error: result.error.message }
  }
  return { error: null }
}

export async function recreateProviderUser(
  id: string
): Promise<{ error: string | null }> {
  const adminErr = await requireAdmin('Solo administradores pueden recrear usuarios')
  if (adminErr.error) {
    return adminErr
  }
  const { data: provider, error: fetchErr } = await fetchProviderForResend(id)
  if (fetchErr || !provider) {
    return { error: fetchErr ?? 'No se encontró el proveedor' }
  }
  const baseUrl = getInviteBaseUrl()
  if (!baseUrl) {
    return { error: 'Falta configurar NEXT_PUBLIC_APP_URL' }
  }
  const revokeResult = await inviteSystem.invitations.revokeInvitation({ resourceId: id })
  if (!revokeResult.ok) {
    return { error: revokeResult.error.message }
  }
  const createResult = await inviteSystem.invitations.createInvitation({
    email: provider.email,
    /* eslint-disable-next-line camelcase -- metadata key required by Supabase invite API */
    metadata: { first_name: provider.name },
    redirectTo: `${baseUrl}/auth/confirm`,
    resourceId: id,
  })
  if (!createResult.ok) {
    return { error: createResult.error.message }
  }
  const newUserId = createResult.data.invitation.supabaseUserId
  if (newUserId) {
    const supabase = await createServerClient()
    /* eslint-disable-next-line camelcase -- snake_case required by DB column name */
    await (supabase as any).from('providers').update({ user_id: newUserId }).eq('id', id)
  }
  return { error: null }
}
