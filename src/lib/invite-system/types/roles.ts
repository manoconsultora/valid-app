export type RoleConfig = {
  defaultInvitedRole: string
  inviterRoles: string[]
  /** portalZones['admin'] = ['admin'] — qué roles pueden entrar a cada zona */
  portalZones: Record<string, string[]>
  /** routeMap['provider'] = '/proveedor' */
  routeMap: Record<string, string>
}
