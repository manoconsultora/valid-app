import type { InviteSystemAdapter } from './adapter'
import type { InvitationRepo } from './invitations'
import type { RoleConfig } from './roles'

export type InviteSystemAuthProvider = {
  deleteUser: (_: { userId: string }) => Promise<void>
  inviteUserByEmail: (_: {
    email: string
    metadata?: Record<string, unknown>
    redirectTo?: string
  }) => Promise<{ userId: string }>
  resetPasswordForEmail: (_: { email: string; redirectTo?: string }) => Promise<void>
}

export type InviteSystemConfig = {
  adapter: InviteSystemAdapter
  auth: InviteSystemAuthProvider
  repo: InvitationRepo
  roles: RoleConfig
}
