import { requireRole } from '@/lib/auth/roles'

import { ProveedorShell } from './ProveedorShell'

export default async function ProveedorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole('provider')
  return <ProveedorShell>{children}</ProveedorShell>
}
