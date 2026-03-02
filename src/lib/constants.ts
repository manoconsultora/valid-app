import type { Venue } from '@/types'

/**
 * Lugares para crear evento (SOP: optgroups CABA / Córdoba).
 */
export const VENUES: Venue[] = [
  { id: 'movistar', name: 'Movistar Arena', city: 'CABA' },
  { id: 'velez', name: 'Estadio Vélez Sarsfield', city: 'CABA' },
  { id: 'river', name: 'Estadio Monumental (River Plate)', city: 'CABA' },
  { id: 'luna', name: 'Luna Park', city: 'CABA' },
  { id: 'obras', name: 'Estadio Obras Sanitarias', city: 'CABA' },
  { id: 'rex', name: 'Teatro Gran Rex', city: 'CABA' },
  { id: 'colon', name: 'Teatro Colón', city: 'CABA' },
  { id: 'artmedia', name: 'C Complejo Art Media', city: 'CABA' },
  { id: 'palermo', name: 'Hipódromo de Palermo', city: 'CABA' },
  { id: 'sanisidro', name: 'Hipódromo de San Isidro', city: 'CABA' },
  { id: 'allboys', name: 'Estadio All Boys', city: 'CABA' },
  { id: 'malvinas', name: 'Microestadio Malvinas Argentinas', city: 'CABA' },
  { id: 'ciudad', name: 'Club Ciudad de Buenos Aires', city: 'CABA' },
  { id: 'niceto', name: 'Niceto Club', city: 'CABA' },
  { id: 'groove', name: 'Groove', city: 'CABA' },
  { id: 'cosquin', name: 'Aeródromo Santa María de Punilla', city: 'Córdoba' },
  { id: 'kempes', name: 'Estadio Mario Alberto Kempes', city: 'Córdoba' },
  { id: 'quality', name: 'Quality Espacio', city: 'Córdoba' },
]

export const PROVIDER_CATEGORIES = [
  { id: 'equipamiento', name: 'Equipamiento' },
  { id: 'tecnologia', name: 'Tecnología' },
  { id: 'iluminacion', name: 'Iluminación' },
  { id: 'audio', name: 'Audio' },
  { id: 'montaje', name: 'Montaje' },
  { id: 'seguridad', name: 'Seguridad' },
  { id: 'catering', name: 'Catering' },
  { id: 'transporte', name: 'Transporte' },
] as const

/** Roles para Cargar trabajador (SOP). */
export const WORKER_ROLES = [
  'Técnico de Sonido',
  'Técnico de Luces',
  'Armador de Escenario',
  'Electricista',
  'Rigger',
  'Asistente de Producción',
  'Seguridad',
  'Logística',
  'Otro',
] as const

/** Tipos de documento Validación A (SOP). */
export const VALIDACION_A_DOC_TYPES = [
  { id: 'art', name: 'ART' },
  { id: 'ap', name: 'AP' },
  { id: 'cat', name: 'CAT (Alta Temprana)' },
  { id: 'svo', name: 'SVO' },
  { id: 'cnr', name: 'CNR' },
  { id: 'nomina', name: 'Nómina Vigente' },
  { id: 'f931', name: 'F931' },
] as const
