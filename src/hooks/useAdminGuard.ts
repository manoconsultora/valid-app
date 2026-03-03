import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { getSession } from '@/lib/session'

export function useAdminGuard(mounted: boolean): void {
  const router = useRouter()
  useEffect(
    () => (
      mounted &&
        ((s: ReturnType<typeof getSession>) =>
          (!s || s.user.role !== 'admin') && (router.replace('/login'), 1))(
          getSession()
        ),
      () => undefined
    ),
    [mounted, router]
  )
}
