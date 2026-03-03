import type { User } from '@/types'

/**
 * Usuarios demo (SOP). En fase 1 no hay auth real.
 */

/*eslint-disable sort-keys -- keys are intentionally out of order for demo purposes */

export const MOCK_USERS: User[] = [
  {
    id: 'admin-1',
    email: 'admin@productora.com',
    name: 'Admin Productora',
    passwordHint: 'admin123',
    role: 'admin',
  },
  {
    id: 'prov-1',
    email: 'proveedor@empresa.com',
    name: 'Proveedor Empresa',
    passwordHint: 'prov123',
    role: 'proveedor',
   
  },
]
