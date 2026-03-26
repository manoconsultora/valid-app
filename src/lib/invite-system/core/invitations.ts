import type { InviteSystemConfig } from '../types/config'
import type { Invitation } from '../types/invitations'
import type { Result } from '../types/result'

import { makeErr } from './errors'

const ALREADY_REGISTERED_CODE = 'ALREADY_REGISTERED'

function isAlreadyRegistered(e: unknown): boolean {
  if (!(e instanceof Error)) {
    return false
  }
  const code = (e as { code?: string }).code
  if (code === ALREADY_REGISTERED_CODE) {
    return true
  }
  const msg = e.message.toLowerCase()
  return msg.includes('already been registered') || msg.includes('already exists')
}

const toMessage = (e: unknown): string =>
  e instanceof Error ? e.message : 'Error inesperado'

export const createInvitations = (config: InviteSystemConfig) => ({
  async acceptInvitation({ userId }: { userId: string }): Promise<Result> {
    try {
      const invitation = await config.repo.getByUserId({ status: 'pending', userId })
      if (!invitation) {
        return makeErr('No hay invitación pendiente para este usuario', 'NOT_FOUND')
      }
      await config.repo.updateStatus({ id: invitation.id, status: 'accepted' })
      await config.adapter.onInvitationAccepted({ invitation, userId })
      return { data: undefined, ok: true }
    } catch (e) {
      return makeErr(toMessage(e), 'ACCEPT_FAILED')
    }
  },

  async createInvitation(args: {
    email: string
    metadata?: Record<string, unknown>
    redirectTo?: string
    resourceId: string
    role?: string
  }): Promise<Result<{ invitation: Invitation }>> {
    try {
      const invitedRole = args.role ?? config.roles.defaultInvitedRole
      const { userId } = await config.auth.inviteUserByEmail({
        email: args.email,
        metadata: {
          /* eslint-disable-next-line camelcase -- metadata key required by Supabase invite API */
          resource_id: args.resourceId,
          role: invitedRole,
          ...args.metadata,
        },
        redirectTo: args.redirectTo,
      })
      const invitation = await config.repo.insert({
        invitedEmail: args.email,
        invitedRole,
        resourceId: args.resourceId,
        status: 'pending',
        supabaseUserId: userId,
      })
      await config.adapter.onInvitationCreated?.({ invitation })
      return { data: { invitation }, ok: true }
    } catch (e) {
      return makeErr(toMessage(e), 'CREATE_FAILED')
    }
  },

  async resendInvitation(args: {
    redirectTo?: string
    resourceId: string
  }): Promise<Result<{ usedReset: boolean }>> {
    try {
      const invitation = await config.repo.getLastByResource(args.resourceId)
      if (!invitation) {
        return makeErr('No hay invitación para este recurso', 'NOT_FOUND')
      }

      await config.repo.invalidateByResource(args.resourceId)

      try {
        const { userId } = await config.auth.inviteUserByEmail({
          email: invitation.invitedEmail,
          /* eslint-disable-next-line camelcase -- metadata key required by Supabase invite API */
          metadata: { resource_id: args.resourceId, role: invitation.invitedRole },
          redirectTo: args.redirectTo,
        })
        await config.repo.insert({
          invitedEmail: invitation.invitedEmail,
          invitedRole: invitation.invitedRole,
          resourceId: args.resourceId,
          status: 'pending',
          supabaseUserId: userId,
        })
        return { data: { usedReset: false }, ok: true }
      } catch (inviteErr) {
        if (!isAlreadyRegistered(inviteErr)) {
          throw inviteErr
        }
        // Usuario ya existe → enviar reset de contraseña
        await config.auth.resetPasswordForEmail({
          email: invitation.invitedEmail,
          redirectTo: args.redirectTo,
        })
        await config.repo.insert({
          invitedEmail: invitation.invitedEmail,
          invitedRole: invitation.invitedRole,
          resourceId: args.resourceId,
          status: 'pending',
          supabaseUserId: invitation.supabaseUserId,
        })
        return { data: { usedReset: true }, ok: true }
      }
    } catch (e) {
      return makeErr(toMessage(e), 'RESEND_FAILED')
    }
  },

  async revokeInvitation(args: { resourceId: string }): Promise<Result> {
    try {
      const userIds = await config.adapter.getUserIdsToRevoke({
        resourceId: args.resourceId,
      })
      await config.repo.invalidateByResource(args.resourceId)
      for (const userId of userIds) {
        await config.auth.deleteUser({ userId })
      }
      await config.adapter.onInvitationRevoked?.({ resourceId: args.resourceId, userIds })
      return { data: undefined, ok: true }
    } catch (e) {
      return makeErr(toMessage(e), 'REVOKE_FAILED')
    }
  },
})
