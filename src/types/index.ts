/**
 * Tipos globales VALID – Fase 1 (UI sin backend).
 */

export type Role = 'admin' | 'proveedor'

export type EventStatusAdmin = 'ARMADO' | 'LIVE' | 'VALIDACIÓN'

export type EventStatusProvider =
  | 'Cargar Documentación'
  | 'Documentación Aprobada'
  | 'Documentación Rechazada'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  /** Solo para demo; en fase 2 no se guarda en cliente. */
  passwordHint?: string
}

export interface Venue {
  id: string
  name: string
  city: 'CABA' | 'Córdoba'
}

export interface ProviderCategory {
  id: string
  name: string
}

export interface Provider {
  id: string
  razonSocial: string
  cuit: string
  categoryId: string
  email: string
  phone: string
  contactName: string
  contactRole: string
}

export interface Event {
  id: string
  name: string
  date: string
  /** Fecha para mostrar en cards (ej. "23-24 Octubre 2026"). */
  dateDisplay?: string
  /** Setup / load-in start date (pre-event). */
  setupStartDate?: string
  /** Teardown / load-out end date (post-event). */
  teardownEndDate?: string
  venueId: string
  timeRange: string
  description: string
  flyerUrl?: string
  protocolUrl?: string
  protocolNotes?: string
  providerIds: string[]
  statusAdmin: EventStatusAdmin
  statusProvider?: EventStatusProvider
  isNew?: boolean
  /** Para proveedor: motivo si rechazado. */
  rejectionReason?: string
  /** Cantidad de empleados (demo/admin). */
  employeeCount?: number
}

export interface Session {
  user: User
  expiresAt: number
}

/** Empleado RRHH (admin – empleados propios / proveedores). */
export interface Employee {
  id: string
  name: string
  cuil: string
  companyId: string
  position: string
  email: string
  phone: string
  status: 'Activo' | 'Inactivo'
}
