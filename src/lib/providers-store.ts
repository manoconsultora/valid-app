import { DB_PROVIDERS } from '@/data/mock-db'
import { dbProviderToApp } from '@/lib/adapters/db-to-app'
import type { Provider } from '@/types'

const KEY = 'valid_providers'
const SEED_PROVIDERS = DB_PROVIDERS.map(dbProviderToApp)

function read(): Provider[] {
  if (typeof window === 'undefined') {
    return SEED_PROVIDERS
  }
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(SEED_PROVIDERS))
      return SEED_PROVIDERS
    }
    return JSON.parse(raw) as Provider[]
  } catch {
    return SEED_PROVIDERS
  }
}

export const getProviders = (): Provider[] => read()

export function addProvider(provider: Omit<Provider, 'id'>): Provider {
  const list = read()
  const id = `p${Date.now()}`
  const newProvider: Provider = { ...provider, id }
  list.push(newProvider)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(KEY, JSON.stringify(list))
  }
  return newProvider
}
