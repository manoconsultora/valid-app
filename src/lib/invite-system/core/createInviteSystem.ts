import type { InviteSystemConfig } from '../types/config'

import { createInvitations } from './invitations'
import { createRoles } from './roles'
import { createUser } from './user'

export const createInviteSystem = (config: InviteSystemConfig) => ({
  invitations: createInvitations(config),
  roles: createRoles(config.roles),
  user: createUser(config),
})
