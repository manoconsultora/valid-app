interface PageHeaderProps {
  title: string
  subtitle?: string
  rightSlot?: React.ReactNode
}

/**
 * Encabezado de página reutilizable para dashboards.
 * Se apoya en los tokens globales (var(--text), var(--text-secondary)).
 */
export function PageHeader({ title, subtitle, rightSlot }: PageHeaderProps) {
  return (
    <div className="mb-10 flex justify-between">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {rightSlot ? <div className="flex items-center gap-2">{rightSlot}</div> : null}
    </div>
  )
}

