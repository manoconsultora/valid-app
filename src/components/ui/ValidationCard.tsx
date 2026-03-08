export interface ValidationCardDetail {
  label: string
  value: React.ReactNode
}

export interface ValidationCardProps {
  description: React.ReactNode
  details: ValidationCardDetail[]
  icon: React.ReactNode
  name: string
  onClick: () => void
  status?: string
  type: string
}

/**
 * Card clicable para una validación (A: documentos, B: empleados).
 * Misma estructura que las cards de estado de validación en proveedor/eventos/[id].
 */
export const ValidationCard = ({
  description,
  details,
  icon,
  name,
  onClick,
  status = 'Pendiente',
  type,
}: ValidationCardProps) => (
  <button
    className="validation-card"
    onClick={onClick}
    type="button"
  >
    <div className="validation-header text-left">
      <div className="validation-icon">{icon}</div>
      <div className="validation-info">
        <div className="validation-type">{type}</div>
        <div className="validation-name">{name}</div>
      </div>
      <div className="validation-status">{status}</div>
    </div>
    <div className="validation-description text-left">{description}</div>
    <div className="validation-details text-left">
      {details.map((d) => (
        <div className="detail-item" key={d.label}>
          <div className="detail-label">{d.label}</div>
          <div className="detail-value">{d.value}</div>
        </div>
      ))}
    </div>
  </button>
)
