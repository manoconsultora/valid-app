import { MOCK_USERS } from '@/data/mock-users'
import type { User } from '@/types'

/**
 * Verifica credenciales contra mocks (solo fase 1).
 * En fase 2 se reemplaza por llamada al backend.
 */
export function loginDemo(email: string, password: string): User | null {
  const user = MOCK_USERS.find(
    (u) => u.email === email && u.passwordHint === password
  )
  return user ?? null
}
