interface MetricCardProps {
  icon: React.ReactNode
  iconBg: string
  primary: string
  secondary?: string
  label: string
  helper?: string
}

/**
 * Tarjeta compacta para métricas de dashboard (admin, proveedor, etc.).
 * Usa el sistema de tokens globales y acepta colores de fondo para el icono via props.
 */
export const MetricCard = ({
  helper,
  icon,
  iconBg,
  label,
  primary,
  secondary,
}: MetricCardProps) => (
  <div
    className="rounded-2xl border p-4"
    style={{
      background: 'var(--surface)',
      borderColor: 'var(--border)',
      boxShadow: 'var(--shadow)',
    }}
  >
    <div
      className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg text-lg"
      style={{ background: iconBg }}
    >
      {icon}
    </div>
    <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
      {primary}
      {secondary ? (
        <span className="text-xl" style={{ color: 'var(--text-secondary)' }}>
          {secondary}
        </span>
      ) : null}
    </div>
    <div className="text-xs font-medium" style={{ color: 'var(--text)' }}>
      {label}
    </div>
    {helper ? (
      <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
        {helper}
      </div>
    ) : null}
  </div>
)
