import type { Employee } from '@/types'

/**
 * Empleados demo para RRHH (SOP – lista y modal).
 */
export const MOCK_EMPLOYEES: Employee[] = [
  { id: 'emp1', name: 'Julieta Díaz', cuil: '27-38765432-1', companyId: 'popart', position: 'Productora General', email: 'julieta@popart.com', phone: '+54 9 11 1234-5678', status: 'Activo' },
  { id: 'emp2', name: 'Martín Rodríguez', cuil: '20-42765432-8', companyId: 'popart', position: 'Director Técnico', email: 'martin@popart.com', phone: '+54 9 11 1234-5678', status: 'Activo' },
  { id: 'emp3', name: 'Laura González', cuil: '27-35765432-3', companyId: 'popart', position: 'Coordinadora de Producción', email: 'laura@popart.com', phone: '+54 9 11 1234-5678', status: 'Activo' },
  { id: 'emp4', name: 'Carlos Fernández', cuil: '20-39765432-5', companyId: 'segumax', position: 'Jefe de Seguridad', email: 'carlos@segumax.com', phone: '+54 9 11 1234-5678', status: 'Activo' },
  { id: 'emp5', name: 'Sofía Martínez', cuil: '27-41765432-9', companyId: 'eventpro', position: 'Asistente de Producción', email: 'sofia@eventpro.com', phone: '+54 9 11 1234-5678', status: 'Activo' },
  { id: 'emp6', name: 'Diego López', cuil: '20-36765432-2', companyId: 'logistica', position: 'Encargado Logística', email: 'diego@logistica.com', phone: '+54 9 11 1234-5678', status: 'Inactivo' },
]

/** Empresas para select en Agregar Empleado (SOP). */
export const RRHH_COMPANIES = [
  { id: 'popart', name: 'POPART Music (Propia)' },
  { id: 'sullair', name: 'Sullair Argentina' },
  { id: 'eventpro', name: 'EventPro Services' },
  { id: 'segumax', name: 'SeguMax Seguridad' },
  { id: 'techsound', name: 'TechSound Producciones' },
  { id: 'logistica', name: 'Logística Total SA' },
  { id: 'iluminacion', name: 'Iluminación Escénica' },
  { id: 'catering', name: 'Catering & Co' },
] as const
