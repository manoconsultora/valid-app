'use client'

import { useEffect, useState } from 'react'

import { getProviderCategories } from '@/lib/actions/providers'
import type { ProviderCategory } from '@/lib/actions/providers'

export function useProviderCategories(): {
  categories: ProviderCategory[]
  error: string | null
  loading: boolean
} {
  const [categories, setCategories] = useState<ProviderCategory[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(function fetchCategories() {
    let mounted = true

    function onSuccess({
      data,
      error: err,
    }: {
      data: ProviderCategory[] | null
      error: string | null
    }) {
      if (!mounted) {
        return
      }
      setError(err ?? null)
      setCategories(data ?? [])
    }

    function onError() {
      if (!mounted) {
        return
      }
      setError('Error al cargar categorías')
    }

    function onFinally() {
      if (!mounted) {
        return
      }
      setLoading(false)
    }

    getProviderCategories().then(onSuccess).catch(onError).finally(onFinally)

    return function cleanup() {
      mounted = false
    }
  }, [])

  return { categories, error, loading }
}
