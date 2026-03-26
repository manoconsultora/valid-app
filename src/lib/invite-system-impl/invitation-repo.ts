import 'server-only'

import type {
  Invitation,
  InvitationRepo,
  InvitationStatus,
  NewInvitation,
} from '@/lib/invite-system'
import { createAdminClient } from '@/lib/supabase/admin'

type DbRow = {
  accepted_at: string | null
  id: string
  invite_status: string
  invited_email: string
  invited_role: string
  resource_id: string
  sent_at: string
  supabase_user_id: string | null
}

const toApp = (row: DbRow): Invitation => ({
  acceptedAt: row.accepted_at,
  id: row.id,
  invitedEmail: row.invited_email,
  invitedRole: row.invited_role,
  resourceId: row.resource_id,
  sentAt: row.sent_at,
  status: row.invite_status as InvitationStatus,
  supabaseUserId: row.supabase_user_id,
})

export const invitationRepo: InvitationRepo = {
  async getByUserId({ status, userId }) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('provider_invitations')
      .select('*')
      .eq('supabase_user_id', userId)
      .eq('invite_status', status)
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return data ? toApp(data as DbRow) : null
  },

  async getLastByResource(resourceId) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('provider_invitations')
      .select('*')
      .eq('resource_id', resourceId)
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return data ? toApp(data as DbRow) : null
  },

  async insert(inv: NewInvitation) {
    const admin = createAdminClient()
    /* eslint-disable camelcase -- DB insert uses snake_case column names */
    const { data, error } = await admin
      .from('provider_invitations')
      .insert({
        invite_status: inv.status,
        invited_email: inv.invitedEmail,
        invited_role: inv.invitedRole,
        resource_id: inv.resourceId,
        supabase_user_id: inv.supabaseUserId,
      })
      /* eslint-enable camelcase */
      .select('*')
      .single()
    if (error || !data) {
      throw new Error(error?.message ?? 'Error al guardar la invitación')
    }
    return toApp(data as DbRow)
  },

  async invalidateByResource(resourceId) {
    const admin = createAdminClient()
    /* eslint-disable camelcase -- DB update uses snake_case column names */
    const { error } = await admin
      .from('provider_invitations')
      .update({ invite_status: 'invalid' })
      .eq('resource_id', resourceId)
      .neq('invite_status', 'invalid')
    /* eslint-enable camelcase */
    if (error) {
      throw new Error(error.message)
    }
  },

  async updateStatus({ id, status }) {
    const admin = createAdminClient()
    /* eslint-disable-next-line camelcase -- DB update uses snake_case column name */
    const payload: Record<string, string> = { invite_status: status }
    if (status === 'accepted') {
      payload['accepted_at'] = new Date().toISOString()
    }
    const { error } = await admin
      .from('provider_invitations')
      .update(payload)
      .eq('id', id)
    if (error) {
      throw new Error(error.message)
    }
  },
}
