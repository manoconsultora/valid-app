'use client'

import { useCallback, useEffect, useState } from 'react'

import { listProvidersWithStatus } from '@/lib/actions/providers'
import type { ProviderRowWithStatus } from '@/lib/actions/providers'

export function useProviders(): {
  data: ProviderRowWithStatus[]
  error: string | null
  loading: boolean
  refresh: () => void
} {
  const [data, setData] = useState<ProviderRowWithStatus[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(function doRefresh() {
    setLoading(true)
    setError(null)
    setTick(t => t + 1)
  }, [])

  useEffect(
    function fetchProviders() {
      let mounted = true

      function onSuccess(result: {
        data: ProviderRowWithStatus[] | null
        error: string | null
      }) {
        if (!mounted) {
          return
        }
        setError(result.error ?? null)
        setData(result.data ?? [])
      }

      function onError() {
        if (!mounted) {
          return
        }
        setError('Error al cargar proveedores')
      }

      function onFinally() {
        if (!mounted) {
          return
        }
        setLoading(false)
      }

      listProvidersWithStatus().then(onSuccess).catch(onError).finally(onFinally)

      return function cleanup() {
        mounted = false
      }
    },
    [tick]
  )

  return { data, error, loading, refresh }
}
