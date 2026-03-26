'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getEventProvidersForEvent } from '@/data/mock-db'
import {
  MOCK_VALIDATION_EMPRESAS,
  MOCK_VALIDATION_EMPRESAS_STATS,
  MOCK_VALIDATION_NOMINA,
  MOCK_VALIDATION_NOMINA_STATS,
} from '@/data/mock-event-detail'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { VENUES } from '@/lib/constants'
import { statusAdminToBadgeVariant } from '@/lib/event-utils'
import { getEvents } from '@/lib/events-store'
import { getProviders } from '@/lib/providers-store'
import type { Event } from '@/types'

export default function AdminEventoPage() {
  const params = useParams()
  const id = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [loadingNotify, setLoadingNotify] = useState<string | null>(null)
  const [loadingApprove, setLoadingApprove] = useState<string | null>(null)

  useEffect(
    () =>
      (
        (t: ReturnType<typeof setTimeout>) => () =>
          clearTimeout(t)
      )(setTimeout(() => setEvent(getEvents().find(e => e.id === id) ?? null), 0)),
    [id]
  )

  useDocumentTitle(event ? `${event.name} - VALID` : 'Evento - VALID')

  if (!event) {
    return (
      <div className="max-w-[1200px] px-6 py-6">
        <Link
          className="text-accent mb-6 inline-flex items-center gap-2 text-[15px] font-medium"
          href="/admin"
        >
          ← Volver al panel
        </Link>
        <p className="mt-4 text-(--text-secondary)">Evento no encontrado.</p>
      </div>
    )
  }

  const venue = VENUES.find(v => v.id === event.venueId)
  const totalEmployees = event.employeeCount ?? 0
  const validados = Math.floor(totalEmployees * 0.28)
  const pendientes = totalEmployees - validados

  const providerList = getProviders()
  const eventProviders = getEventProvidersForEvent(event.id)

  function mapEventProvider(ep: (typeof eventProviders)[number]) {
    const provider = providerList.find(p => p.id === ep.provider_id)
    if (!provider) {
      return null
    }
    const status: 'error' | 'success' =
      ep.documentation_status === 'approved' ? 'success' : 'error'
    return {
      cuit: provider.cuit,
      employees: ep.employee_count,
      razonSocial: provider.razonSocial,
      status,
    }
  }

  const companies = eventProviders
    .map(mapEventProvider)
    .filter((c): c is NonNullable<typeof c> => c != null)

  const handleNotify = (companyName: string) => (
    setLoadingNotify(companyName),
    setTimeout(() => setLoadingNotify(null), 600)
  )

  const handleApprove = (companyName: string) => (
    setLoadingApprove(companyName),
    setTimeout(() => setLoadingApprove(null), 600)
  )

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <Link
        className="text-accent mb-6 inline-flex items-center gap-2 text-[15px] font-medium hover:opacity-80"
        href="/admin"
      >
        ← Volver al panel
      </Link>

      {/* Event Header */}
      <div className="mb-6 overflow-hidden rounded-lg border border-(--border) bg-(--surface) shadow-(--shadow)">
        <div className="relative h-[200px] w-full bg-[#1a1a1a]">
          {event.flyerUrl ? (
            <>
              <Image
                alt=""
                className="object-cover"
                fill
                priority
                sizes="1200px"
                src={event.flyerUrl}
                unoptimized={
                  event.flyerUrl.startsWith('http') &&
                  !event.flyerUrl.includes('unsplash.com')
                }
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/40 to-black/70" />
            </>
          ) : (
            <div className="absolute inset-0 bg-linear-to-b from-black/40 to-black/70" />
          )}
          <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8">
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md [text-shadow:0_2px_8px_rgba(0,0,0,0.5)] md:text-[28px]">
                {event.name}
              </h1>
              <Badge
                className="rounded-[10px] px-4 py-2 tracking-wider uppercase"
                variant={statusAdminToBadgeVariant(event.statusAdmin)}
              >
                {event.statusAdmin}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-5 text-[11px] text-(--text-secondary)">
            <span>📅 {event.dateDisplay ?? event.date}</span>
            <span>📍 {venue?.name ?? event.venueId}</span>
            <span>⏰ {event.timeRange}</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-5 border-t border-(--border) pt-5 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold tracking-tight text-(--text)">
                {event.providerIds.length}
              </div>
              <div className="text-[11px] font-medium text-(--text-secondary)">
                Proveedores
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tracking-tight text-(--text)">
                {totalEmployees}
              </div>
              <div className="text-[11px] font-medium text-(--text-secondary)">
                Empleados totales
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tracking-tight text-(--text)">
                {validados}
              </div>
              <div className="text-[11px] font-medium text-(--text-secondary)">
                Validados
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tracking-tight text-(--text)">
                {pendientes}
              </div>
              <div className="text-[11px] font-medium text-(--text-secondary)">
                Pendientes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empresas Asignadas */}
      <section className="mb-6">
        <h2 className="mb-3 text-base font-semibold text-(--text)">Empresas Asignadas</h2>
        <div className="grid gap-3">
          {companies.map(company => (
            <div
              className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 shadow-sm ${
                company.status === 'error'
                  ? 'border-red-500 bg-red-50'
                  : 'border-emerald-500 bg-green-50'
              }`}
              key={company.cuit}
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-(--text)">
                  {company.razonSocial}
                </div>
                <div className="text-[11px] text-(--text-secondary)">
                  CUIT: <span className="font-mono">{company.cuit}</span> •{' '}
                  {company.employees} empleados
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                    company.status === 'error' ? 'bg-error-soft' : 'bg-success-soft'
                  }`}
                >
                  {company.status === 'error' ? '⚠️' : '✓'}
                </div>
                {company.status === 'error' ? (
                  <Button
                    disabled={loadingNotify === company.razonSocial}
                    onClick={() => handleNotify(company.razonSocial)}
                    size="sm"
                    variant="warning-soft"
                  >
                    {loadingNotify === company.razonSocial ? 'Enviando...' : 'Notificar'}
                  </Button>
                ) : (
                  <Button
                    disabled={loadingApprove === company.razonSocial}
                    onClick={() => handleApprove(company.razonSocial)}
                    size="sm"
                    variant="success-soft"
                  >
                    {loadingApprove === company.razonSocial ? 'Procesando...' : 'Aprobar'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detalles de Validación */}
      <section className="mb-6">
        <h2 className="mb-3 text-base font-semibold text-(--text)">
          Detalles de Validación
        </h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Validación Empresas */}
          <div className="rounded-lg border border-(--border) bg-(--surface) p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-(--border) pb-4">
              <h3 className="text-lg font-bold text-(--text)">Validación Empresas</h3>
              <span className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                {MOCK_VALIDATION_EMPRESAS.length} errores
              </span>
            </div>
            <ul className="space-y-2">
              {MOCK_VALIDATION_EMPRESAS.map((err, i) => (
                <li
                  className="rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm"
                  key={i}
                >
                  <strong className="mb-1 block text-red-700">{err.title}</strong>
                  <span className="text-(--text)">{err.description}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-[10px] border border-(--border) bg-(--bg) p-3 text-center">
                <div className="text-approved text-2xl font-bold">
                  {MOCK_VALIDATION_EMPRESAS_STATS.aprobadas}
                </div>
                <div className="text-[11px] font-medium text-(--text-secondary)">
                  Aprobadas
                </div>
              </div>
              <div className="rounded-[10px] border border-(--border) bg-(--bg) p-3 text-center">
                <div className="text-2xl font-bold text-(--error)">
                  {MOCK_VALIDATION_EMPRESAS_STATS.conErrores}
                </div>
                <div className="text-[11px] font-medium text-(--text-secondary)">
                  Con errores
                </div>
              </div>
              <div className="rounded-[10px] border border-(--border) bg-(--bg) p-3 text-center">
                <div className="text-2xl font-bold text-(--text)">
                  {MOCK_VALIDATION_EMPRESAS_STATS.total}
                </div>
                <div className="text-[11px] font-medium text-(--text-secondary)">
                  Total
                </div>
              </div>
            </div>
          </div>

          {/* Validación vs Nómina */}
          <div className="rounded-lg border border-(--border) bg-(--surface) p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-(--border) pb-4">
              <h3 className="text-lg font-bold text-(--text)">Validación vs Nómina</h3>
              <span className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                {MOCK_VALIDATION_NOMINA.length} errores
              </span>
            </div>
            <ul className="space-y-2">
              {MOCK_VALIDATION_NOMINA.map((err, i) => (
                <li
                  className="rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm"
                  key={i}
                >
                  <strong className="mb-1 block text-red-700">{err.title}</strong>
                  <span className="text-(--text)">{err.description}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-[10px] border border-(--border) bg-(--bg) p-3 text-center">
                <div className="text-approved text-2xl font-bold">
                  {MOCK_VALIDATION_NOMINA_STATS.validados}
                </div>
                <div className="text-[11px] font-medium text-(--text-secondary)">
                  Validados
                </div>
              </div>
              <div className="rounded-[10px] border border-(--border) bg-(--bg) p-3 text-center">
                <div className="text-2xl font-bold text-(--error)">
                  {MOCK_VALIDATION_NOMINA_STATS.errores}
                </div>
                <div className="text-[11px] font-medium text-(--text-secondary)">
                  Errores
                </div>
              </div>
              <div className="rounded-[10px] border border-(--border) bg-(--bg) p-3 text-center">
                <div className="text-2xl font-bold text-(--warning)">
                  {MOCK_VALIDATION_NOMINA_STATS.pendientes}
                </div>
                <div className="text-[11px] font-medium text-(--text-secondary)">
                  Pendientes
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
