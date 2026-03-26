import type { RoleConfig } from '../types/roles'

export const createRoles = (config: RoleConfig) => ({
  getDashboardPath: (role: string): string => config.routeMap[role] ?? '/',

  isZoneRole: (args: { role: string; zone: string }): boolean =>
    config.portalZones[args.zone]?.includes(args.role) ?? false,
})
