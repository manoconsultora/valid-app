import type { User } from '@/types'

/**
 * Usuarios demo (SOP). En fase 1 no hay auth real.
 */
export const MOCK_USERS: User[] = [
  {
    id: 'admin-1',
    email: 'admin@productora.com',
    name: 'Admin Productora',
    role: 'admin',
    passwordHint: 'admin123',
  },
  {
    id: 'prov-1',
    email: 'proveedor@empresa.com',
    name: 'Proveedor Empresa',
    role: 'proveedor',
    passwordHint: 'prov123',
  },
]
