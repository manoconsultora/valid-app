import { useEffect } from 'react'

/**
 * Sincroniza el título de la pestaña con el valor indicado.
 * Útil para que cada página muestre un título coherente (ej. "Crear Evento - VALID").
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => void (document.title = title), [title])
}
