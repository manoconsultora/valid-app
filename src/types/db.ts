/**
 * Tipos que reflejan el esquema de base de datos / API (snake_case).
 * Sirven para Supabase y para respuestas de API.
 */

export type Role = 'admin' | 'proveedor'

export type EventStatusAdmin = 'ARMADO' | 'LIVE' | 'VALIDACIÓN'

export type EventStatusProvider =
  | 'Cargar Documentación'
  | 'Documentación Aprobada'
  | 'Documentación Rechazada'

export type DocumentationStatus = 'pending' | 'approved' | 'rejected' | 'error'

export type ValidationErrorType = 'empresa' | 'nomina'

/** venues */
export interface DbVenue {
  id: string
  name: string
  city: string
  created_at: string
  updated_at: string
}

/** provider_categories */
export interface DbProviderCategory {
  id: string
  name: string
}

/** users / profiles (app user, no auth) */
export interface DbUser {
  id: string
  email: string
  name: string
  role: Role
  created_at: string
  updated_at: string
}

/** providers */
export interface DbProvider {
  id: string
  razon_social: string
  cuit: string
  category_id: string
  email: string
  phone: string
  contact_name: string
  contact_role: string
  created_at: string
  updated_at: string
}

/** events (sin provider_ids; relación en event_providers) */
export interface DbEvent {
  id: string
  name: string
  date: string
  date_display: string | null
  venue_id: string
  time_range: string
  description: string
  flyer_url: string | null
  protocol_url: string | null
  protocol_notes: string | null
  status_admin: EventStatusAdmin
  status_provider: EventStatusProvider | null
  employee_count: number | null
  created_at: string
  updated_at: string
}

/** event_providers (tabla junction evento–proveedor) */
export interface DbEventProvider {
  event_id: string
  provider_id: string
  employee_count: number
  documentation_status: DocumentationStatus
  created_at: string
  updated_at: string
}

/** validation_errors */
export interface DbValidationError {
  id: string
  event_id: string
  type: ValidationErrorType
  entity_ref: string
  description: string
  created_at: string
}

/** employees (RRHH) */
export interface DbEmployee {
  id: string
  name: string
  cuil: string
  company_id: string
  position: string
  email: string
  phone: string
  status: 'Activo' | 'Inactivo'
  created_at: string
  updated_at: string
}

/** companies (opcional, para RRHH) */
export interface DbCompany {
  id: string
  name: string
  created_at: string
  updated_at: string
}
