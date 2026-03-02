'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'


import { VENUES } from '@/lib/constants'
import { VALIDACION_A_DOC_TYPES, WORKER_ROLES } from '@/lib/constants'
import { getEvents, updateEvent } from '@/lib/events-store'
import type { Event } from '@/types'

const PROVEEDOR_ID = 'p1'

export default function ProveedorEventoPage() {
  const params = useParams()
  const id = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [modalA, setModalA] = useState(false)
  const [modalB, setModalB] = useState(false)
  const [modalWorker, setModalWorker] = useState(false)
  const [workerRole, setWorkerRole] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      const ev = getEvents().find((e) => e.id === id && e.providerIds.includes(PROVEEDOR_ID))
      setEvent(ev ?? null)
    }, 0)
    return () => clearTimeout(t)
  }, [id])

  if (!event) {
    return (
      <div>
        <Link className="text-accent hover:underline" href="/proveedor">
          ← Volver
        </Link>
        <p className="mt-4 text-(--muted)">Evento no encontrado.</p>
      </div>
    )
  }

  const venue = VENUES.find((v) => v.id === event.venueId)
  const isApproved = event.statusProvider === 'Documentación Aprobada'
  const isRejected = event.statusProvider === 'Documentación Rechazada'

  const handleSubmitValidacionA = () => {
    setModalA(false)
    // Demo: no cambia estado hasta que "admin apruebe"; opcionalmente mostrar "Enviado"
  }

  const handleSubmitValidacionB = () => {
    setModalB(false)
    updateEvent(id, { statusProvider: 'Documentación Aprobada' })
    setEvent((e) => (e ? { ...e, statusProvider: 'Documentación Aprobada' } : null))
  }

  const handleSubmitWorker = () => {
    setModalWorker(false)
    setWorkerRole('')
  }

  return (
    <div>
      <Link className="mb-4 inline-block text-sm text-accent hover:underline" href="/proveedor">
        ← Volver
      </Link>
      <h1 className="text-xl font-semibold text-(--text)">{event.name}</h1>
      <p className="mt-2 text-(--muted)">
        {event.date} · {venue?.name} · {event.timeRange}
      </p>
      <p className="mt-2 text-sm text-(--text)">{event.description}</p>

      <span
        className="mt-4 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
        style={{
          background: isApproved
            ? 'var(--approved)'
            : isRejected
              ? 'var(--rejected)'
              : 'var(--pending)',
        }}
      >
        {event.statusProvider ?? 'Cargar Documentación'}
      </span>

      {isRejected && event.rejectionReason && (
        <div className="mt-4 rounded-(--radius) border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <strong>Motivo del rechazo:</strong> {event.rejectionReason}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          className="rounded-(--radius) bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          onClick={() => setModalA(true)}
          type="button"
        >
          Validación A (documentación corporativa)
        </button>
        <button
          className="rounded-(--radius) border border-(--stroke) px-4 py-2 text-sm font-medium text-(--text) hover:bg-white/80"
          onClick={() => setModalB(true)}
          type="button"
        >
          Validación B (nómina empleados)
        </button>
        <button
          className="rounded-(--radius) border border-(--stroke) px-4 py-2 text-sm font-medium text-(--text) hover:bg-white/80"
          onClick={() => setModalWorker(true)}
          type="button"
        >
          Cargar trabajador
        </button>
      </div>

      {/* Modal Validación A */}
      {modalA && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setModalA(false)}
          role="dialog"
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-(--stroke) bg-white p-6 shadow-(--shadow-soft)"
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--surface-2)' }}
          >
            <h2 className="text-lg font-semibold text-(--text)">
              Validación A – Documentación corporativa
            </h2>
            <p className="mt-2 text-sm text-(--muted)">
              Subí hasta 3 PDFs por tipo. Fase 1: sin subida real.
            </p>
            <div className="mt-4 space-y-4">
              {VALIDACION_A_DOC_TYPES.map((doc) => (
                <div key={doc.id}>
                  <label className="block text-sm font-medium text-(--text)">
                    {doc.name}
                  </label>
                  <input
                    accept=".pdf"
                    className="mt-1 text-sm text-(--muted)"
                    multiple
                    type="file"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                className="rounded-(--radius) bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                onClick={handleSubmitValidacionA}
                type="button"
              >
                Enviar Documentos
              </button>
              <button
                className="rounded-(--radius) border border-(--stroke) px-4 py-2 text-sm"
                onClick={() => setModalA(false)}
                type="button"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Validación B */}
      {modalB && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setModalB(false)}
          role="dialog"
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-(--stroke) bg-white p-6 shadow-(--shadow-soft)"
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--surface-2)' }}
          >
            <h2 className="text-lg font-semibold text-(--text)">
              Validación B – Nómina de empleados
            </h2>
            <p className="mt-2 text-sm text-(--muted)">
              Subí el Excel con los empleados que trabajarán en este evento. CREW
              validará automáticamente contra todos los documentos corporativos
              cargados en la Validación A.
            </p>
            <p className="mt-2 font-mono text-xs text-(--muted)">
              Formato: Nombre, Apellido, DNI, CUIL · Solo empleados de este evento
              específico.
            </p>
            <div className="mt-4">
              <input
                accept=".xlsx,.xls"
                className="text-sm text-(--muted)"
                type="file"
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                className="rounded-(--radius) bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                onClick={handleSubmitValidacionB}
                type="button"
              >
                Enviar Documentos
              </button>
              <button
                className="rounded-(--radius) border border-(--stroke) px-4 py-2 text-sm"
                onClick={() => setModalB(false)}
                type="button"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cargar trabajador */}
      {modalWorker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setModalWorker(false)}
          role="dialog"
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-(--stroke) bg-white p-6 shadow-(--shadow-soft)"
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--surface-2)' }}
          >
            <h2 className="text-lg font-semibold text-(--text)">
              Cargar trabajador
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-(--text)">
                  Rol
                </label>
                <select
                  className="mt-1 w-full rounded-(--radius) border border-(--stroke) px-3 py-2"
                  onChange={(e) => setWorkerRole(e.target.value)}
                  value={workerRole}
                >
                  <option value="">Seleccionar</option>
                  {WORKER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-(--text)">
                  DNI Frente
                </label>
                <input
                  accept="image/*"
                  className="mt-1 text-sm text-(--muted)"
                  type="file"
                />
                <p className="text-xs text-(--muted)">JPG, PNG · Max 5MB</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-(--text)">
                  DNI Dorso
                </label>
                <input
                  accept="image/*"
                  className="mt-1 text-sm text-(--muted)"
                  type="file"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--text)">
                  Carnet ART
                </label>
                <input
                  accept="image/*"
                  className="mt-1 text-sm text-(--muted)"
                  type="file"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                className="rounded-(--radius) bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                onClick={handleSubmitWorker}
                type="button"
              >
                Enviar a Validación
              </button>
              <button
                className="rounded-(--radius) border border-(--stroke) px-4 py-2 text-sm"
                onClick={() => setModalWorker(false)}
                type="button"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
