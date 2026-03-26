import { requireRole } from '@/lib/auth/roles'
import { inviteSystem } from '@/lib/invite-system-impl/instance'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { createProviderSchema } from '@/lib/validations/provider'
import type { CreateProviderInput } from '@/lib/validations/provider'

import type { ProviderInsert, ProviderRow, ProviderRowWithStatus } from './types'
import {
  buildProviderInsertPayload,
  getInviteBaseUrl,
  parseZodFieldError,
  toErrorString,
} from './utils'

export type CreateProviderContext = {
  baseUrl: string
  data: CreateProviderInput
  providerId: string
}

export type ResendInviteContext = {
  baseUrl: string
  provider: { email: string; id: string; name: string }
}

export async function enrichProvidersWithAuthStatus(
  providers: ProviderRow[]
): Promise<ProviderRowWithStatus[]> {
  const adminClient = createAdminClient()
  const out: ProviderRowWithStatus[] = []
  for (const p of providers) {
    const { data: authData } = await adminClient.auth.admin.getUserById(p.user_id)
    /* eslint-disable-next-line camelcase -- snake_case required by ProviderRowWithStatus DB type */
    const last_sign_in_at = authData?.user?.last_sign_in_at ?? null
    /* eslint-disable-next-line camelcase -- snake_case required by ProviderRowWithStatus DB type */
    out.push({ ...p, last_sign_in_at })
  }
  return out
}

export async function insertProviderRecord(
  payload: ProviderInsert
): Promise<{ error: string | null; providerId: string | null }> {
  /* eslint-disable @typescript-eslint/no-explicit-any -- Supabase Insert no infiere id opcional correctamente */
  const supabase = await createServerClient()
  const { data, error } = await (supabase as any)
    .from('providers')
    .insert(payload)
    .select('id')
    .single()
  /* eslint-enable @typescript-eslint/no-explicit-any */
  if (error) {
    return {
      error: `Usuario invitado pero falló el alta del proveedor: ${toErrorString(error)}`,
      providerId: null,
    }
  }
  const raw = data as { id?: string } | null
  const providerId = raw?.id != null ? String(raw.id) : null
  return { error: null, providerId }
}

export async function fetchProviderForResend(id: string): Promise<{
  data: { email: string; id: string; name: string } | null
  error: string | null
}> {
  const supabase = await createServerClient()
  const { data: row, error } = await supabase
    .from('providers')
    .select('email, id, razon_social')
    .eq('id', id)
    .single()
  const typed = row as { email: string; id: string; razon_social: string } | null
  if (error || !typed?.email) {
    return {
      data: null,
      error: error?.message ?? 'No se encontró el proveedor o su email',
    }
  }
  return {
    data: { email: typed.email, id: typed.id, name: typed.razon_social },
    error: null,
  }
}

export async function requireAdmin(
  errorMessage: string
): Promise<{ error: string | null }> {
  try {
    await requireRole('admin')
    return { error: null }
  } catch {
    return { error: errorMessage }
  }
}

export async function prepareCreateProviderContext(
  input: CreateProviderInput
): Promise<{ context: CreateProviderContext | null; error: string | null }> {
  const adminErr = await requireAdmin('Solo administradores pueden crear proveedores')
  if (adminErr.error) {
    return { context: null, error: adminErr.error }
  }
  const parsed = createProviderSchema.safeParse(input)
  if (!parsed.success) {
    return { context: null, error: parseZodFieldError(parsed) }
  }
  const baseUrl = getInviteBaseUrl()
  if (!baseUrl) {
    return {
      context: null,
      error: 'Falta configurar NEXT_PUBLIC_APP_URL para poder enviar la invitación',
    }
  }
  const providerId = crypto.randomUUID()
  return { context: { baseUrl, data: parsed.data, providerId }, error: null }
}

export async function prepareResendInviteContext(
  id: string
): Promise<{ context: ResendInviteContext | null; error: string | null }> {
  const adminErr = await requireAdmin('Solo administradores pueden reenviar invitaciones')
  if (adminErr.error) {
    return { context: null, error: adminErr.error }
  }
  const { data: provider, error: fetchErr } = await fetchProviderForResend(id)
  if (fetchErr || !provider) {
    return { context: null, error: fetchErr ?? 'No se encontró el proveedor' }
  }
  const baseUrl = getInviteBaseUrl()
  if (!baseUrl) {
    return {
      context: null,
      error: 'Falta configurar NEXT_PUBLIC_APP_URL para poder enviar la invitación',
    }
  }
  return { context: { baseUrl, provider }, error: null }
}

export async function performCreateProviderSteps(
  ctx: CreateProviderContext
): Promise<{ error: string | null; providerId: string | null }> {
  const result = await inviteSystem.invitations.createInvitation({
    email: ctx.data.email,
    /* eslint-disable-next-line camelcase -- metadata key required by Supabase invite API */
    metadata: { first_name: ctx.data.razon_social },
    redirectTo: `${ctx.baseUrl}/auth/confirm`,
    resourceId: ctx.providerId,
  })
  if (!result.ok) {
    return { error: result.error.message, providerId: null }
  }

  const userId = result.data.invitation.supabaseUserId
  if (!userId) {
    return { error: 'No se recibió el userId del usuario invitado', providerId: null }
  }

  const payload = buildProviderInsertPayload(ctx.data, userId, ctx.providerId)
  const { error: insertErr, providerId } = await insertProviderRecord(payload)
  if (insertErr || !providerId) {
    return {
      error: toErrorString(insertErr ?? 'No se devolvió el id del proveedor'),
      providerId: null,
    }
  }

  return { error: null, providerId }
}

export async function ensureCanEditProvider(
  providerId: string,
  role: string | null
): Promise<{ error: string | null }> {
  if (!role) {
    return { error: 'No autorizado' }
  }
  if (role === 'admin') {
    return { error: null }
  }
  if (role !== 'provider') {
    return { error: 'No autorizado' }
  }
  const supabase = await createServerClient()
  const { data: row } = await supabase
    .from('providers')
    .select('user_id')
    .eq('id', providerId)
    .single()
  const rowTyped = row as { user_id: string } | null
  const authRes = await supabase.auth.getUser()
  const currentUserId = authRes.data?.user?.id
  if (!rowTyped || !currentUserId || rowTyped.user_id !== currentUserId) {
    return { error: 'No puedes editar este proveedor' }
  }
  return { error: null }
}
