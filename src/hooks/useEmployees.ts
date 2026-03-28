'use client'

import { useCallback, useEffect, useState } from 'react'

import { listEmployeesWithStatus } from '@/lib/actions/employees'
import type { EmployeeRowWithStatus } from '@/lib/actions/employees'

export function useEmployees(): {
  data: EmployeeRowWithStatus[]
  error: string | null
  loading: boolean
  refresh: () => void
} {
  const [data, setData] = useState<EmployeeRowWithStatus[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(function doRefresh() {
    setLoading(true)
    setError(null)
    setTick(t => t + 1)
  }, [])

  useEffect(
    function fetchEmployees() {
      let mounted = true

      function onSuccess(result: {
        data: EmployeeRowWithStatus[] | null
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
        setError('Error al cargar empleados')
      }

      function onFinally() {
        if (!mounted) {
          return
        }
        setLoading(false)
      }

      listEmployeesWithStatus().then(onSuccess).catch(onError).finally(onFinally)

      return function cleanup() {
        mounted = false
      }
    },
    [tick]
  )

  return { data, error, loading, refresh }
}
