interface PageHeaderProps {
  title: string
  subtitle?: string
  rightSlot?: React.ReactNode
  align?: 'left' | 'center' | 'right'
}

/**
 * Encabezado de página reutilizable para dashboards.
 * Se apoya en los tokens globales (var(--text), var(--text-secondary)).
 */
export function PageHeader({
  align = 'left',
  rightSlot,
  subtitle,
  title,
}: PageHeaderProps) {
  const isCenter = align === 'center'
  const isRight = align === 'right'
  const containerClass = isCenter
    ? 'justify-center text-center'
    : isRight
      ? 'justify-end text-right'
      : 'justify-between'
  const innerClass = isCenter ? 'text-center' : isRight ? 'text-right' : ''
  const showRightSlot = align === 'left' && rightSlot

  return (
    <div className={`mb-10 flex ${containerClass}`}>
      <div className={innerClass}>
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
      {showRightSlot ? <div className="flex items-center gap-2">{rightSlot}</div> : null}
    </div>
  )
}
