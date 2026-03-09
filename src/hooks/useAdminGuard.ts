import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useAuth } from '@/hooks/useAuth'

/**
 * Segunda capa cliente: reacciona a logout en runtime (otra pestaña, expiración).
 * El servidor ya garantiza rol admin vía requireRole(); aquí solo redirigimos si userId pasa a null.
 */
export function useAdminGuard(mounted: boolean): void {
  const router = useRouter()
  const { loading, user } = useAuth()
  const userId = user?.id

  useEffect(
    // eslint-disable-next-line arrow-body-style -- early returns para claridad
    () => {
      if (!mounted || loading) {
        return
      }
      if (userId == null) {
        router.replace('/login')
      }
    },
    [loading, mounted, router, userId]
  )
}
