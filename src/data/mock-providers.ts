import type { Provider } from '@/types'

/**
 * Proveedores demo (SOP – 5 empresas para Crear Evento y listado Proveedores).
 */

/* eslint-disable sort-keys -- keys are intentionally out of order for demo purposes */
export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'p1',
    categoryId: 'equipamiento',
    contactName: 'Nombre del responsable',
    contactRole: 'Recursos Humanos',
    cuit: '30-57672171-0',
    email: 'contacto@sullair.com',
    phone: '+54 9 11 1234-5678',
    razonSocial: 'SULLAIR ARGENTINA SA',
  },
  {
    id: 'p2',
    categoryId: 'tecnologia',
    contactName: 'Nombre del responsable',
    contactRole: 'Gerente de Operaciones',
    cuit: '30-71234567-8',
    email: 'tecno@eventos.com',
    phone: '+54 9 11 1234-5678',
    razonSocial: 'TECNO EVENTOS SRL',
  },
  {
    id: 'p3',
    categoryId: 'iluminacion',
    contactName: 'Nombre del responsable',
    contactRole: 'Dueño',
    cuit: '30-61234567-9',
    email: 'info@iluminacionpro.com',
    phone: '+54 9 11 1234-5678',
    razonSocial: 'ILUMINACIÓN PRO SA',
  },
  {
    id: 'p4',
    categoryId: 'audio',
    contactName: 'Nombre del responsable',
    contactRole: 'Director Técnico',
    cuit: '30-81234567-0',
    email: 'sonido@master.com',
    phone: '+54 9 11 1234-5678',
    razonSocial: 'SONIDO MASTER SRL',
  },
  {
    id: 'p5',
    categoryId: 'montaje',
    contactName: 'Nombre del responsable',
    contactRole: 'Gerente de Operaciones',
    cuit: '30-91234567-1',
    email: 'estructuras@elite.com',
    phone: '+54 9 11 1234-5678',
    razonSocial: 'ESTRUCTURAS ELITE SA',
  },
]
