'use client'

import { useCallback, useEffect, useState } from 'react'

import { listCompanies } from '@/lib/actions/companies'
import type { CompanyRow } from '@/lib/actions/companies'

export function useCompanies(): {
  data: CompanyRow[]
  error: string | null
  loading: boolean
  refresh: () => void
} {
  const [data, setData] = useState<CompanyRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(function doRefresh() {
    setLoading(true)
    setError(null)
    setTick(t => t + 1)
  }, [])

  useEffect(
    function fetchCompanies() {
      let mounted = true

      function onSuccess(result: { data: CompanyRow[] | null; error: string | null }) {
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
        setError('Error al cargar empresas')
      }

      function onFinally() {
        if (!mounted) {
          return
        }
        setLoading(false)
      }

      listCompanies().then(onSuccess).catch(onError).finally(onFinally)

      return function cleanup() {
        mounted = false
      }
    },
    [tick]
  )

  return { data, error, loading, refresh }
}
