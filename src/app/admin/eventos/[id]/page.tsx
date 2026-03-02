'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  MOCK_COMPANIES,
  MOCK_VALIDATION_EMPRESAS,
  MOCK_VALIDATION_EMPRESAS_STATS,
  MOCK_VALIDATION_NOMINA,
  MOCK_VALIDATION_NOMINA_STATS,
} from '@/data/mock-event-detail'
import { getEvents } from '@/lib/events-store'
import { VENUES } from '@/lib/constants'
import type { Event } from '@/types'

function statusBadgeClass(status: Event['statusAdmin']) {
  if (status === 'LIVE') return 'bg-[#ffe5e5] text-[var(--error)]'
  if (status === 'VALIDACIÓN') return 'bg-[#fff3cd] text-[#856404]'
  return 'bg-[#e5e7ff] text-[var(--accent)]'
}

export default function AdminEventoPage() {
  const params = useParams()
  const id = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [loadingNotify, setLoadingNotify] = useState<string | null>(null)
  const [loadingApprove, setLoadingApprove] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      const ev = getEvents().find((e) => e.id === id)
      setEvent(ev ?? null)
    }, 0)
    return () => clearTimeout(t)
  }, [id])

  useEffect(() => {
    if (event) document.title = `${event.name} - CREW`
  }, [event])

  if (!event) {
    return (
      <div className="max-w-[1200px] px-6 py-6">
        <Link
          className="mb-6 inline-flex items-center gap-2 text-[15px] font-medium"
          href="/admin"
          style={{ color: 'var(--accent)' }}
        >
          ← Volver al panel
        </Link>
        <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
          Evento no encontrado.
        </p>
      </div>
    )
  }

  const venue = VENUES.find((v) => v.id === event.venueId)
  const totalEmployees = event.employeeCount ?? 0
  const validados = Math.floor(totalEmployees * 0.28)
  const pendientes = totalEmployees - validados

  const handleNotify = (companyName: string) => {
    setLoadingNotify(companyName)
    setTimeout(() => setLoadingNotify(null), 600)
  }

  const handleApprove = (companyName: string) => {
    setLoadingApprove(companyName)
    setTimeout(() => setLoadingApprove(null), 600)
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <Link
        className="mb-6 inline-flex items-center gap-2 text-[15px] font-medium hover:opacity-80"
        href="/admin"
        style={{ color: 'var(--accent)' }}
      >
        ← Volver al panel
      </Link>

      {/* Event Header */}
      <div
        className="mb-6 overflow-hidden rounded-[var(--radius-lg)] border shadow-[var(--shadow)]"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
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
                unoptimized={event.flyerUrl.startsWith('http') && !event.flyerUrl.includes('unsplash.com')}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.7))',
                }}
              />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.7))',
              }}
            />
          )}
          <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8">
            <div className="flex justify-between items-start">
              <h1
                className="text-2xl font-bold tracking-tight text-white drop-shadow-md md:text-[28px]"
                style={{ letterSpacing: '-0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
              >
                {event.name}
              </h1>
              <span
                className={`rounded-[10px] px-4 py-2 text-xs font-semibold uppercase tracking-wider ${statusBadgeClass(event.statusAdmin)}`}
              >
                {event.statusAdmin}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div
            className="flex flex-wrap gap-5 text-[11px]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span>📅 {event.dateDisplay ?? event.date}</span>
            <span>📍 {venue?.name ?? event.venueId}</span>
            <span>⏰ {event.timeRange}</span>
          </div>

          <div
            className="mt-5 grid grid-cols-2 gap-5 border-t pt-5 md:grid-cols-4"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                {event.providerIds.length}
              </div>
              <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                Proveedores
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                {totalEmployees}
              </div>
              <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                Empleados totales
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                {validados}
              </div>
              <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                Validados
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                {pendientes}
              </div>
              <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                Pendientes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empresas Asignadas */}
      <section className="mb-6">
        <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--text)' }}>
          Empresas Asignadas
        </h2>
        <div className="grid gap-3">
          {MOCK_COMPANIES.map((company) => (
            <div
              key={company.cuit}
              className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 shadow-sm ${
                company.status === 'error'
                  ? 'border-red-500 bg-[#fff5f5]'
                  : 'border-emerald-500 bg-[#f0fdf4]'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                  {company.razonSocial}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  CUIT: <span className="font-mono">{company.cuit}</span> • {company.employees} empleados
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                    company.status === 'error' ? 'bg-[#ffe5e5]' : 'bg-[#d1fae5]'
                  }`}
                >
                  {company.status === 'error' ? '⚠️' : '✓'}
                </div>
                {company.status === 'error' ? (
                  <button
                    className="rounded-lg bg-[#fff3cd] px-3 py-1.5 text-[11px] font-semibold text-[#856404] transition-colors hover:bg-[#ffeaa7] disabled:opacity-70"
                    disabled={loadingNotify === company.razonSocial}
                    onClick={() => handleNotify(company.razonSocial)}
                    type="button"
                  >
                    {loadingNotify === company.razonSocial ? 'Enviando...' : 'Notificar'}
                  </button>
                ) : (
                  <button
                    className="rounded-lg bg-[#d1fae5] px-3 py-1.5 text-[11px] font-semibold text-[#047857] transition-colors hover:bg-[#a7f3d0] disabled:opacity-70"
                    disabled={loadingApprove === company.razonSocial}
                    onClick={() => handleApprove(company.razonSocial)}
                    type="button"
                  >
                    {loadingApprove === company.razonSocial ? 'Procesando...' : 'Aprobar'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detalles de Validación */}
      <section className="mb-6">
        <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--text)' }}>
          Detalles de Validación
        </h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Validación Empresas */}
          <div
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h3 className="text-lg font-bold text-[#1d1d1f]">
                Validación Empresas
              </h3>
              <span className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                {MOCK_VALIDATION_EMPRESAS.length} errores
              </span>
            </div>
            <ul className="space-y-2">
              {MOCK_VALIDATION_EMPRESAS.map((err, i) => (
                <li
                  key={i}
                  className="rounded-[10px] border border-red-200 bg-[#fff5f5] p-3 text-sm"
                >
                  <strong className="mb-1 block text-red-700">{err.title}</strong>
                  <span className="text-[#1d1d1f]">{err.description}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-[10px] border border-[var(--border)] bg-[var(--bg)] p-3 text-center">
                <div className="text-2xl font-bold text-[var(--approved)]">
                  {MOCK_VALIDATION_EMPRESAS_STATS.aprobadas}
                </div>
                <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Aprobadas
                </div>
              </div>
              <div className="rounded-[10px] border border-[var(--border)] bg-[var(--bg)] p-3 text-center">
                <div className="text-2xl font-bold text-[var(--error)]">
                  {MOCK_VALIDATION_EMPRESAS_STATS.conErrores}
                </div>
                <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Con errores
                </div>
              </div>
              <div className="rounded-[10px] border border-[var(--border)] bg-[var(--bg)] p-3 text-center">
                <div className="text-2xl font-bold text-[#1d1d1f]">
                  {MOCK_VALIDATION_EMPRESAS_STATS.total}
                </div>
                <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Total
                </div>
              </div>
            </div>
          </div>

          {/* Validación vs Nómina */}
          <div
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h3 className="text-lg font-bold text-[#1d1d1f]">
                Validación vs Nómina
              </h3>
              <span className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                {MOCK_VALIDATION_NOMINA.length} errores
              </span>
            </div>
            <ul className="space-y-2">
              {MOCK_VALIDATION_NOMINA.map((err, i) => (
                <li
                  key={i}
                  className="rounded-[10px] border border-red-200 bg-[#fff5f5] p-3 text-sm"
                >
                  <strong className="mb-1 block text-red-700">{err.title}</strong>
                  <span className="text-[#1d1d1f]">{err.description}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-[10px] border border-[var(--border)] bg-[var(--bg)] p-3 text-center">
                <div className="text-2xl font-bold text-[var(--approved)]">
                  {MOCK_VALIDATION_NOMINA_STATS.validados}
                </div>
                <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Validados
                </div>
              </div>
              <div className="rounded-[10px] border border-[var(--border)] bg-[var(--bg)] p-3 text-center">
                <div className="text-2xl font-bold text-[var(--error)]">
                  {MOCK_VALIDATION_NOMINA_STATS.errores}
                </div>
                <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Errores
                </div>
              </div>
              <div className="rounded-[10px] border border-[var(--border)] bg-[var(--bg)] p-3 text-center">
                <div className="text-2xl font-bold text-[var(--warning)]">
                  {MOCK_VALIDATION_NOMINA_STATS.pendientes}
                </div>
                <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
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
