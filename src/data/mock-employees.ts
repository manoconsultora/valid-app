import type { Employee } from '@/types'

/**
 * Empleados demo para RRHH (SOP – lista y modal).
 */
export const MOCK_EMPLOYEES: Employee[] = [
  {
    companyId: 'popart',
    cuil: '27-38765432-1',
    email: 'julieta@popart.com',
    id: 'emp1',
    name: 'Julieta Díaz',
    phone: '+54 9 11 1234-5678',
    position: 'Productora General',
    status: 'Activo',
  },
  {
    companyId: 'popart',
    cuil: '20-42765432-8',
    email: 'martin@popart.com',
    id: 'emp2',
    name: 'Martín Rodríguez',
    phone: '+54 9 11 1234-5678',
    position: 'Director Técnico',
    status: 'Activo',
  },
  {
    companyId: 'popart',
    cuil: '27-35765432-3',
    email: 'laura@popart.com',
    id: 'emp3',
    name: 'Laura González',
    phone: '+54 9 11 1234-5678',
    position: 'Coordinadora de Producción',
    status: 'Activo',
  },
  {
    companyId: 'segumax',
    cuil: '20-39765432-5',
    email: 'carlos@segumax.com',
    id: 'emp4',
    name: 'Carlos Fernández',
    phone: '+54 9 11 1234-5678',
    position: 'Jefe de Seguridad',
    status: 'Activo',
  },
  {
    companyId: 'eventpro',
    cuil: '27-41765432-9',
    email: 'sofia@eventpro.com',
    id: 'emp5',
    name: 'Sofía Martínez',
    phone: '+54 9 11 1234-5678',
    position: 'Asistente de Producción',
    status: 'Activo',
  },
  {
    companyId: 'logistica',
    cuil: '20-36765432-2',
    email: 'diego@logistica.com',
    id: 'emp6',
    name: 'Diego López',
    phone: '+54 9 11 1234-5678',
    position: 'Encargado Logística',
    status: 'Inactivo',
  },
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
