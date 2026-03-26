/**
 * Datos demo para la vista de detalle de evento (admin).
 * En fase 2 vendrían del backend.
 * Empresas asignadas: getEventProvidersForEvent() + getProviders() (mock-db).
 */

export interface ValidationError {
  title: string
  description: string
}

/** Errores de validación empresarial (demo). */
export const MOCK_VALIDATION_EMPRESAS: ValidationError[] = [
  {
    description: 'Documentación ART vencida (exp: 15/12/2024)',
    title: 'SULLAIR ARGENTINA SA',
  },
  {
    description: 'Falta CAT vigente del trabajador Juan Pérez',
    title: 'SULLAIR ARGENTINA SA',
  },
  {
    description: 'SVO no corresponde al protocolo del evento',
    title: 'ILUMINACIÓN PRO SA',
  },
]

/** Errores de validación vs nómina (demo). */
export const MOCK_VALIDATION_NOMINA: ValidationError[] = [
  { description: 'No figura en nómina del evento', title: 'María González (SULLAIR)' },
  {
    description: 'CUIL no coincide con registro interno',
    title: 'Carlos Rodríguez (ILUMINACIÓN PRO)',
  },
  {
    description: 'No aparece en lista de ingreso autorizada',
    title: 'Ana Martínez (SULLAIR)',
  },
  {
    description: 'Tipo de trabajador no autorizado para este evento',
    title: 'Diego López (SONIDO MASTER)',
  },
  {
    description: 'Duplicado: ya registrado con otra empresa',
    title: 'Laura Fernández (TECNO EVENTOS)',
  },
]

export const MOCK_VALIDATION_EMPRESAS_STATS = { aprobadas: 12, conErrores: 3, total: 15 }
export const MOCK_VALIDATION_NOMINA_STATS = { errores: 5, pendientes: 53, validados: 189 }
