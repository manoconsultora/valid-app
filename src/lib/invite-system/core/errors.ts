import type { Err } from '../types/result'

export const makeErr = (message: string, code?: string): Err => ({
  error: { ...(code !== undefined ? { code } : {}), message },
  ok: false,
})
