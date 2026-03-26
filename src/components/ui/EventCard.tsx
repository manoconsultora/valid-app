'use client'

import Link from 'next/link'

export interface EventCardStat {
  value: React.ReactNode
  label: string
  valueClassName?: string
}

export interface EventCardProps {
  href: string
  /** Altura del área de imagen en px (ej. 160 proveedor, 180 admin). */
  imageHeight?: number
  /** Contenido del área de imagen: div con background-image o Next Image. */
  image: React.ReactNode
  badgeTopLeft?: React.ReactNode
  badgeTopRight?: React.ReactNode
  badgeCenter?: React.ReactNode
  badgeBottomLeft?: React.ReactNode
  title: string
  subtitle: string
  stats: EventCardStat[]
}

const cardStyle = {
  backdropFilter: 'blur(var(--blur))',
  background: 'var(--surface-2)',
  border: '1px solid var(--stroke)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-soft)',
} as const

export const EventCard = ({
  badgeBottomLeft,
  badgeCenter,
  badgeTopLeft,
  badgeTopRight,
  href,
  image,
  imageHeight = 160,
  stats,
  subtitle,
  title,
}: EventCardProps) => (
  <Link
    className="block cursor-pointer overflow-hidden transition-all duration-[0.18s] ease-out hover:-translate-y-1 hover:shadow-(--shadow)"
    href={href}
    style={cardStyle}
  >
    <div
      className="relative w-full overflow-hidden bg-[#1a1a1a]"
      style={{ height: imageHeight }}
    >
      {image}
      {badgeTopLeft ? (
        <div className="absolute top-3 left-3 z-1">{badgeTopLeft}</div>
      ) : null}
      {badgeTopRight ? (
        <div className="absolute top-3 right-3 z-1">{badgeTopRight}</div>
      ) : null}
      {badgeCenter ? (
        <div className="absolute top-1/2 left-1/2 z-1 -translate-x-1/2 -translate-y-1/2">
          {badgeCenter}
        </div>
      ) : null}
      {badgeBottomLeft ? (
        <div className="absolute bottom-3 left-3 z-1">{badgeBottomLeft}</div>
      ) : null}
    </div>
    <div
      className="border-t pt-5"
      style={{
        borderColor: 'var(--stroke)',
        paddingBottom: 20,
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      <div
        className="mb-2 text-[18px] leading-tight font-bold tracking-[-0.02em]"
        style={{ color: 'var(--text)' }}
      >
        {title}
      </div>
      <div
        className="mb-3.5 flex items-center gap-1.5 text-[13px]"
        style={{ color: 'var(--muted)' }}
      >
        {subtitle}
      </div>
      <div
        className="flex gap-3 border-t pt-3.5"
        style={{ borderColor: 'var(--stroke)' }}
      >
        {stats.map((stat, i) => (
          <div className="flex-1 text-center" key={i}>
            <div
              className="mb-1 text-[20px] font-bold tracking-[-0.02em]"
              style={{
                color: stat.valueClassName
                  ? `var(--${stat.valueClassName})`
                  : 'var(--text)',
              }}
            >
              {stat.value}
            </div>
            <div className="text-[10px] font-semibold" style={{ color: 'var(--muted)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  </Link>
)
