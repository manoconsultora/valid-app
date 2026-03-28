/**
 * Adaptadores DB/API (snake_case) → tipos de app (camelCase).
 */

import type { Company, Employee, Event, Provider, User } from '@/types'
import type {
  DbCompany,
  DbEmployee,
  DbEvent,
  DbEventProvider,
  DbProvider,
  DbUser,
} from '@/types/db'

export const dbUserToApp = (db: DbUser): User => ({
  email: db.email,
  id: db.id,
  name: db.name,
  role: db.role,
})

export const dbProviderToApp = (db: DbProvider): Provider => ({
  categoryId: db.category_id,
  contactName: db.contact_name,
  contactRole: db.contact_role,
  cuit: db.cuit,
  email: db.email,
  id: db.id,
  phone: db.phone,
  razonSocial: db.razon_social,
})

export const dbEventToApp = (
  db: DbEvent,
  providerIds: string[],
  extra: {
    isNew?: boolean
    rejectionReason?: string
  } = {}
): Event => ({
  date: db.date,
  dateDisplay: db.date_display ?? undefined,
  description: db.description,
  employeeCount: db.employee_count ?? undefined,
  flyerUrl: db.flyer_url ?? undefined,
  id: db.id,
  isNew: extra.isNew,
  name: db.name,
  protocolNotes: db.protocol_notes ?? undefined,
  protocolUrl: db.protocol_url ?? undefined,
  providerIds,
  rejectionReason: extra.rejectionReason,
  statusAdmin: db.status_admin,
  statusProvider: db.status_provider ?? undefined,
  timeRange: db.time_range,
  venueId: db.venue_id,
})

export const dbCompanyToApp = (db: DbCompany): Company => ({
  categoryId: db.category_id,
  contactName: db.contact_name ?? '',
  contactRole: db.contact_role ?? '',
  cuit: db.cuit,
  email: db.email,
  id: db.id,
  name: db.name,
  phone: db.phone ?? '',
})

export const dbEmployeeToApp = (db: DbEmployee): Employee => ({
  companyId: db.company_id,
  cuil: db.cuil,
  email: db.email,
  id: db.id,
  name: db.name,
  phone: db.phone ?? '',
  position: db.position,
  status: db.status,
  userId: db.user_id,
})

/** Agrupa event_providers por event_id y devuelve lista de provider_id por evento. */
export function getProviderIdsByEventId(
  eventProviders: DbEventProvider[]
): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const ep of eventProviders) {
    const list = map.get(ep.event_id) ?? []
    list.push(ep.provider_id)
    map.set(ep.event_id, list)
  }
  return map
}
