'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { ValidationCard } from '@/components/ui/ValidationCard'
import { useValidacionADocs } from '@/hooks/useValidacionADocs'
import { VENUES } from '@/lib/constants'
import { VALIDACION_A_DOC_TYPES } from '@/lib/constants'
import { getEvents, updateEvent } from '@/lib/events-store'
import { getProviders } from '@/lib/providers-store'
import type { Event } from '@/types'

const PROVEEDOR_ID = 'p1'
const MAX_FILES_PER_DOC = 3

/* eslint-disable complexity -- layout + modals */
/* eslint-disable arrow-body-style -- callbacks with multiple statements */
export default function ProveedorEventoPage() {
  const params = useParams()
  const id = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [modalA, setModalA] = useState(false)
  const [modalB, setModalB] = useState(false)
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const excelInputRef = useRef<HTMLInputElement | null>(null)

  const {
    canSubmitA,
    docsA,
    docsWithFilesCount,
    fileInputRefs,
    handleDocUpload,
    progressPercentA,
    removeFileA,
    totalFilesA,
  } = useValidacionADocs()

  useEffect(
    () =>
      ((t: ReturnType<typeof setTimeout>) => () => clearTimeout(t))(
        setTimeout(
          () =>
            setEvent(
              getEvents().find(
                (e) => e.id === id && e.providerIds.includes(PROVEEDOR_ID)
              ) ?? null
            ),
          0
        )
      ),
    [id]
  )

  const provider = getProviders().find((p) => p.id === PROVEEDOR_ID)
  const venue = event ? VENUES.find((v) => v.id === event.venueId) : null
  const otherEvents = event
    ? getEvents().filter(
        (e) => e.id !== event.id && e.providerIds.includes(PROVEEDOR_ID)
      )
    : []

  const progressPercentB = excelFile ? 100 : 0
  const canSubmitB = !!excelFile

  const handleExcelUpload = useCallback((files: FileList | null) => {
    const file = files?.[0]
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setExcelFile(file)
      if (excelInputRef.current) {
        excelInputRef.current.value = ''
      }
    }
  }, [])

  const removeExcel = useCallback(() => {
    setExcelFile(null)
    if (excelInputRef.current) {
      excelInputRef.current.value = ''
    }
  }, [])

  const closeModalA = useCallback(() => setModalA(false), [])
  const closeModalB = useCallback(() => setModalB(false), [])

  const submitDocsA = useCallback(() => closeModalA(), [closeModalA])

  const submitDocsB = useCallback(() => {
    updateEvent(id, { statusProvider: 'Documentación Aprobada' })
    setEvent((e) =>
      e ? { ...e, statusProvider: 'Documentación Aprobada' } : null
    )
    setExcelFile(null)
    closeModalB()
  }, [id, closeModalB])

  if (!event) {
    return (
      <div className="dashboard-container">
        <Link
          className="back-btn"
          href="/proveedor"
        >
          ← Volver
        </Link>
        <p className="mt-4 text-(--muted)">Evento no encontrado.</p>
      </div>
    )
  }

  const statusLabel =
    event.statusProvider ?? 'Cargar Documentación'
  const isApproved = event.statusProvider === 'Documentación Aprobada'
  const timeRangeParts = event.timeRange?.split(' - ') ?? ['—', '—']

  return (
    <div className="dashboard-container">
      <div className="event-detail-header">
        <Link
          aria-label="Volver al dashboard"
          className="back-button"
          href="/proveedor"
        >
          ←
        </Link>
      </div>

      <div className="event-hero">
        <div
          className="event-banner"
          style={
            event.flyerUrl
              ? {
                  backgroundImage: `url(${event.flyerUrl})`,
                }
              : undefined
          }
        >
          <Badge
            className="event-status-overlay"
            variant={isApproved ? 'success' : 'pending'}
          >
            {statusLabel}
          </Badge>
        </div>
        <div className="event-hero-content">
          <h1 className="event-title">{event.name}</h1>
          <div className="event-info">
            <div className="info-row">
              <span>📅</span>
              <span>
                {event.dateDisplay ?? event.date}
                {venue?.city ? ` • ${venue.city}` : ''}
              </span>
            </div>
            <div className="info-row">
              <span>📍</span>
              <span>
                {venue?.name ?? event.venueId}
                {venue?.city ? ` • ${venue.city}` : ''}
              </span>
            </div>
            <div className="info-row">
              <span>🕐</span>
              <span>
                Apertura: {timeRangeParts[0]}hs • Show: {timeRangeParts[1]}hs
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="validation-section">
        <div className="section-header">
          <div className="section-title">Estado de Validación</div>
          <Badge variant="accent">2 Validaciones</Badge>
        </div>

        <ValidationCard
          description={
            <>
              Validación de documentación de seguros de{' '}
              {provider?.razonSocial ?? 'tu empresa'} contra el protocolo del
              evento
            </>
          }
          details={[
            { label: 'Documentos Subidos', value: `${docsWithFilesCount} / 7` },
            { label: 'Protocolo', value: 'Disponible' },
          ]}
          icon="📄"
          name="Documentos Corporativos"
          onClick={() => setModalA(true)}
          type="Validación A"
        />

        <ValidationCard
          description="Validación de empleados del evento contra documentos corporativos de Validación A"
          details={[
            {
              label: 'Documentos Subidos',
              value: `${excelFile ? '1' : '0'} / 1`,
            },
            { label: 'Validación contra', value: '7 docs corporativos' },
          ]}
          icon="👥"
          name="Empleados del Evento"
          onClick={() => setModalB(true)}
          type="Validación B"
        />
      </div>

      {otherEvents.length > 0 && (
        <div className="other-events">
          <div className="carousel-title">Otros Eventos Activos</div>
          <div className="carousel">
            {otherEvents.map((e) => (
              <Link
                className="carousel-item"
                href={`/proveedor/eventos/${e.id}`}
                key={e.id}
              >
                <div
                  className="carousel-image"
                  style={
                    e.flyerUrl ? { backgroundImage: `url(${e.flyerUrl})` } : undefined
                  }
                />
                <div className="carousel-content">
                  <div className="carousel-event-name">{e.name}</div>
                  <div className="carousel-event-date">
                    {e.dateDisplay ?? e.date}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="debug-buttons">
        <Link
          className="debug-btn debug-btn-success"
          href={`/proveedor/eventos/${id}/validacion`}
        >
          ✓ Ver Estado de Validación
        </Link>
        <Link
          className="debug-btn debug-btn-error"
          href={`/proveedor/eventos/${id}/validacion`}
        >
          Ver resultados
        </Link>
      </div>

      {/* Modal A: Documentos Corporativos */}
      {modalA && (
        <div
          aria-labelledby="modal-a-title"
          aria-modal="true"
          className="modal-overlay"
          onClick={closeModalA}
          role="dialog"
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title" id="modal-a-title">
                📄 Documentos Corporativos
              </div>
              <button
                aria-label="Cerrar"
                className="modal-close"
                onClick={closeModalA}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="modal-section-title">
                  Protocolo del Evento
                </div>
                <div className="modal-section-desc">
                  Revisá los requisitos antes de subir documentación
                </div>
                <div className="protocol-box">
                  <div className="protocol-icon">📋</div>
                  <div className="protocol-info">
                    <div className="protocol-name">
                      Protocolo_LVP_2024.pdf
                    </div>
                    <div className="protocol-size">2.4 MB</div>
                  </div>
                  <button
                    className="btn-download"
                    onClick={() => undefined}
                    type="button"
                  >
                    📥 Descargar
                  </button>
                </div>
              </div>

              <div className="progress-indicator">
                <span className="progress-text">
                  {totalFilesA} archivo(s) en {docsWithFilesCount} documento(s)
                </span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercentA}%` }}
                  />
                </div>
              </div>

              {VALIDACION_A_DOC_TYPES.map((doc, index) => {
                const num = index + 1
                const files = docsA[num] ?? []
                return (
                  <div className="doc-input-item" key={doc.id}>
                    <div className="doc-input-header">
                      <span className="doc-input-label">
                        {num}. {doc.name}
                      </span>
                      <span className="doc-input-optional">OPCIONAL</span>
                    </div>
                    <div className="doc-input-upload">
                      <input
                        accept=".pdf"
                        multiple
                        onChange={(e) => handleDocUpload(num, e.target.files)}
                        ref={(el) => void (fileInputRefs.current[num] = el)}
                        style={{ display: 'none' }}
                        type="file"
                      />
                      <button
                        className="doc-input-button"
                        onClick={() => fileInputRefs.current[num]?.click()}
                        type="button"
                      >
                        📎 Seleccionar PDF(s) - Máx. {MAX_FILES_PER_DOC}
                      </button>
                      <div className="doc-input-filelist">
                        {files.map((file, i) => (
                          <div className="doc-file-item" key={i}>
                            <span
                              className="doc-file-name"
                              title={file.name}
                            >
                              {file.name}
                            </span>
                            <button
                              aria-label={`Quitar ${file.name}`}
                              className="doc-file-remove"
                              onClick={() => removeFileA(num, i)}
                              type="button"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-cancel"
                onClick={closeModalA}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                disabled={!canSubmitA}
                onClick={submitDocsA}
                type="button"
              >
                Enviar Documentos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal B: Empleados */}
      {modalB && (
        <div
          aria-labelledby="modal-b-title"
          aria-modal="true"
          className="modal-overlay"
          onClick={closeModalB}
          role="dialog"
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title" id="modal-b-title">
                👥 Empleados del Evento
              </div>
              <button
                aria-label="Cerrar"
                className="modal-close"
                onClick={closeModalB}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="modal-section-desc">
                  Subí el Excel con los empleados que trabajarán en este evento.
                  CREW validará automáticamente contra todos los documentos
                  corporativos cargados en la Validación A (ART, AP, CAT, SVO,
                  CNR, Nómina Vigente, F931).
                </div>
              </div>

              <div className="progress-indicator">
                <span className="progress-text">
                  {excelFile ? '1' : '0'}/1 documento
                </span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercentB}%` }}
                  />
                </div>
              </div>

              <div className="doc-input-item">
                <div className="doc-input-header">
                  <span className="doc-input-label">
                    Excel Empleados del Evento
                  </span>
                  <span className="doc-input-required">REQUERIDO</span>
                </div>
                <div className="modal-section-desc">
                  Formato: Nombre, Apellido, DNI, CUIL • Solo empleados de este
                  evento específico
                </div>
                <div className="doc-input-upload">
                  <input
                    accept=".xlsx,.xls"
                    onChange={(e) => handleExcelUpload(e.target.files)}
                    ref={excelInputRef}
                    style={{ display: 'none' }}
                    type="file"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="doc-input-button"
                      onClick={() => excelInputRef.current?.click()}
                      type="button"
                    >
                      📊 Seleccionar Excel
                    </button>
                    <span
                      className={`doc-input-filename ${excelFile ? 'uploaded' : ''}`}
                    >
                      {excelFile?.name ?? 'Sin archivo'}
                    </span>
                    {excelFile && (
                      <button
                        aria-label="Quitar archivo"
                        className="doc-input-remove"
                        onClick={removeExcel}
                        type="button"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-cancel"
                onClick={closeModalB}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                disabled={!canSubmitB}
                onClick={submitDocsB}
                type="button"
              >
                Enviar Documentos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
