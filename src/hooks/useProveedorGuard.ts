import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { getSession } from '@/lib/session'

export function useProveedorGuard(mounted: boolean): void {
  const router = useRouter()
  useEffect(
    () => (
      mounted &&
        ((s: ReturnType<typeof getSession>) =>
          (!s || s.user.role !== 'proveedor') && (router.replace('/login'), 1))(
          getSession()
        ),
      () => undefined
    ),
    [mounted, router]
  )
}
