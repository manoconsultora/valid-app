import type { InviteSystemConfig } from '../types/config'
import type { Result } from '../types/result'

import { makeErr } from './errors'

export const createUser = (config: InviteSystemConfig) => ({
  async requestPasswordReset(args: {
    email: string
    redirectTo?: string
  }): Promise<Result> {
    try {
      await config.auth.resetPasswordForEmail(args)
      return { data: undefined, ok: true }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Error al solicitar el reset de contraseña'
      return makeErr(message, 'RESET_FAILED')
    }
  },
})
