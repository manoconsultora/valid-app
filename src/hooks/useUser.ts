import { useAuth } from '@/hooks/useAuth'

export function useUser(): {
  loading: boolean
  user: ReturnType<typeof useAuth>['user']
} {
  const { loading, user } = useAuth()
  return { loading, user }
}
