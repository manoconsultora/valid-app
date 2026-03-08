'use client'

import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { EventCard } from '@/components/ui/EventCard'
import { VENUES } from '@/lib/constants'
import { getEvents } from '@/lib/events-store'
import { getProviders } from '@/lib/providers-store'
import type { Event } from '@/types'

const PROVEEDOR_ID = 'p1'

const DEMO_COUNTS: Record<string, { aprobados: number; pendientes: number; rechazados: number }> = {
  e0: { aprobados: 0, pendientes: 17, rechazados: 0 },
  e1: { aprobados: 14, pendientes: 3, rechazados: 0 },
  e2: { aprobados: 3, pendientes: 17, rechazados: 0 },
  e3: { aprobados: 12, pendientes: 0, rechazados: 0 },
}

const getCounts = (event: Event) =>
  DEMO_COUNTS[event.id] ?? {
    aprobados: event.employeeCount ?? 0,
    pendientes: 0,
    rechazados: 0,
  }

export default function ProveedorDashboardPage() {
  const [events, setEvents] = useState<Event[]>([])
  const venueById = Object.fromEntries(VENUES.map((v) => [v.id, v]))
  const eventsForProvider = events.filter((e) => e.providerIds.includes(PROVEEDOR_ID))
  const totalWorkers = eventsForProvider.reduce((s, e) => s + (e.employeeCount ?? 0), 0)
  const provider = getProviders().find((p) => p.id === PROVEEDOR_ID)

  useEffect(function setup() {
    const t = setTimeout(() => setEvents(getEvents()), 0)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="header">
        <div className="company-logo">S</div>
        <div className="company-name">{provider?.razonSocial ?? 'Proveedor'}</div>
        <div className="company-cuit">CUIT: {provider?.cuit ?? '—'}</div>
      </div>

      {/* Title */}
      <div className="title-section">
        <h1 className="main-title">Mis Eventos</h1>
        <p className="subtitle">Gestioná la documentación de tu equipo</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{eventsForProvider.length}</div>
          <div className="stat-label">
            Eventos
            <br />
            Activos
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalWorkers}</div>
          <div className="stat-label">Trabajadores</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">91%</div>
          <div className="stat-label">
            Progreso Última
            <br />
            Validación
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="section-header">
        <h2 className="section-title">Eventos Asignados</h2>
        <Badge variant="accent">{eventsForProvider.length}</Badge>
      </div>

      <div className="events-grid">
        {eventsForProvider.map(
          // eslint-disable-next-line arrow-body-style -- need block to compute counts once
          (event) => {
          const counts = getCounts(event)
          return (
            <EventCard
              badgeCenter={
                <Badge
                  as="div"
                  className="whitespace-nowrap px-5 py-3 text-sm font-bold"
                  variant="surface"
                >
                  {event.dateDisplay ?? event.date}
                </Badge>
              }
              badgeTopLeft={
                <Badge
                  className="px-[18px] py-2.5 text-xs font-bold shadow-(--shadow)"
                  variant={event.statusProvider === 'Documentación Aprobada' ? 'success' : 'pending'}
                >
                  {event.statusProvider ?? 'Cargar Documentación'}
                </Badge>
              }
              badgeTopRight={
                event.isNew ? (
                  <Badge
                    className="px-3 py-1.5 text-[10px] font-bold tracking-wider"
                    variant="rejected"
                  >
                    NUEVO
                  </Badge>
                ) : undefined
              }
              href={`/proveedor/eventos/${event.id}`}
              image={
                <div
                  className="absolute inset-0"
                  style={
                    event.flyerUrl
                      ? {
                          backgroundImage: `url(${event.flyerUrl})`,
                          backgroundPosition: 'center',
                          backgroundSize: 'cover',
                        }
                      : undefined
                  }
                />
              }
              imageHeight={160}
              key={event.id}
              stats={[
                { label: 'Pendientes', value: counts.pendientes, valueClassName: 'pending' },
                { label: 'Aprobados', value: counts.aprobados, valueClassName: 'approved' },
                { label: 'Rechazados', value: counts.rechazados, valueClassName: 'rejected' },
              ]}
              subtitle={`📍 ${venueById[event.venueId]?.name ?? event.venueId}`}
              title={event.name}
            />
          )
        }
        )
        }
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="action-title">Acciones Rápidas</div>
        <div className="action-buttons">
          <button className="action-btn" type="button">
            📄 Ver Protocolo Actual
          </button>
          <button className="action-btn" type="button">
            📊 Reporte de Última Validación
          </button>
          <button className="action-btn" type="button">
            💬 ¿Necesitás Ayuda?
          </button>
        </div>
      </div>
    </div>
  )
}
