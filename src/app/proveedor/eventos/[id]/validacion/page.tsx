'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { MetricCard } from '@/components/ui/MetricCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { getEvents } from '@/lib/events-store'
import type { Event } from '@/types'

const PROVEEDOR_ID = 'p1'

/** Demo: trabajadores para estado de validación (SOP). */
const DEMO_WORKERS = [
  {
    art: 'Vigente ✓',
    cuil: '20-35123456-7',
    dni: '35.123.456',
    fechaValidacion: '25 Oct 2024',
    name: 'Juan Martínez',
    role: 'Técnico de Sonido',
    status: 'Aprobado' as const,
  },
  {
    art: 'En Revisión',
    cuil: '27-42987654-3',
    dni: '42.987.654',
    fechaValidacion: '28 Oct 2024',
    name: 'Laura González',
    role: 'Asistente de Producción',
    status: 'Pendiente' as const,
  },
  {
    art: 'Vigente ✓',
    cuil: '20-38456789-5',
    dni: '38.456.789',
    fechaValidacion: '26 Oct 2024',
    name: 'Carlos Rodríguez',
    role: 'Iluminación',
    status: 'Aprobado' as const,
  },
  {
    art: 'En Revisión',
    cuil: '27-40123789-1',
    dni: '40.123.789',
    fechaValidacion: '28 Oct 2024',
    name: 'María Fernández',
    role: 'Escenario',
    status: 'Pendiente' as const,
  },
  {
    art: 'Vigente ✓',
    cuil: '20-36789012-9',
    dni: '36.789.012',
    fechaValidacion: '25 Oct 2024',
    name: 'Pablo Ramírez',
    role: 'Electricista',
    status: 'Aprobado' as const,
  },
]

const pendientes = 3
const aprobados = 14
const rechazados = 0
const total = pendientes + aprobados + rechazados

const initials = (name: string) =>
  name
    .split(' ')
    .map(s => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

type Filter = 'todos' | 'pendientes' | 'aprobados'

export default function ProveedorValidacionPage() {
  const params = useParams()
  const id = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [filter, setFilter] = useState<Filter>('todos')

  useEffect(
    function loadEvent() {
      const t = setTimeout(
        () =>
          setEvent(
            getEvents().find(e => e.id === id && e.providerIds.includes(PROVEEDOR_ID)) ??
              null
          ),
        0
      )
      return function cleanup() {
        clearTimeout(t)
      }
    },
    [id]
  )

  if (!event) {
    return (
      <div>
        <Link className="text-(--text) hover:underline" href={`/proveedor/eventos/${id}`}>
          ← Volver
        </Link>
        <p className="mt-4 text-(--muted)">Evento no encontrado.</p>
      </div>
    )
  }

  const subtitle = `${event.name} · ${event.dateDisplay ?? event.date}`

  return (
    <div className="mx-auto max-w-[900px]">
      <Link
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-(--text) hover:underline"
        href={`/proveedor/eventos/${id}`}
      >
        ← Volver
      </Link>
      <PageHeader subtitle={subtitle} title="Estado de Validación" />

      <div className="mb-6 grid grid-cols-3 gap-4">
        <MetricCard
          icon={<span style={{ color: 'var(--pending)' }}>⏳</span>}
          iconBg="var(--pending-soft)"
          label="Pendientes"
          primary={String(pendientes)}
        />
        <MetricCard
          icon={<span style={{ color: 'var(--approved)' }}>✓</span>}
          iconBg="var(--approved-soft)"
          label="Aprobados"
          primary={String(aprobados)}
        />
        <MetricCard
          icon={<span style={{ color: 'var(--rejected)' }}>✕</span>}
          iconBg="var(--rejected-soft)"
          label="Rechazados"
          primary={String(rechazados)}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          className="cursor-pointer"
          onClick={() => setFilter('todos')}
          type="button"
        >
          <Badge variant={filter === 'todos' ? 'accent' : 'neutral'}>
            Todos ({total})
          </Badge>
        </button>
        <button
          className="cursor-pointer"
          onClick={() => setFilter('pendientes')}
          type="button"
        >
          <Badge variant={filter === 'pendientes' ? 'accent' : 'neutral'}>
            Pendientes
          </Badge>
        </button>
        <button
          className="cursor-pointer"
          onClick={() => setFilter('aprobados')}
          type="button"
        >
          <Badge variant={filter === 'aprobados' ? 'accent' : 'neutral'}>Aprobados</Badge>
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          className="flex items-center gap-2 rounded-(--radius) border border-(--stroke) bg-(--bg) px-4 py-2 text-sm font-medium text-(--text)"
          type="button"
        >
          <span>📊</span>
          Descargar Reporte
        </button>
        <Link
          className="flex items-center gap-2 rounded-(--radius) border border-(--stroke) px-4 py-2 text-sm font-medium text-(--text)"
          href={`/proveedor/eventos/${id}`}
          style={{ background: 'var(--bg)' }}
        >
          <span>+</span>
          Agregar
        </Link>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-(--text)">Trabajadores</h2>
          <Badge variant="accent">{total}</Badge>
        </div>
        <ul className="space-y-3">
          {DEMO_WORKERS.map(w => (
            <li
              className="rounded-(--radius) border border-(--stroke) p-4"
              key={w.name}
              style={{ background: 'var(--surface)', boxShadow: 'var(--shadow)' }}
            >
              <div className="flex flex-wrap items-start gap-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ background: 'var(--accent-purple)' }}
                >
                  {initials(w.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-(--text)">{w.name}</p>
                  <p className="text-xs text-(--muted)">{w.role}</p>
                  <Badge
                    className="mt-2 inline-flex gap-1"
                    variant={w.status === 'Aprobado' ? 'success' : 'pending'}
                  >
                    {w.status === 'Aprobado' ? '✓ Aprobado' : 'Pendiente'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-(--muted)">
                  <span>DNI: {w.dni}</span>
                  <span>CUIL: {w.cuil}</span>
                  <span>Fecha validación: {w.fechaValidacion}</span>
                  <span>ART/Estado: {w.art}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
