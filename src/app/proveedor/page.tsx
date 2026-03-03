 'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { PageHeader } from '@/components/ui/PageHeader'
import { VENUES } from '@/lib/constants'
import { getEvents } from '@/lib/events-store'
import type { Event } from '@/types'

const PROVEEDOR_ID = 'p1'

export default function ProveedorDashboardPage() {
  const [events, setEvents] = useState<Event[]>([])
  const venueById = Object.fromEntries(VENUES.map((v) => [v.id, v]))
  const eventsForProvider = events.filter((e) => e.providerIds.includes(PROVEEDOR_ID))

  useEffect(() => {
    const t = setTimeout(() => setEvents(getEvents()), 0)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader title="Mis eventos asignados" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {eventsForProvider.map((event) => (
          <Link
            className="block rounded-(--radius) border border-(--stroke) p-4 transition-shadow hover:shadow-(--shadow-soft)"
            href={`/proveedor/eventos/${event.id}`}
            key={event.id}
            style={{ background: 'var(--surface-2)' }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-(--text)">{event.name}</p>
              {event.isNew && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
                  NUEVO
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-(--muted)">
              {event.date} · {venueById[event.venueId]?.name ?? event.venueId}
            </p>
            <span
              className="mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{
                background:
                  event.statusProvider === 'Documentación Aprobada'
                    ? 'var(--approved)'
                    : event.statusProvider === 'Documentación Rechazada'
                      ? 'var(--rejected)'
                      : 'var(--pending)',
              }}
            >
              {event.statusProvider ?? 'Cargar Documentación'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
