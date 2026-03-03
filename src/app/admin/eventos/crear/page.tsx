'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { VENUES } from '@/lib/constants'
import { PROVIDER_CATEGORIES } from '@/lib/constants'
import { addEvent } from '@/lib/events-store'
import { getProviders } from '@/lib/providers-store'
import type { Provider } from '@/types'

const formCardClass =
  'rounded-lg border p-6 shadow-sm bg-(--surface) border-(--border)'

export default function CrearEventoPage() {
  const router = useRouter()
  const [providers] = useState<Provider[]>(() => getProviders())
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [setupStartDate, setSetupStartDate] = useState('')
  const [teardownEndDate, setTeardownEndDate] = useState('')
  const [venueId, setVenueId] = useState('')
  const [timeRange, setTimeRange] = useState('')
  const [description, setDescription] = useState('')
  const [protocolNotes, setProtocolNotes] = useState('')
  const [providerIds, setProviderIds] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [sending, setSending] = useState(false)

  useDocumentTitle('Crear Evento - VALID')

  const venuesByCity = {
    CABA: VENUES.filter((v) => v.city === 'CABA'),
    Córdoba: VENUES.filter((v) => v.city === 'Córdoba'),
  }

  const toggleProvider = (id: string) =>
    setProviderIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )

  const handleSubmit = (e: React.FormEvent) => (
    e.preventDefault(),
    setSending(true),
    setTimeout(
      () =>
        (addEvent({
          date,
          description,
          name,
          setupStartDate: setupStartDate || undefined,
          teardownEndDate: teardownEndDate || undefined,
          protocolNotes: protocolNotes || undefined,
          providerIds,
          statusAdmin: 'ARMADO',
          timeRange,
          venueId,
        }),
        setSending(false),
        setShowSuccess(true)),
      1800
    )
  )

  const handleGoDashboard = () => router.push('/admin')

  if (showSuccess) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.2)' }}
      >
        <div
          className="w-full max-w-md rounded-[24px] bg-(--surface) px-10 py-12 text-center shadow-(--shadow-lg)"
        >
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white"
            style={{ background: 'linear-gradient(135deg, var(--success) 0%, #10b981 100%)' }}
          >
            ✓
          </div>
          <h2 className="text-xl font-bold text-(--text)">
            ¡Evento Creado!
          </h2>
          <p className="mt-3 text-sm text-(--text-secondary)">
            El evento se creó exitosamente en VALID y se envió la invitación con el protocolo a los proveedores seleccionados.
          </p>
          <button
            className="mt-6 rounded-(--radius) bg-(--text) px-5 py-2.5 font-medium text-white transition-colors hover:opacity-90"
            onClick={handleGoDashboard}
            type="button"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <Link
        className="mb-6 inline-block text-[12px] font-medium text-accent transition-opacity hover:opacity-70"
        href="/admin"
      >
        ← Volver
      </Link>

      <div className="mb-8">
        <h1 className="text-xl font-semibold text-(--text)">
          Crear Nuevo Evento
        </h1>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Completa la información del evento y asigna proveedores
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Card 1 – Información Básica */}
        <div className={formCardClass}>
          <h2 className="mb-4 text-base font-semibold text-(--text)">
            Información Básica
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-(--text)" htmlFor="name">
                Nombre del Evento
              </label>
              <input
                className="w-full rounded-(--radius) border border-(--border) bg-white px-3 py-2 text-(--text)"
                id="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Lollapalooza Argentina 2025"
                required
                value={name}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-(--text)" htmlFor="date">
                Fecha del Evento
              </label>
              <input
                className="w-full rounded-(--radius) border border-(--border) bg-white px-3 py-2"
                id="date"
                onChange={(e) => setDate(e.target.value)}
                required
                type="date"
                value={date}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-(--text)" htmlFor="setupStartDate">
                Fecha de Inicio de Previa
              </label>
              <input
                className="w-full rounded-(--radius) border border-(--border) bg-white px-3 py-2"
                id="setupStartDate"
                onChange={(e) => setSetupStartDate(e.target.value)}
                type="date"
                value={setupStartDate}
              />
              <p className="mt-0.5 text-xs text-(--text-secondary)">
                Inicio del pre-evento (armado / montaje)
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-(--text)" htmlFor="teardownEndDate">
                Fecha de Culminación de Desarme
              </label>
              <input
                className="w-full rounded-(--radius) border border-(--border) bg-white px-3 py-2"
                id="teardownEndDate"
                onChange={(e) => setTeardownEndDate(e.target.value)}
                type="date"
                value={teardownEndDate}
              />
              <p className="mt-0.5 text-xs text-(--text-secondary)">
                Fin del post-evento (desarme)
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-(--text)" htmlFor="venue">
                Lugar
              </label>
              <select
                className="w-full rounded-(--radius) border border-(--border) bg-white px-3 py-2 text-(--text)"
                id="venue"
                onChange={(e) => setVenueId(e.target.value)}
                required
                value={venueId}
              >
                <option value="">Seleccionar venue...</option>
                <optgroup label="CABA">
                  {venuesByCity.CABA.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Córdoba">
                  {venuesByCity.Córdoba.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-(--text)" htmlFor="time">
                Horario
              </label>
              <input
                className="w-full rounded-(--radius) border border-(--border) bg-white px-3 py-2 text-(--text)"
                id="time"
                onChange={(e) => setTimeRange(e.target.value)}
                placeholder="Ej: 12:00 - 23:00"
                value={timeRange}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-(--text)" htmlFor="desc">
                Descripción
              </label>
              <textarea
                className="w-full rounded-(--radius) border border-(--border) bg-white px-3 py-2 text-(--text)"
                id="desc"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el evento..."
                rows={3}
                value={description}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-(--text)">
                Flyer del Evento (Imagen)
              </label>
              <p className="text-xs text-(--text-secondary)">
                La imagen se mostrará en el dashboard principal del evento
              </p>
              <button
                className="mt-2 text-sm font-medium text-accent"
                type="button"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>

        {/* Card 2 – Protocolo de Seguridad */}
        <div className={formCardClass}>
          <h2 className="mb-4 text-base font-semibold text-(--text)">
            Protocolo de Seguridad
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-(--text)">
                Subir Protocolo (PDF)
              </label>
              <p className="text-xs text-(--text-secondary)">
                El protocolo será enviado a todas las empresas asignadas
              </p>
              <div className="mt-2 rounded-lg border px-3 py-2 text-sm" style={{ background: '#f0f9ff', borderColor: '#bfdbfe' }}>
                <span className="text-(--text-secondary)">Sin archivo. </span>
                <button className="font-medium text-accent" type="button">×</button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-(--text)" htmlFor="notes">
                Notas del Protocolo (Opcional)
              </label>
              <input
                className="w-full rounded-(--radius) border border-(--border) bg-white px-3 py-2 text-(--text)"
                id="notes"
                onChange={(e) => setProtocolNotes(e.target.value)}
                placeholder="Requisitos especiales o consideraciones adicionales..."
                value={protocolNotes}
              />
            </div>
          </div>
        </div>

        {/* Card 3 – Asignar Proveedores */}
        <div className={formCardClass}>
          <h2 className="mb-4 text-base font-semibold text-(--text)">
            Asignar Proveedores
          </h2>
          <p className="mb-4 text-sm text-(--text-secondary)">
            Selecciona las empresas que participarán en este evento
          </p>
          <ul className="space-y-2">
            {providers.map((p) => (
              <li key={p.id}>
                <label
                  className="flex cursor-pointer items-center gap-3 rounded-(--radius) border px-4 py-3 transition-colors"
                  style={{
                    background: providerIds.includes(p.id) ? '#e3f2ff' : 'transparent',
                    borderColor: providerIds.includes(p.id) ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  <input
                    checked={providerIds.includes(p.id)}
                    onChange={() => toggleProvider(p.id)}
                    type="checkbox"
                  />
                  <span className="text-sm font-medium text-(--text)">
                    {p.razonSocial}
                  </span>
                  <span className="text-xs font-mono text-(--text-secondary)">
                    CUIT: {p.cuit} • {PROVIDER_CATEGORIES.find((c) => c.id === p.categoryId)?.name ?? p.categoryId}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-(--text-secondary)">
          Al hacer click en el botón se crea el evento en VALID y se envía la invitación con el protocolo al perfil del Proveedor.
        </p>

        <div className="flex gap-3">
          <button
            className="rounded-(--radius) bg-accent px-4 py-2 font-medium text-white disabled:opacity-70"
            disabled={sending}
            type="submit"
          >
            {sending ? 'Creando evento y enviando invitaciones...' : 'Confirmar & Enviar'}
          </button>
          <Link
            className="rounded-(--radius) border border-(--border) px-4 py-2 font-medium text-(--text)"
            href="/admin"
          >
            Cancelar
          </Link>
        </div>
      </form>

      {/* Modal loading */}
      {sending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.9)' }}
        >
          <div className="w-full max-w-sm rounded-[24px] border border-(--border) bg-white p-8 shadow-lg">
            <p className="text-center text-sm font-medium text-(--text)">
              Creando evento y enviando invitaciones...
            </p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-(--border)">
              <div
                className="h-full w-[60%] animate-pulse rounded-full bg-accent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
