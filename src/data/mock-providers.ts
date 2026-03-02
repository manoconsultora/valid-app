import type { Provider } from '@/types'

/**
 * Proveedores demo (SOP – 5 empresas para Crear Evento y listado Proveedores).
 */
export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'p1',
    razonSocial: 'SULLAIR ARGENTINA SA',
    cuit: '30-57672171-0',
    categoryId: 'equipamiento',
    email: 'contacto@sullair.com',
    phone: '+54 9 11 1234-5678',
    contactName: 'Nombre del responsable',
    contactRole: 'Recursos Humanos',
  },
  {
    id: 'p2',
    razonSocial: 'TECNO EVENTOS SRL',
    cuit: '30-71234567-8',
    categoryId: 'tecnologia',
    email: 'tecno@eventos.com',
    phone: '+54 9 11 1234-5678',
    contactName: 'Nombre del responsable',
    contactRole: 'Gerente de Operaciones',
  },
  {
    id: 'p3',
    razonSocial: 'ILUMINACIÓN PRO SA',
    cuit: '30-61234567-9',
    categoryId: 'iluminacion',
    email: 'info@iluminacionpro.com',
    phone: '+54 9 11 1234-5678',
    contactName: 'Nombre del responsable',
    contactRole: 'Dueño',
  },
  {
    id: 'p4',
    razonSocial: 'SONIDO MASTER SRL',
    cuit: '30-81234567-0',
    categoryId: 'audio',
    email: 'sonido@master.com',
    phone: '+54 9 11 1234-5678',
    contactName: 'Nombre del responsable',
    contactRole: 'Director Técnico',
  },
  {
    id: 'p5',
    razonSocial: 'ESTRUCTURAS ELITE SA',
    cuit: '30-91234567-1',
    categoryId: 'montaje',
    email: 'estructuras@elite.com',
    phone: '+54 9 11 1234-5678',
    contactName: 'Nombre del responsable',
    contactRole: 'Gerente de Operaciones',
  },
]
