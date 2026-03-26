import 'server-only'

import type { InviteSystemAuthProvider } from '@/lib/invite-system'
import { createAdminClient } from '@/lib/supabase/admin'

export const authProvider: InviteSystemAuthProvider = {
  async deleteUser({ userId }) {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) {
      throw new Error(error.message)
    }
  },

  async inviteUserByEmail({ email, metadata, redirectTo }) {
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: metadata,
      redirectTo,
    })
    if (error) {
      const msg = error.message
      const isRegistered =
        msg.includes('already been registered') || msg.includes('already exists')
      const enriched = Object.assign(new Error(msg), {
        code: isRegistered ? 'ALREADY_REGISTERED' : 'INVITE_FAILED',
      })
      throw enriched
    }
    const userId = data?.user?.id
    if (!userId) {
      throw new Error('No se recibió el userId del usuario invitado')
    }
    return { userId }
  },

  async resetPasswordForEmail({ email, redirectTo }) {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.generateLink({
      email,
      options: { redirectTo },
      type: 'recovery',
    })
    if (error) {
      throw new Error(error.message)
    }
  },
}
