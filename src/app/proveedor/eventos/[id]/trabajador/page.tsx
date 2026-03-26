'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { WORKER_ROLES } from '@/lib/constants'
import { getEvents } from '@/lib/events-store'

const PROVEEDOR_ID = 'p1'

type FileKey = 'dniFrente' | 'dniDorso' | 'art'

const FILE_KEYS: FileKey[] = ['dniFrente', 'dniDorso', 'art']

const UPLOAD_LABELS: Record<FileKey, { hint: string; icon: string; title: string }> = {
  art: { hint: 'JPG, PNG • Max 5MB', icon: '🏥', title: 'Subir carnet ART vigente' },
  dniDorso: { hint: 'JPG, PNG • Max 5MB', icon: '📇', title: 'Subir foto DNI dorso' },
  dniFrente: { hint: 'JPG, PNG • Max 5MB', icon: '📇', title: 'Subir foto DNI frente' },
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 Bytes'
  }
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
}

export default function CargarTrabajadorPage() {
  const params = useParams()
  const id = params.id as string
  const event = useMemo(
    () =>
      getEvents().find(e => e.id === id && e.providerIds.includes(PROVEEDOR_ID)) ?? null,
    [id]
  )
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [dni, setDni] = useState('')
  const [cuil, setCuil] = useState('')
  const [rol, setRol] = useState('')
  const [files, setFiles] = useState<Record<FileKey, File | null>>({
    art: null,
    dniDorso: null,
    dniFrente: null,
  })
  const inputRefs = useRef<Record<FileKey, HTMLInputElement | null>>({
    art: null,
    dniDorso: null,
    dniFrente: null,
  })

  const progress = Math.round(
    (FILE_KEYS.filter(k => files[k] != null).length / FILE_KEYS.length) * 100
  )

  const handleFileChange = useCallback(function onFileChange(
    key: FileKey,
    file: File | undefined
  ) {
    if (!file) {
      return
    }
    setFiles(prev => ({ ...prev, [key]: file }))
    const input = inputRefs.current[key]
    if (input) {
      input.value = ''
    }
  }, [])

  const removeFile = useCallback(function onRemoveFile(key: FileKey) {
    setFiles(prev => ({ ...prev, [key]: null }))
    const input = inputRefs.current[key]
    if (input) {
      input.value = ''
    }
  }, [])

  const handleSubmit = useCallback(
    function onSubmit(e: React.FormEvent) {
      e.preventDefault()
      if (!files.dniFrente || !files.dniDorso || !files.art) {
        return
      }
      // Demo: sin backend; limpiar y simular éxito
      setNombreCompleto('')
      setDni('')
      setCuil('')
      setRol('')
      setFiles({ art: null, dniDorso: null, dniFrente: null })
      window.location.href = `/proveedor/eventos/${id}`
    },
    [files.dniFrente, files.dniDorso, files.art, id]
  )

  if (!event) {
    return (
      <div className="dashboard-container">
        <div className="worker-form-header">
          <Link
            aria-label="Volver al evento"
            className="back-button"
            href={`/proveedor/eventos/${id}`}
          >
            ←
          </Link>
        </div>
        <p className="mt-4 text-(--muted)">Evento no encontrado.</p>
      </div>
    )
  }

  const subtitle = `${event.name} • ${event.dateDisplay ?? event.date}`

  function renderFileKey(key: FileKey) {
    const file = files[key]
    const { hint, icon, title } = UPLOAD_LABELS[key]
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
          onKeyDown={e => e.key === 'Enter' && inputRefs.current[key]?.click()}
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
          onChange={e => handleFileChange(key, e.target.files?.[0])}
          ref={el => void (inputRefs.current[key] = el)}
          style={{ display: 'none' }}
          type="file"
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
            className="text-rejected hover:bg-rejected bg-rejected-soft-bg flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-base transition hover:text-white"
            onClick={() => removeFile(key)}
            type="button"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container mx-auto max-w-[480px]">
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
        <div className="worker-form-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="worker-form-container">
          <div className="worker-form-section-title">Datos Personales</div>
          <div className="worker-form-group">
            <label className="worker-form-label" htmlFor="nombre">
              Nombre Completo
            </label>
            <input
              className="worker-form-input"
              id="nombre"
              onChange={e => setNombreCompleto(e.target.value)}
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
              className="worker-form-input"
              id="dni"
              onChange={e => setDni(e.target.value)}
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
              className="worker-form-input"
              id="cuil"
              onChange={e => setCuil(e.target.value)}
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
              className="worker-form-select"
              id="rol"
              onChange={e => setRol(e.target.value)}
              required
              value={rol}
            >
              <option value="">Seleccioná el rol</option>
              {WORKER_ROLES.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="worker-form-container">
          <div className="worker-form-section-title">Documentación</div>
          <div className="worker-upload-grid">{FILE_KEYS.map(renderFileKey)}</div>
        </div>

        <div className="worker-form-container">
          <div className="worker-button-group">
            <Button
              className="w-full py-4 text-base font-bold"
              type="submit"
              variant="gradient"
            >
              Enviar a Validación
            </Button>
            <Button
              asChild
              className="w-full justify-center py-4 text-base font-bold"
              variant="ghost"
            >
              <Link href={`/proveedor/eventos/${id}`}>Cancelar</Link>
            </Button>
          </div>
        </div>
      </form>

      <div className="footer p-4 text-center">
        <div className="footer-text text-[11px] text-(--muted)">MANOBOT RH</div>
      </div>
    </div>
  )
}
