import type { User } from '@/types'

/**
 * Referencia para crear usuarios de prueba en Supabase (Auth + public.users).
 * No se importa en la app; auth real vía useAuth / Supabase.
 */

/* eslint-disable sort-keys -- keys are intentionally out of order for demo reference */

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
    role: 'provider',
  },
]
