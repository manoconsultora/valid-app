import { MOCK_PROVIDERS } from '@/data/mock-providers'
import type { Provider } from '@/types'


const KEY = 'valid_providers'

function read(): Provider[] {
  if (typeof window === 'undefined') {
    return MOCK_PROVIDERS
  }
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(MOCK_PROVIDERS))
      return MOCK_PROVIDERS
    }
    return JSON.parse(raw) as Provider[]
  } catch {
    return MOCK_PROVIDERS
  }
}

export const getProviders = (): Provider[] => read();

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
