import { useEffect, useState } from 'react'

/**
 * Devuelve true después del primer paint (setTimeout 0).
 * Útil en layouts para evitar hydration mismatch al leer session/localStorage.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(
    () =>
      (
        (t: ReturnType<typeof setTimeout>) => () =>
          clearTimeout(t)
      )(setTimeout(() => setMounted(true), 0)),
    []
  )
  return mounted
}
