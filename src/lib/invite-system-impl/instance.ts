import 'server-only'

import { createInviteSystem } from '@/lib/invite-system'

import { adapter } from './adapter'
import { authProvider } from './auth-provider'
import { invitationRepo } from './invitation-repo'
import { roleConfig } from './role-config'

export const inviteSystem = createInviteSystem({
  adapter,
  auth: authProvider,
  repo: invitationRepo,
  roles: roleConfig,
})
