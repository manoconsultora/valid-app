import type { Session, User } from '@/types'

const STORAGE_KEY = 'valid_session'

function clearStorage(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(STORAGE_KEY)
}

/**
 * Obtiene la sesión actual (solo en cliente; localStorage).
 */
export function getSession(): Session | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const session: Session = JSON.parse(raw)
    if (session.expiresAt < Date.now()) {
      clearStorage()
      return null
    }
    return session
  } catch {
    return null
  }
}

/**
 * Guarda sesión (demo: expires en 7 días). No persiste passwordHint.
 */
export function setSession(user: User): void {
  if (typeof window === 'undefined') {
    return
  }
  const { passwordHint: _, ...safeUser } = user
  const session: Session = {
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    user: safeUser,
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

/**
 * Cierra sesión.
 */
export function clearSession(): void {
  clearStorage()
}
