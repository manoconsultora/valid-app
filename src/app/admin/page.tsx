'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { EventCard } from '@/components/ui/EventCard'
import { MetricCard } from '@/components/ui/MetricCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useUser } from '@/hooks/useUser'
import { VENUES } from '@/lib/constants'
import { statusAdminToBadgeVariant } from '@/lib/event-utils'
import { getEvents } from '@/lib/events-store'
import type { Event } from '@/types'

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<Event[]>([])
  const venueById = Object.fromEntries(VENUES.map(v => [v.id, v]))
  const { user } = useUser()
  const userName = user?.name ?? ''

  useDocumentTitle('Panel de Control - VALID')

  useEffect(
    () =>
      (
        (t: ReturnType<typeof setTimeout>) => () =>
          clearTimeout(t)
      )(setTimeout(() => setEvents(getEvents()), 0)),
    []
  )

  const uniqueProviders = new Set(events.flatMap(e => e.providerIds)).size
  const totalEmployees = events.reduce((acc, e) => acc + (e.employeeCount ?? 0), 0)
  const companiesWithDocs = Math.min(uniqueProviders, 15)
  const companiesTotal = Math.max(uniqueProviders, 15)
  const validatedEmployees = Math.floor(totalEmployees * 0.76)

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        subtitle="Bienvenida al panel de control"
        title={`Hola, ${userName || 'Admin'} 👋`}
      />

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          helper={`${Math.round((companiesWithDocs / companiesTotal) * 100)}% completado`}
          icon="📋"
          iconBg="#f5f3ff"
          label="Empresas con docs"
          primary={String(companiesWithDocs)}
          secondary={`/${companiesTotal}`}
        />

        <MetricCard
          helper="Requieren corrección"
          icon="⚠️"
          iconBg="#fffbeb"
          label="Empresas con errores"
          primary="3"
        />

        <MetricCard
          helper="Según lista de ingreso"
          icon="👥"
          iconBg="#eff6ff"
          label="Total empleados"
          primary={String(totalEmployees || 247)}
        />

        <MetricCard
          helper={
            totalEmployees
              ? `${Math.round((validatedEmployees / totalEmployees) * 100)}% del total`
              : '76% del total'
          }
          icon="✓"
          iconBg="#f0fdf4"
          label="Empleados validados"
          primary={String(validatedEmployees || 189)}
        />
      </div>

      {/* Gestión */}
      <section className="mb-8">
        <h2
          className="mb-3 text-base font-semibold tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          Gestión
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            href="/admin/eventos/crear"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
            }}
          >
            <div className="mb-2 text-[28px]">🎯</div>
            <div className="text-base font-semibold">Crear Evento</div>
            <div className="text-[11px] leading-snug opacity-90">
              Crea un nuevo evento, asigna protocolos y gestiona proveedores
            </div>
          </Link>
          <Link
            className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            href="/admin/rrhh"
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              boxShadow: '0 4px 12px rgba(240, 147, 251, 0.2)',
            }}
          >
            <div className="mb-2 text-[28px]">👨‍💼</div>
            <div className="text-base font-semibold">RRHH</div>
            <div className="text-[11px] leading-snug opacity-90">
              Gestiona los empleados propios de la productora
            </div>
          </Link>
          <Link
            className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            href="/admin/proveedores"
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              boxShadow: '0 4px 12px rgba(79, 172, 254, 0.2)',
            }}
          >
            <div className="mb-2 text-[28px]">🏢</div>
            <div className="text-base font-semibold">Proveedores</div>
            <div className="text-[11px] leading-snug opacity-90">
              Alta, edición y gestión de credenciales de empresas proveedoras
            </div>
          </Link>
        </div>
      </section>

      {/* Eventos Activos */}
      <section className="mb-8">
        <h2
          className="mb-5 text-base font-semibold tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          Eventos Activos
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.length === 0 ? (
            <p
              className="col-span-full py-8 text-center text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              No hay eventos activos. Creá uno desde Gestión.
            </p>
          ) : (
            events.map(event => (
              <EventCard
                badgeBottomLeft={
                  <Badge as="div" className="backdrop-blur-md" variant="surface">
                    📅 {event.dateDisplay ?? event.date}
                  </Badge>
                }
                badgeTopRight={
                  <Badge
                    className="text-[11px] tracking-wider uppercase"
                    variant={statusAdminToBadgeVariant(event.statusAdmin)}
                  >
                    {event.statusAdmin}
                  </Badge>
                }
                href={`/admin/eventos/${event.id}`}
                image={
                  <>
                    {event.flyerUrl ? (
                      <Image
                        alt={`Flyer: ${event.name}`}
                        className="object-cover"
                        fill
                        sizes="(max-width: 640px) 100vw, 320px"
                        src={event.flyerUrl}
                        unoptimized={
                          event.flyerUrl.startsWith('http') &&
                          !event.flyerUrl.includes('unsplash.com')
                        }
                      />
                    ) : null}
                    <span className="sr-only">Flyer: {event.name}</span>
                  </>
                }
                imageHeight={180}
                key={event.id}
                stats={[
                  { label: 'EMPLEADOS', value: event.employeeCount ?? '—' },
                  { label: 'PROVEEDORES', value: event.providerIds.length },
                ]}
                subtitle={`📍 ${venueById[event.venueId]?.name ?? event.venueId}`}
                title={event.name}
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
}
