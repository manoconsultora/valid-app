'use server'

/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase client: inferencia no coincide con Database; cast en .from necesario. */
import { requireAdmin } from '../providers/helpers'
import { getInviteBaseUrl, parseZodFieldError } from '../providers/utils'
import { inviteSystem } from '@/lib/invite-system-impl/instance'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { createEmployeeSchema } from '@/lib/validations/employee'
import type { CreateEmployeeInput } from '@/lib/validations/employee'

import type { EmployeeRow, EmployeeRowWithStatus } from './types'

export async function listEmployeesWithStatus(): Promise<{
  data: EmployeeRowWithStatus[] | null
  error: string | null
}> {
  const adminErr = await requireAdmin('Solo administradores pueden ver empleados')
  if (adminErr.error) {
    return { data: null, error: adminErr.error }
  }
  try {
    const supabase = await createServerClient()
    const { data, error } = await (supabase as any)
      .from('employees')
      .select('*')
      .order('name')
    if (error) {
      return { data: null, error: error.message }
    }
    const rows = (data ?? []) as EmployeeRow[]
    if (!rows.length) {
      return { data: [], error: null }
    }
    const adminClient = createAdminClient()
    const withStatus: EmployeeRowWithStatus[] = []
    for (const row of rows) {
      let lastSignInAt: string | null = null
      if (row.user_id) {
        const { data: authData } = await adminClient.auth.admin.getUserById(row.user_id)
        lastSignInAt = authData?.user?.last_sign_in_at ?? null
      }
      /* eslint-disable-next-line camelcase -- snake_case key required by EmployeeRowWithStatus */
      withStatus.push({ ...row, last_sign_in_at: lastSignInAt })
    }
    return { data: withStatus, error: null }
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : 'Error al cargar empleados',
    }
  }
}

export async function createEmployee(
  input: CreateEmployeeInput
): Promise<{ data: { employeeId: string } | null; error: string | null }> {
  const adminErr = await requireAdmin('Solo administradores pueden crear empleados')
  if (adminErr.error) {
    return { data: null, error: adminErr.error }
  }
  const parsed = createEmployeeSchema.safeParse(input)
  if (!parsed.success) {
    return { data: null, error: parseZodFieldError(parsed) }
  }
  const employeeId = crypto.randomUUID()
  let userId: string | null = null

  if (parsed.data.has_dashboard_access) {
    const baseUrl = getInviteBaseUrl()
    if (!baseUrl) {
      return {
        data: null,
        error: 'Falta configurar NEXT_PUBLIC_APP_URL para enviar la invitación',
      }
    }
    const result = await inviteSystem.invitations.createInvitation({
      email: parsed.data.email,
      /* eslint-disable-next-line camelcase -- metadata key required by Supabase invite API */
      metadata: { first_name: parsed.data.name },
      redirectTo: `${baseUrl}/auth/confirm`,
      resourceId: employeeId,
      role: 'admin',
    })
    if (!result.ok) {
      return { data: null, error: result.error.message }
    }
    userId = result.data.invitation.supabaseUserId
  }

  try {
    const supabase = await createServerClient()
    /* eslint-disable camelcase -- DB insert uses snake_case column names */
    const { data, error } = await (supabase as any)
      .from('employees')
      .insert({
        company_id: parsed.data.company_id,
        cuil: parsed.data.cuil,
        email: parsed.data.email,
        id: employeeId,
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        position: parsed.data.position,
        status: parsed.data.status,
        user_id: userId,
      })
      /* eslint-enable camelcase */
      .select('id')
      .single()
    if (error) {
      return { data: null, error: error.message }
    }
    const row = data as { id: string } | null
    if (!row?.id) {
      return { data: null, error: 'No se devolvió el id del empleado' }
    }
    return { data: { employeeId: row.id }, error: null }
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : 'Error al crear empleado',
    }
  }
}

export async function resendEmployeeInvite(
  id: string
): Promise<{ error: string | null }> {
  const adminErr = await requireAdmin('Solo administradores pueden reenviar invitaciones')
  if (adminErr.error) {
    return adminErr
  }
  const baseUrl = getInviteBaseUrl()
  if (!baseUrl) {
    return { error: 'Falta configurar NEXT_PUBLIC_APP_URL' }
  }
  const result = await inviteSystem.invitations.resendInvitation({
    redirectTo: `${baseUrl}/auth/confirm`,
    resourceId: id,
  })
  if (!result.ok) {
    return { error: result.error.message }
  }
  return { error: null }
}

export async function resetEmployeePassword(
  id: string
): Promise<{ error: string | null }> {
  const adminErr = await requireAdmin('Solo administradores pueden resetear contraseñas')
  if (adminErr.error) {
    return adminErr
  }
  const supabase = await createServerClient()
  const { data: row, error: fetchErr } = await (supabase as any)
    .from('employees')
    .select('email')
    .eq('id', id)
    .single()
  if (fetchErr || !row) {
    return { error: fetchErr?.message ?? 'No se encontró el empleado' }
  }
  const baseUrl = getInviteBaseUrl()
  if (!baseUrl) {
    return { error: 'Falta configurar NEXT_PUBLIC_APP_URL' }
  }
  const result = await inviteSystem.user.requestPasswordReset({
    email: (row as { email: string }).email,
    redirectTo: `${baseUrl}/auth/confirm`,
  })
  if (!result.ok) {
    return { error: result.error.message }
  }
  return { error: null }
}

export async function recreateEmployeeUser(
  id: string
): Promise<{ error: string | null }> {
  const adminErr = await requireAdmin('Solo administradores pueden recrear usuarios')
  if (adminErr.error) {
    return adminErr
  }
  const supabase = await createServerClient()
  const { data: row, error: fetchErr } = await (supabase as any)
    .from('employees')
    .select('email, name')
    .eq('id', id)
    .single()
  if (fetchErr || !row) {
    return { error: fetchErr?.message ?? 'No se encontró el empleado' }
  }
  const baseUrl = getInviteBaseUrl()
  if (!baseUrl) {
    return { error: 'Falta configurar NEXT_PUBLIC_APP_URL' }
  }
  const revokeResult = await inviteSystem.invitations.revokeInvitation({ resourceId: id })
  if (!revokeResult.ok) {
    return { error: revokeResult.error.message }
  }
  const employee = row as { email: string; name: string }
  const createResult = await inviteSystem.invitations.createInvitation({
    email: employee.email,
    /* eslint-disable-next-line camelcase -- metadata key required by Supabase invite API */
    metadata: { first_name: employee.name },
    redirectTo: `${baseUrl}/auth/confirm`,
    resourceId: id,
    role: 'admin',
  })
  if (!createResult.ok) {
    return { error: createResult.error.message }
  }
  const newUserId = createResult.data.invitation.supabaseUserId
  if (newUserId) {
    /* eslint-disable-next-line camelcase -- snake_case required by DB column name */
    await (supabase as any).from('employees').update({ user_id: newUserId }).eq('id', id)
  }
  return { error: null }
}
