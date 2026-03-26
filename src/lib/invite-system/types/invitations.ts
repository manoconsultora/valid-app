export type InvitationStatus = 'accepted' | 'invalid' | 'pending'

export type Invitation = {
  acceptedAt: string | null
  id: string
  invitedEmail: string
  invitedRole: string
  resourceId: string
  sentAt: string
  status: InvitationStatus
  supabaseUserId: string | null
}

export type NewInvitation = {
  invitedEmail: string
  invitedRole: string
  resourceId: string
  status: InvitationStatus
  supabaseUserId: string | null
}

export type InvitationRepo = {
  getByUserId: (_: {
    status: InvitationStatus
    userId: string
  }) => Promise<Invitation | null>
  getLastByResource: (_resourceId: string) => Promise<Invitation | null>
  insert: (_inv: NewInvitation) => Promise<Invitation>
  invalidateByResource: (_resourceId: string) => Promise<void>
  nullifyUserId?: (_: { resourceId: string; userId: string }) => Promise<void>
  updateStatus: (_: { id: string; status: InvitationStatus }) => Promise<void>
}
