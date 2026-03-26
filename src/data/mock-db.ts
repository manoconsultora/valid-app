/**
 * Datos demo en forma API/DB (snake_case).
 * Fuente única para mocks; los stores exponen en camelCase vía adapters.
 */
/* eslint-disable camelcase -- DB/API shape uses snake_case */
/* eslint-disable sort-keys -- keys match DB column order */

import type { DbEvent, DbEventProvider, DbProvider, DbValidationError } from '@/types/db'

const now = '2024-01-01T00:00:00Z'

/** providers */
export const DB_PROVIDERS: DbProvider[] = [
  {
    id: 'p1',
    category_id: 'equipamiento',
    contact_name: 'Nombre del responsable',
    contact_role: 'Recursos Humanos',
    cuit: '30-57672171-0',
    email: 'valid-app+sullair@ma-no.work',
    phone: '+54 9 11 1234-5678',
    razon_social: 'SULLAIR ARGENTINA SA',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'p2',
    category_id: 'tecnologia',
    contact_name: 'Nombre del responsable',
    contact_role: 'Gerente de Operaciones',
    cuit: '30-71234567-8',
    email: 'valid-app+eventos@ma-no.work',
    phone: '+54 9 11 1234-5678',
    razon_social: 'TECNO EVENTOS SRL',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'p3',
    category_id: 'iluminacion',
    contact_name: 'Nombre del responsable',
    contact_role: 'Dueño',
    cuit: '30-61234567-9',
    email: 'valid-app+iluminacionpro@ma-no.work',
    phone: '+54 9 11 1234-5678',
    razon_social: 'ILUMINACIÓN PRO SA',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'p4',
    category_id: 'audio',
    contact_name: 'Nombre del responsable',
    contact_role: 'Director Técnico',
    cuit: '30-81234567-0',
    email: 'valid-app+master@ma-no.work',
    phone: '+54 9 11 1234-5678',
    razon_social: 'SONIDO MASTER SRL',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'p5',
    category_id: 'montaje',
    contact_name: 'Nombre del responsable',
    contact_role: 'Gerente de Operaciones',
    cuit: '30-91234567-1',
    email: 'valid-app+elite@ma-no.work',
    phone: '+54 9 11 1234-5678',
    razon_social: 'ESTRUCTURAS ELITE SA',
    created_at: now,
    updated_at: now,
  },
]

/** events (sin provider_ids) */
export const DB_EVENTS: DbEvent[] = [
  {
    id: 'e0',
    date: '2026-10-23',
    date_display: '23-24 Oct 2026',
    description: 'BTS World Tour 2026.',
    employee_count: 450,
    flyer_url: '/eventos/bts-flyer.png',
    name: 'BTS WORLD TOUR 2026',
    protocol_notes: null,
    protocol_url: null,
    status_admin: 'ARMADO',
    status_provider: 'Documentación Rechazada',
    time_range: '20:00 - 00:00',
    venue_id: 'river',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'e1',
    date: '2024-10-29',
    date_display: '20 Oct 2024',
    description: 'La Vela Puerca en concierto.',
    employee_count: 17,
    flyer_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    name: 'La Vela Puerca',
    protocol_notes: null,
    protocol_url: null,
    status_admin: 'LIVE',
    status_provider: 'Cargar Documentación',
    time_range: '20:00 - 00:00',
    venue_id: 'niceto',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'e2',
    date: '2024-11-15',
    date_display: '15 Nov 2024',
    description: 'Divididos en vivo.',
    employee_count: 20,
    flyer_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    name: 'Divididos',
    protocol_notes: null,
    protocol_url: null,
    status_admin: 'VALIDACIÓN',
    status_provider: 'Cargar Documentación',
    time_range: '20:00 - 00:00',
    venue_id: 'velez',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'e3',
    date: '2024-10-05',
    date_display: '05 Oct 2024',
    description: 'Miranda! en Luna Park.',
    employee_count: 12,
    flyer_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    name: 'Miranda!',
    protocol_notes: null,
    protocol_url: null,
    status_admin: 'VALIDACIÓN',
    status_provider: 'Documentación Aprobada',
    time_range: '20:00 - 00:00',
    venue_id: 'luna',
    created_at: now,
    updated_at: now,
  },
]

/** event_providers (N:M); una fila por (event_id, provider_id) */
function buildEventProviders(): DbEventProvider[] {
  const statusByProvider: Record<string, 'pending' | 'approved' | 'rejected' | 'error'> =
    {
      p1: 'error',
      p2: 'approved',
      p3: 'error',
      p4: 'approved',
      p5: 'approved',
    }
  const employeeCountByProvider: Record<string, number> = {
    p1: 17,
    p2: 12,
    p3: 8,
    p4: 15,
    p5: 0,
  }
  const eventIds = DB_EVENTS.map(e => e.id)
  const providerIds = DB_PROVIDERS.map(p => p.id)
  const rows: DbEventProvider[] = []
  for (const eventId of eventIds) {
    for (const providerId of providerIds) {
      rows.push({
        created_at: now,
        documentation_status: statusByProvider[providerId] ?? 'pending',
        employee_count: employeeCountByProvider[providerId] ?? 0,
        event_id: eventId,
        provider_id: providerId,
        updated_at: now,
      })
    }
  }
  return rows
}

export const DB_EVENT_PROVIDERS: DbEventProvider[] = buildEventProviders()

export const getEventProvidersForEvent = (eventId: string): DbEventProvider[] =>
  DB_EVENT_PROVIDERS.filter(ep => ep.event_id === eventId)

/** validation_errors (por evento; demo para evento actual) */
export const DB_VALIDATION_ERRORS: DbValidationError[] = [
  {
    id: 've1',
    event_id: 'e0',
    type: 'empresa',
    entity_ref: 'SULLAIR ARGENTINA SA',
    description: 'Documentación ART vencida (exp: 15/12/2024)',
    created_at: now,
  },
  {
    id: 've2',
    event_id: 'e0',
    type: 'empresa',
    entity_ref: 'SULLAIR ARGENTINA SA',
    description: 'Falta CAT vigente del trabajador Juan Pérez',
    created_at: now,
  },
  {
    id: 've3',
    event_id: 'e0',
    type: 'empresa',
    entity_ref: 'ILUMINACIÓN PRO SA',
    description: 'SVO no corresponde al protocolo del evento',
    created_at: now,
  },
  {
    id: 'vn1',
    event_id: 'e0',
    type: 'nomina',
    entity_ref: 'María González (SULLAIR)',
    description: 'No figura en nómina del evento',
    created_at: now,
  },
  {
    id: 'vn2',
    event_id: 'e0',
    type: 'nomina',
    entity_ref: 'Carlos Rodríguez (ILUMINACIÓN PRO)',
    description: 'CUIL no coincide con registro interno',
    created_at: now,
  },
  {
    id: 'vn3',
    event_id: 'e0',
    type: 'nomina',
    entity_ref: 'Ana Martínez (SULLAIR)',
    description: 'No aparece en lista de ingreso autorizada',
    created_at: now,
  },
  {
    id: 'vn4',
    event_id: 'e0',
    type: 'nomina',
    entity_ref: 'Diego López (SONIDO MASTER)',
    description: 'Tipo de trabajador no autorizado para este evento',
    created_at: now,
  },
  {
    id: 'vn5',
    event_id: 'e0',
    type: 'nomina',
    entity_ref: 'Laura Fernández (TECNO EVENTOS)',
    description: 'Duplicado: ya registrado con otra empresa',
    created_at: now,
  },
]
