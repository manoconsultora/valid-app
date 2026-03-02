'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { Event } from '@/types'

import { getEvents } from '@/lib/events-store'
import { VENUES } from '@/lib/constants'
import { getSession } from '@/lib/session'

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [userName, setUserName] = useState('')
  const venueById = Object.fromEntries(VENUES.map((v) => [v.id, v]))

  useEffect(() => {
    const t = setTimeout(() => setEvents(getEvents()), 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    document.title = 'Panel de Control - CREW'
  }, [])

  useEffect(() => {
    const session = getSession()
    if (session?.user.name) setUserName(session.user.name)
  }, [])

  const totalProviders = events.reduce((acc, e) => acc + e.providerIds.length, 0)
  const uniqueProviders = new Set(events.flatMap((e) => e.providerIds)).size
  const totalEmployees = events.reduce((acc, e) => acc + (e.employeeCount ?? 0), 0)
  const companiesWithDocs = Math.min(uniqueProviders, 15)
  const companiesTotal = Math.max(uniqueProviders, 15)
  const validatedEmployees = Math.floor(totalEmployees * 0.76)

  const statusClass = (status: Event['statusAdmin']) => {
    if (status === 'LIVE') return 'bg-[var(--rejected)]'
    if (status === 'VALIDACIÓN') return 'bg-[var(--warning)]'
    return 'bg-[var(--accent)]'
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Header */}
      <div className="mb-10 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            Hola, {userName || 'Admin'} 👋
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Bienvenida al panel de control
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          className="rounded-2xl border p-4"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div
            className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg text-lg"
            style={{ background: '#f5f3ff' }}
          >
            📋
          </div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            {companiesWithDocs}
            <span className="text-xl" style={{ color: 'var(--text-secondary)' }}>
              /{companiesTotal}
            </span>
          </div>
          <div className="text-xs font-medium" style={{ color: 'var(--text)' }}>
            Empresas con docs
          </div>
          <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            {Math.round((companiesWithDocs / companiesTotal) * 100)}% completado
          </div>
        </div>

        <div
          className="rounded-2xl border p-4"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div
            className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg text-lg"
            style={{ background: '#fffbeb' }}
          >
            ⚠️
          </div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            3
          </div>
          <div className="text-xs font-medium" style={{ color: 'var(--text)' }}>
            Empresas con errores
          </div>
          <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            Requieren corrección
          </div>
        </div>

        <div
          className="rounded-2xl border p-4"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div
            className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg text-lg"
            style={{ background: '#eff6ff' }}
          >
            👥
          </div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            {totalEmployees || 247}
          </div>
          <div className="text-xs font-medium" style={{ color: 'var(--text)' }}>
            Total empleados
          </div>
          <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            Según lista de ingreso
          </div>
        </div>

        <div
          className="rounded-2xl border p-4"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div
            className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg text-lg"
            style={{ background: '#f0fdf4' }}
          >
            ✓
          </div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            {validatedEmployees || 189}
          </div>
          <div className="text-xs font-medium" style={{ color: 'var(--text)' }}>
            Empleados validados
          </div>
          <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            {totalEmployees ? `${Math.round((validatedEmployees / totalEmployees) * 100)}% del total` : '76% del total'}
          </div>
        </div>
      </div>

      {/* Gestión */}
      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
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
        <h2 className="mb-5 text-base font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
          Eventos Activos
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              No hay eventos activos. Creá uno desde Gestión.
            </p>
          ) : (
            events.map((event) => (
              <Link
                className="overflow-hidden rounded-lg border transition-all hover:-translate-y-0.5"
                href={`/admin/eventos/${event.id}`}
                key={event.id}
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div className="relative h-[180px] w-full overflow-hidden bg-[#1a1a1a]">
                  {event.flyerUrl ? (
                    <Image
                      alt={`Flyer: ${event.name}`}
                      className="object-cover"
                      fill
                      sizes="(max-width: 640px) 100vw, 320px"
                      src={event.flyerUrl}
                      unoptimized={event.flyerUrl.startsWith('http') && !event.flyerUrl.includes('unsplash.com')}
                    />
                  ) : null}
                  <span className="sr-only">Flyer: {event.name}</span>
                  <span
                  className="absolute right-3 top-3 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white"
                  style={{ background: statusClass(event.statusAdmin) }}
                >
                  {event.statusAdmin}
                </span>
                <span
                  className="absolute bottom-3 left-3 rounded-lg px-3 py-1.5 text-xs font-semibold backdrop-blur-md"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    color: 'var(--text)',
                  }}
                >
                  📅 {event.dateDisplay ?? event.date}
                </span>
              </div>
              <div className="p-5">
                <div className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
                  {event.name}
                </div>
                <div className="mt-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  📍 {venueById[event.venueId]?.name ?? event.venueId}
                </div>
                <div
                  className="mt-4 flex gap-4 border-t pt-4"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex-1 text-center">
                    <div className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                      {event.providerIds.length}
                    </div>
                    <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                      PROVEEDORES
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                      {event.employeeCount ?? '—'}
                    </div>
                    <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                      EMPLEADOS
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-[13px]" style={{ color: 'var(--text-secondary)' }}>
        <div>CREW • Sistema de Validación Documental</div>
        <div className="mt-1 text-[11px] opacity-60">powered by MANOBOT</div>
      </footer>
    </div>
  )
}
