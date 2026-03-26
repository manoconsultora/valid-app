import type { CreateProviderInput, UpdateProviderInput } from '@/lib/validations/provider'

import type { ProviderInsert, ProviderUpdate } from './types'

export const parseZodFieldError = (parsed: {
  success: false
  error: { flatten: () => { fieldErrors: Record<string, string[]> } }
}): string =>
  Object.values(parsed.error.flatten().fieldErrors).flat().join('. ') || 'Datos inválidos'

export const getInviteBaseUrl = (): string | null =>
  (process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? '') || null

const ALREADY_REGISTERED_PHRASES = ['already been registered', 'already exists']
const EXISTING_USER_ERROR_PHRASES = [
  ...ALREADY_REGISTERED_PHRASES,
  'database error finding user',
  'finding user',
]
const RATE_LIMIT_PHRASES = ['rate limit', 'rate_limit', 'too many requests']

export const isAlreadyRegisteredError = (message: string): boolean =>
  ALREADY_REGISTERED_PHRASES.some(p => message.includes(p))

/** Usuario ya existe en Auth (invite no aplica); mensaje para reenvío. */
export const isExistingUserError = (message: string): boolean =>
  EXISTING_USER_ERROR_PHRASES.some(p => message.toLowerCase().includes(p.toLowerCase()))

/** "Database error finding user" — usuario corrupto (p. ej. confirmation_token NULL); requiere borrar y recrear. */
export const isDatabaseErrorFindingUser = (message: string): boolean =>
  /database\s+error\s+finding\s+user|finding\s+user/i.test(message) &&
  !isAlreadyRegisteredError(message)

export const isRateLimitError = (message: string): boolean =>
  RATE_LIMIT_PHRASES.some(p => message.toLowerCase().includes(p))

const REDIRECT_URL_HINT =
  ' Añade esa URL en Supabase: Authentication → URL Configuration → Redirect URLs.'

function extractMessageProp(value: object): string | null {
  if (!('message' in value)) {
    return null
  }
  const msg = (value as { message?: unknown }).message
  return typeof msg === 'string' && msg.trim() !== '' ? msg.trim() : null
}

function tryJsonStringify(value: unknown): string | null {
  try {
    const s = JSON.stringify(value)
    return s !== '{}' && s !== 'null' ? s : null
  } catch {
    return null
  }
}

/**
 * Convierte cualquier valor a string para devolver como error en la API.
 * Evita devolver "{}" cuando Supabase u otros devuelven un objeto sin .message serializable.
 */
export function toErrorString(value: unknown): string {
  if (value == null) {
    return 'Error desconocido'
  }
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim()
  }
  if (value instanceof Error && value.message) {
    return value.message
  }
  if (typeof value === 'object' && value !== null) {
    const msg = extractMessageProp(value)
    if (msg) {
      return msg
    }
    const json = tryJsonStringify(value)
    if (json) {
      return json
    }
  }
  return 'Error desconocido al crear proveedor'
}

/** Mensaje amigable para errores de invitación conocidos (rate limit, redirect, etc.). */
export function formatInviteError(message: string, baseUrl: string | null): string {
  if (isRateLimitError(message)) {
    return 'Demasiados envíos de correo. Espera unos minutos e inténtalo de nuevo.'
  }
  const lower = message.toLowerCase()
  const looksLikeRedirect =
    lower.includes('redirect') ||
    lower.includes('url') ||
    lower.includes('allowed') ||
    lower.includes('whitelist') ||
    lower.includes('invalid redirect')
  if (looksLikeRedirect && baseUrl) {
    return `${message + REDIRECT_URL_HINT} (ej: ${baseUrl}/auth/confirm)`
  }
  return message
}

/* eslint-disable camelcase -- DB insert payload uses snake_case column names */
export const buildProviderInsertPayload = (
  data: CreateProviderInput,
  userId: string,
  id?: string
): ProviderInsert => ({
  ...(id !== undefined ? { id } : {}),
  category_id: data.category_id,
  contact_name: data.contact_name || null,
  contact_role: data.contact_role || null,
  cuit: data.cuit,
  email: data.email,
  phone: data.phone || null,
  razon_social: data.razon_social,
  user_id: userId,
})
/* eslint-enable camelcase */

const PROVIDER_UPDATE_NULLABLE_KEYS = ['contact_name', 'contact_role', 'phone'] as const

export function buildProviderUpdatePayload(data: UpdateProviderInput): ProviderUpdate {
  const payload: ProviderUpdate = {}
  const entries: (keyof ProviderUpdate)[] = [
    'category_id',
    'contact_name',
    'contact_role',
    'cuit',
    'email',
    'phone',
    'razon_social',
  ]
  for (const k of entries) {
    const v = data[k as keyof UpdateProviderInput]
    if (v === undefined) {
      continue
    }
    const isNullable = PROVIDER_UPDATE_NULLABLE_KEYS.includes(
      k as (typeof PROVIDER_UPDATE_NULLABLE_KEYS)[number]
    )
    ;(payload as Record<string, unknown>)[k as string] = isNullable ? (v ?? null) : v
  }
  return payload
}
