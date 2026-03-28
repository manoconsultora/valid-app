'use server'

/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase client: inferencia no coincide con Database; cast en .from necesario. */
import { requireAdmin } from '../providers/helpers'
import { parseZodFieldError } from '../providers/utils'
import { createServerClient } from '@/lib/supabase/server'
import { createCompanySchema, updateCompanySchema } from '@/lib/validations/company'
import type { CreateCompanyInput, UpdateCompanyInput } from '@/lib/validations/company'

import type { CompanyRow } from './types'

export async function listCompanies(): Promise<{
  data: CompanyRow[] | null
  error: string | null
}> {
  const adminErr = await requireAdmin('Solo administradores pueden ver empresas')
  if (adminErr.error) {
    return { data: null, error: adminErr.error }
  }
  try {
    const supabase = await createServerClient()
    const { data, error } = await (supabase as any)
      .from('companies')
      .select('*')
      .order('name')
    if (error) {
      return { data: null, error: error.message }
    }
    return { data: data as CompanyRow[], error: null }
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : 'Error al cargar empresas',
    }
  }
}

export async function createCompany(
  input: CreateCompanyInput
): Promise<{ data: { companyId: string } | null; error: string | null }> {
  const adminErr = await requireAdmin('Solo administradores pueden crear empresas')
  if (adminErr.error) {
    return { data: null, error: adminErr.error }
  }
  const parsed = createCompanySchema.safeParse(input)
  if (!parsed.success) {
    return { data: null, error: parseZodFieldError(parsed) }
  }
  try {
    const supabase = await createServerClient()
    /* eslint-disable camelcase -- DB insert uses snake_case column names */
    const { data, error } = await (supabase as any)
      .from('companies')
      .insert({
        category_id: parsed.data.category_id,
        contact_name: parsed.data.contact_name || null,
        contact_role: parsed.data.contact_role || null,
        cuit: parsed.data.cuit,
        email: parsed.data.email,
        name: parsed.data.name,
        phone: parsed.data.phone || null,
      })
      /* eslint-enable camelcase */
      .select('id')
      .single()
    if (error) {
      return { data: null, error: error.message }
    }
    const row = data as { id: string } | null
    if (!row?.id) {
      return { data: null, error: 'No se devolvió el id de la empresa' }
    }
    return { data: { companyId: row.id }, error: null }
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : 'Error al crear empresa',
    }
  }
}

export async function updateCompany(
  id: string,
  input: UpdateCompanyInput
): Promise<{ error: string | null }> {
  const adminErr = await requireAdmin('Solo administradores pueden editar empresas')
  if (adminErr.error) {
    return adminErr
  }
  const parsed = updateCompanySchema.safeParse(input)
  if (!parsed.success) {
    return { error: parseZodFieldError(parsed) }
  }
  try {
    const supabase = await createServerClient()
    const { error } = await (supabase as any)
      .from('companies')
      .update(parsed.data)
      .eq('id', id)
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al actualizar empresa' }
  }
}
