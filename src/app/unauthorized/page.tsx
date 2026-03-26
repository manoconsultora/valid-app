import Link from 'next/link'

/**
 * Usuario autenticado sin rol asignado o con rol insuficiente (auth-rbac).
 * Cuenta pendiente de activación; contactar al administrador.
 */
export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="mb-3 text-xl font-semibold" style={{ color: 'var(--text)' }}>
          Sin acceso
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
          Tu cuenta está pendiente de activación. Contactá al administrador para que te
          asigne un rol.
        </p>
        <Link
          className="inline-block rounded-(--radius) px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          href="/login"
          style={{
            background: 'var(--accent)',
            color: 'white',
          }}
        >
          Volver al login
        </Link>
      </div>
    </main>
  )
}
