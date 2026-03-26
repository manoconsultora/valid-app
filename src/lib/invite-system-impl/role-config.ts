import type { RoleConfig } from '@/lib/invite-system'

export const roleConfig: RoleConfig = {
  defaultInvitedRole: 'provider',
  inviterRoles: ['admin'],
  portalZones: {
    admin: ['admin'],
    proveedor: ['provider'],
  },
  routeMap: {
    admin: '/admin',
    provider: '/proveedor',
  },
}
