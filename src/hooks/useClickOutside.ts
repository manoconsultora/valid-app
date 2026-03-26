import type { RefObject } from 'react'
import { useEffect } from 'react'

function isClickOutside(
  refs: RefObject<HTMLElement | null>[],
  target: EventTarget | null
): boolean {
  const node = target as Node | null
  if (!node) {
    return true
  }
  return refs.every(ref => !ref.current || !ref.current.contains(node))
}

export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  onClose: () => void
): void {
  useEffect(
    () =>
      ((h: (_e: MouseEvent) => void) => (
        window.addEventListener('click', h),
        () => window.removeEventListener('click', h)
      ))((e: MouseEvent) => isClickOutside(refs, e.target) && onClose()),
    [onClose, refs]
  )
}
