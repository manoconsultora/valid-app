'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { getEvents } from '@/lib/events-store'
import { WORKER_ROLES } from '@/lib/constants'

const PROVEEDOR_ID = 'p1'

type FileKey = 'dniFrente' | 'dniDorso' | 'art'

const FILE_KEYS: FileKey[] = ['dniFrente', 'dniDorso', 'art']

const UPLOAD_LABELS: Record<FileKey, { icon: string; title: string; hint: string }> = {
  dniFrente: { icon: '📇', title: 'Subir foto DNI frente', hint: 'JPG, PNG • Max 5MB' },
  dniDorso: { icon: '📇', title: 'Subir foto DNI dorso', hint: 'JPG, PNG • Max 5MB' },
  art: { icon: '🏥', title: 'Subir carnet ART vigente', hint: 'JPG, PNG • Max 5MB' },
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
}

export default function CargarTrabajadorPage() {
  const params = useParams()
  const id = params.id as string
  const [event, setEvent] = useState<{ name: string; dateDisplay?: string; date: string } | null>(null)
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [dni, setDni] = useState('')
  const [cuil, setCuil] = useState('')
  const [rol, setRol] = useState('')
  const [files, setFiles] = useState<Record<FileKey, File | null>>({
    dniFrente: null,
    dniDorso: null,
    art: null,
  })
  const inputRefs = useRef<Record<FileKey, HTMLInputElement | null>>({
    dniFrente: null,
    dniDorso: null,
    art: null,
  })

  useEffect(() => {
    const ev = getEvents().find(
      (e) => e.id === id && e.providerIds.includes(PROVEEDOR_ID)
    )
    setEvent(ev ?? null)
  }, [id])

  const progress = Math.round(
    (FILE_KEYS.filter((k) => files[k] != null).length / FILE_KEYS.length) * 100
  )

  const handleFileChange = useCallback((key: FileKey, file: File | undefined) => {
    if (!file) return
    setFiles((prev) => ({ ...prev, [key]: file }))
    const input = inputRefs.current[key]
    if (input) input.value = ''
  }, [])

  const removeFile = useCallback((key: FileKey) => {
    setFiles((prev) => ({ ...prev, [key]: null }))
    const input = inputRefs.current[key]
    if (input) input.value = ''
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!files.dniFrente || !files.dniDorso || !files.art) {
        return
      }
      // Demo: sin backend; limpiar y simular éxito
      setNombreCompleto('')
      setDni('')
      setCuil('')
      setRol('')
      setFiles({ dniFrente: null, dniDorso: null, art: null })
      window.location.href = `/proveedor/eventos/${id}`
    },
    [files.dniFrente, files.dniDorso, files.art, id]
  )

  if (!event) {
    return (
      <div className="dashboard-container">
        <Link className="back-btn" href="/proveedor">
          ← Volver
        </Link>
        <p className="mt-4 text-(--muted)">Evento no encontrado.</p>
      </div>
    )
  }

  const subtitle = `${event.name} • ${event.dateDisplay ?? event.date}`

  return (
    <div className="dashboard-container" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="worker-form-header">
        <Link
          aria-label="Volver al evento"
          className="back-button"
          href={`/proveedor/eventos/${id}`}
        >
          ←
        </Link>
        <div className="header-title">
          <div className="worker-form-page-title">Cargar Trabajador</div>
          <div className="worker-form-page-subtitle">{subtitle}</div>
        </div>
      </div>

      <div className="worker-form-progress-text">Progreso: {progress}%</div>
      <div className="worker-form-progress-bar">
        <div
          className="worker-form-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="worker-form-container">
          <div className="worker-form-section-title">Datos Personales</div>
          <div className="worker-form-group">
            <label className="worker-form-label" htmlFor="nombre">
              Nombre Completo
            </label>
            <input
              id="nombre"
              className="worker-form-input"
              onChange={(e) => setNombreCompleto(e.target.value)}
              placeholder="Ej: Juan Pérez"
              required
              type="text"
              value={nombreCompleto}
            />
          </div>
          <div className="worker-form-group">
            <label className="worker-form-label" htmlFor="dni">
              DNI
            </label>
            <input
              id="dni"
              className="worker-form-input"
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ej: 35123456"
              required
              type="text"
              value={dni}
            />
          </div>
          <div className="worker-form-group">
            <label className="worker-form-label" htmlFor="cuil">
              CUIL
            </label>
            <input
              id="cuil"
              className="worker-form-input"
              onChange={(e) => setCuil(e.target.value)}
              placeholder="Ej: 20-35123456-7"
              required
              type="text"
              value={cuil}
            />
          </div>
          <div className="worker-form-group">
            <label className="worker-form-label" htmlFor="rol">
              Rol / Función
            </label>
            <select
              id="rol"
              className="worker-form-select"
              onChange={(e) => setRol(e.target.value)}
              required
              value={rol}
            >
              <option value="">Seleccioná el rol</option>
              {WORKER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="worker-form-container">
          <div className="worker-form-section-title">Documentación</div>
          <div className="worker-upload-grid">
            {FILE_KEYS.map((key) => {
              const file = files[key]
              const { icon, title, hint } = UPLOAD_LABELS[key]
              return (
                <div className="worker-form-group" key={key}>
                  <label className="worker-form-label">
                    {key === 'dniFrente'
                      ? 'DNI Frente'
                      : key === 'dniDorso'
                        ? 'DNI Dorso'
                        : 'Carnet ART'}
                  </label>
                  <div
                    className={`worker-upload-card ${file ? 'has-file' : ''}`}
                    onClick={() => inputRefs.current[key]?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[key]?.click()}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="worker-upload-icon">{icon}</div>
                    <div className="worker-upload-title">{title}</div>
                    <div className="worker-upload-hint">{hint}</div>
                  </div>
                  <input
                    accept="image/*"
                    className="file-input"
                    ref={(el) => void (inputRefs.current[key] = el)}
                    style={{ display: 'none' }}
                    type="file"
                    onChange={(e) => handleFileChange(key, e.target.files?.[0])}
                  />
                  <div className={`worker-file-preview ${file ? 'show' : ''}`}>
                    <div className="worker-file-icon">📄</div>
                    <div className="worker-file-info">
                      <div className="worker-file-name">{file?.name ?? ''}</div>
                      <div className="worker-file-size">
                        {file ? formatFileSize(file.size) : ''}
                      </div>
                    </div>
                    <button
                      aria-label={`Quitar ${key}`}
                      className="worker-remove-file"
                      onClick={() => removeFile(key)}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="worker-form-container">
          <div className="worker-button-group">
            <button className="worker-btn worker-btn-primary" type="submit">
              Enviar a Validación
            </button>
            <Link
              className="worker-btn worker-btn-secondary"
              href={`/proveedor/eventos/${id}`}
              style={{ textAlign: 'center', textDecoration: 'none' }}
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>

      <div className="footer" style={{ padding: 16, textAlign: 'center' }}>
        <div className="footer-text" style={{ fontSize: 11, color: 'var(--muted)' }}>
          MANOBOT RH
        </div>
      </div>
    </div>
  )
}
