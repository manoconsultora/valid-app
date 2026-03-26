import type { Invitation } from './invitations'

export type InviteSystemAdapter = {
  getUserIdsToRevoke: (_: { resourceId: string }) => Promise<string[]>
  lookupStaleUser: (_: { email: string; resourceId: string }) => Promise<string | null>
  onInvitationAccepted: (_: { invitation: Invitation; userId: string }) => Promise<void>
  onInvitationCreated?: (_: { invitation: Invitation }) => Promise<void>
  onInvitationRevoked?: (_: { resourceId: string; userIds: string[] }) => Promise<void>
  onUserDeleted?: (_: { userId: string }) => Promise<void>
}
