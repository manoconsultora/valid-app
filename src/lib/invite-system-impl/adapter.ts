import 'server-only'

import type { InviteSystemAdapter } from '@/lib/invite-system'
import { createAdminClient } from '@/lib/supabase/admin'

export const adapter: InviteSystemAdapter = {
  async getUserIdsToRevoke({ resourceId }) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('provider_invitations')
      .select('supabase_user_id')
      .eq('resource_id', resourceId)
      .neq('invite_status', 'invalid')
      .not('supabase_user_id', 'is', null)
    return (data ?? [])
      .map(r => (r as { supabase_user_id: string | null }).supabase_user_id)
      .filter((id): id is string => id !== null)
  },

  async lookupStaleUser({ email, resourceId }) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('provider_invitations')
      .select('supabase_user_id')
      .eq('resource_id', resourceId)
      .eq('invited_email', email)
      .not('supabase_user_id', 'is', null)
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const row = data as { supabase_user_id: string | null } | null
    return row?.supabase_user_id ?? null
  },

  async onInvitationAccepted({ invitation, userId }) {
    const admin = createAdminClient()

    // 1. Consolidar app_metadata (metadata-first: rol + resource_id en JWT)
    /* eslint-disable camelcase -- Supabase Auth Admin API requires snake_case metadata keys */
    const { error: metaErr } = await admin.auth.admin.updateUserById(userId, {
      app_metadata: {
        resource_id: invitation.resourceId,
        role: invitation.invitedRole,
      },
    })
    /* eslint-enable camelcase */
    if (metaErr) {
      throw new Error(metaErr.message)
    }

    // 2. Sincronizar rol en public.users (fuente de verdad secundaria)
    const { error: roleErr } = await admin
      .from('users')
      .update({ role: invitation.invitedRole as 'admin' | 'provider' })
      .eq('id', userId)
    if (roleErr) {
      throw new Error(roleErr.message)
    }
  },
}
