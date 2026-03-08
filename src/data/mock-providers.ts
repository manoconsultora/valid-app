/* eslint-disable import/order -- mock-db and adapter then type */
import { DB_PROVIDERS } from './mock-db'
import { dbProviderToApp } from '@/lib/adapters/db-to-app'
import type { Provider } from '@/types'

/**
 * Proveedores demo en forma de app (camelCase).
 * Fuente: mock-db (DB_PROVIDERS). Preferir getProviders() del store.
 */
export const MOCK_PROVIDERS: Provider[] = DB_PROVIDERS.map(dbProviderToApp)
