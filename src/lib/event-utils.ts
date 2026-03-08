import type { Event } from '@/types'

/** Mapea statusAdmin del evento a variante de Badge por color semántico (admin). */
export function statusAdminToBadgeVariant(
  status: Event['statusAdmin']
): 'accentSoft' | 'errorSoft' | 'warningSoft' {
  if (status === 'LIVE') {
    return 'errorSoft'
  }
  if (status === 'VALIDACIÓN') {
    return 'warningSoft'
  }
  return 'accentSoft'
}
