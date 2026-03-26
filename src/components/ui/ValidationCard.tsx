export interface ValidationCardDetail {
  label: string
  value: React.ReactNode
}

export interface ValidationCardSummaryStats {
  approved: number
  rejected: number
}

export interface ValidationCardProps {
  children?: React.ReactNode
  description: React.ReactNode
  details: ValidationCardDetail[]
  icon: React.ReactNode
  name: string
  onClick?: () => void
  resultClassName?: string
  resultText?: React.ReactNode
  resultTitle?: React.ReactNode
  resultTitleClassName?: string
  status?: string
  statusClassName?: string
  summaryStats?: ValidationCardSummaryStats
  type: string
}

/**
 * Card para validación: clicable (Estado de Validación) o solo lectura (Resultados de Validación).
 * Con onClick = card clicable; sin onClick = div con clase validation-card-readonly.
 * resultTitle/resultText y summaryStats se usan en la vista "Documentación Aprobada".
 */
/* eslint-disable arrow-body-style -- conditional return (div vs button) */
export const ValidationCard = ({
  children,
  description,
  details,
  icon,
  name,
  onClick,
  resultClassName,
  resultText,
  resultTitle,
  resultTitleClassName,
  status = 'Pendiente',
  statusClassName,
  summaryStats,
  type,
}: ValidationCardProps) => {
  const content = (
    <>
      <div className="validation-header text-left">
        <div className="validation-icon">{icon}</div>
        <div className="validation-info">
          <div className="validation-type">{type}</div>
          <div className="validation-name">{name}</div>
        </div>
        <div
          className={
            statusClassName ? `validation-status ${statusClassName}` : 'validation-status'
          }
        >
          {status}
        </div>
      </div>
      <div className="validation-description text-left">{description}</div>
      {resultTitle != null && (
        <div
          className={
            resultClassName ? `validation-result ${resultClassName}` : 'validation-result'
          }
        >
          <div
            className={
              resultTitleClassName
                ? `result-title ${resultTitleClassName}`
                : 'result-title'
            }
          >
            {resultTitle}
          </div>
          {resultText != null && <div className="result-text">{resultText}</div>}
        </div>
      )}
      <div className="validation-details text-left">
        {details.map(d => (
          <div className="detail-item" key={d.label}>
            <div className="detail-label">{d.label}</div>
            <div className="detail-value">{d.value}</div>
          </div>
        ))}
      </div>
      {children}
      {summaryStats != null && (
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="summary-value">{summaryStats.approved}</div>
            <div className="summary-label">Aprobados</div>
          </div>
          <div className="summary-stat">
            <div className="summary-value">{summaryStats.rejected}</div>
            <div className="summary-label">Rechazados</div>
          </div>
        </div>
      )}
    </>
  )

  if (onClick == null) {
    return <div className="validation-card validation-card-readonly">{content}</div>
  }

  return (
    <button className="validation-card" onClick={onClick} type="button">
      {content}
    </button>
  )
}
