'use client'

export type BadgeVariant =
  | 'accent'
  | 'accentSoft'
  | 'success'
  | 'successSoft'
  | 'pending'
  | 'rejected'
  | 'errorSoft'
  | 'warning'
  | 'warningSoft'
  | 'neutral'
  | 'surface'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md'
  as?: 'span' | 'div'
}

const variantStyles: Record<
  BadgeVariant,
  { background: string; borderRadius?: string; boxShadow?: string; color: string }
> = {
  accent: {
    background: 'var(--gradient-accent)',
    borderRadius: '999px',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
    color: 'white',
  },
  accentSoft: {
    background: 'var(--accent-soft)',
    color: 'var(--accent)',
  },
  errorSoft: {
    background: 'var(--error-soft)',
    color: 'var(--rejected)',
  },
  neutral: {
    background: 'var(--bg)',
    color: 'var(--muted)',
  },
  pending: {
    background: 'var(--pending)',
    color: 'white',
  },
  rejected: {
    background: 'var(--rejected)',
    color: 'white',
  },
  success: {
    background: 'var(--approved)',
    color: 'white',
  },
  successSoft: {
    background: 'var(--success-soft)',
    color: 'var(--approved)',
  },
  surface: {
    background: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    color: 'var(--text)',
  },
  warning: {
    background: 'var(--warning)',
    color: 'white',
  },
  warningSoft: {
    background: 'var(--warning-soft)',
    color: 'var(--warning-soft-text)',
  },
}

const sizeStyles = {
  md: 'px-3 py-1.5 text-xs',
  sm: 'px-2 py-0.5 text-[10px]',
}

export function Badge({
  as: Component = 'span',
  children,
  className = '',
  size = 'md',
  variant,
}: BadgeProps) {
  const style = variantStyles[variant]
  const isPill = variant !== 'surface'
  const baseClass = 'inline-flex items-center font-semibold'
  const roundedClass = isPill ? 'rounded-full' : 'rounded-xl'
  const sizeClass = size === 'sm' ? sizeStyles.sm : sizeStyles.md

  return (
    <Component
      className={`${baseClass} ${roundedClass} ${sizeClass} ${className}`.trim()}
      style={{
        background: style.background,
        border: variant === 'surface' ? '1px solid var(--stroke)' : undefined,
        boxShadow: style.boxShadow,
        color: style.color,
      }}
    >
      {children}
    </Component>
  )
}
