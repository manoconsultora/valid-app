/**
 * Datos demo para la vista de detalle de evento (admin).
 * En fase 2 vendrían del backend.
 */

export interface CompanyAssignment {
  cuit: string
  employees: number
  razonSocial: string
  status: 'error' | 'success'
}

export interface ValidationError {
  title: string
  description: string
}

/** Empresas asignadas con estado de documentación (demo). */
export const MOCK_COMPANIES: CompanyAssignment[] = [
  { cuit: '30-57672171-0', employees: 17, razonSocial: 'SULLAIR ARGENTINA SA', status: 'error' },
  { cuit: '30-71234567-8', employees: 12, razonSocial: 'TECNO EVENTOS SRL', status: 'success' },
  { cuit: '30-61234567-9', employees: 8, razonSocial: 'ILUMINACIÓN PRO SA', status: 'error' },
  { cuit: '30-81234567-0', employees: 15, razonSocial: 'SONIDO MASTER SRL', status: 'success' },
]

/** Errores de validación empresarial (demo). */
export const MOCK_VALIDATION_EMPRESAS: ValidationError[] = [
  { title: 'SULLAIR ARGENTINA SA', description: 'Documentación ART vencida (exp: 15/12/2024)' },
  { title: 'SULLAIR ARGENTINA SA', description: 'Falta CAT vigente del trabajador Juan Pérez' },
  { title: 'ILUMINACIÓN PRO SA', description: 'SVO no corresponde al protocolo del evento' },
]

/** Errores de validación vs nómina (demo). */
export const MOCK_VALIDATION_NOMINA: ValidationError[] = [
  { title: 'María González (SULLAIR)', description: 'No figura en nómina del evento' },
  { title: 'Carlos Rodríguez (ILUMINACIÓN PRO)', description: 'CUIL no coincide con registro interno' },
  { title: 'Ana Martínez (SULLAIR)', description: 'No aparece en lista de ingreso autorizada' },
  { title: 'Diego López (SONIDO MASTER)', description: 'Tipo de trabajador no autorizado para este evento' },
  { title: 'Laura Fernández (TECNO EVENTOS)', description: 'Duplicado: ya registrado con otra empresa' },
]

export const MOCK_VALIDATION_EMPRESAS_STATS = { aprobadas: 12, conErrores: 3, total: 15 }
export const MOCK_VALIDATION_NOMINA_STATS = { validados: 189, errores: 5, pendientes: 53 }
