'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { PROVIDER_CATEGORIES } from '@/lib/constants'
import { addProvider, getProviders } from '@/lib/providers-store'
import type { Provider } from '@/types'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
]

function getInitials(razonSocial: string): string {
  const first = razonSocial.trim().charAt(0)
  return first ? first.toUpperCase() : '?'
}

export default function ProveedoresPage() {
  const [list, setList] = useState<Provider[]>([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [generatedCreds, setGeneratedCreds] = useState<{ email: string; password: string } | null>(null)
  const [form, setForm] = useState({
    categoryId: '',
    contactName: '',
    contactRole: '',
    cuit: '',
    email: '',
    phone: '',
    razonSocial: '',
  })

  useEffect(() => {
    const t = setTimeout(() => setList(getProviders()), 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    document.title = 'Proveedores - CREW'
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return list
    const q = search.trim().toLowerCase()
    return list.filter(
      (p) =>
        p.razonSocial.toLowerCase().includes(q) ||
        p.cuit.replace(/-/g, '').includes(q.replace(/-/g, '')) ||
        (PROVIDER_CATEGORIES.find((c) => c.id === p.categoryId)?.name ?? '').toLowerCase().includes(q)
    )
  }, [list, search])

  const openModal = () => {
    setShowModal(true)
    setGeneratedCreds(null)
    setForm({
      categoryId: '',
      contactName: '',
      contactRole: '',
      cuit: '',
      email: '',
      phone: '',
      razonSocial: '',
    })
  }

  const handleGenerateCreds = () => {
    const email = form.email || `proveedor${Date.now()}@empresa.com`
    const password = `generada${Math.random().toString(36).slice(2, 8)}`
    setGeneratedCreds({ email, password })
  }

  const handleSave = () => {
    if (!form.razonSocial || !form.cuit || !form.categoryId || !form.email) return
    addProvider({
      categoryId: form.categoryId,
      contactName: form.contactName,
      contactRole: form.contactRole,
      cuit: form.cuit,
      email: form.email,
      phone: form.phone,
      razonSocial: form.razonSocial,
    })
    setList(getProviders())
    setShowModal(false)
  }

  return (
    <div className="mx-auto max-w-[1000px]">
      <Link
        className="mb-6 inline-block text-[12px] font-medium transition-opacity hover:opacity-70"
        href="/admin"
        style={{ color: 'var(--accent)' }}
      >
        ← Volver
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
          Proveedores
        </h1>
        <button
          className="rounded-[var(--radius)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          onClick={openModal}
          style={{ background: 'var(--accent)' }}
          type="button"
        >
          + Agregar Proveedor
        </button>
      </div>

      <div
        className="mb-6 rounded-[var(--radius)] border px-4 py-3 shadow-[var(--shadow)]"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <input
          className="w-full bg-transparent text-sm outline-none"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Buscar por nombre, CUIT o categoría..."
          style={{ color: 'var(--text)' }}
          value={search}
        />
      </div>

      <div
        className="rounded-[var(--radius)] border shadow-[var(--shadow)] overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {filtered.map((p, i) => (
            <li
              className="flex items-center gap-4 px-4 py-4"
              key={p.id}
            >
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
                style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}
              >
                {getInitials(p.razonSocial)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  {p.razonSocial}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  CUIT: <span className="font-mono">{p.cuit}</span> • {p.email}
                </p>
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {PROVIDER_CATEGORIES.find((c) => c.id === p.categoryId)?.name ?? p.categoryId}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setShowModal(false)}
          role="dialog"
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                Agregar Proveedor
              </h2>
              <button
                className="text-2xl leading-none transition-opacity hover:opacity-70"
                onClick={() => setShowModal(false)}
                style={{ color: 'var(--text-secondary)' }}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Razón Social</label>
                <input
                  className="mt-1 w-full rounded-[var(--radius)] border border-[var(--border)] px-3 py-2"
                  onChange={(e) => setForm((f) => ({ ...f, razonSocial: e.target.value }))}
                  placeholder="Ej: SULLAIR ARGENTINA SA"
                  value={form.razonSocial}
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>CUIT</label>
                <input
                  className="mt-1 w-full rounded-[var(--radius)] border border-[var(--border)] px-3 py-2 font-mono"
                  onChange={(e) => setForm((f) => ({ ...f, cuit: e.target.value }))}
                  placeholder="30-12345678-9"
                  value={form.cuit}
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Categoría</label>
                <select
                  className="mt-1 w-full rounded-[var(--radius)] border border-[var(--border)] px-3 py-2"
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  value={form.categoryId}
                >
                  <option value="">Seleccionar categoría</option>
                  {PROVIDER_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Email Corporativo</label>
                <input
                  className="mt-1 w-full rounded-[var(--radius)] border border-[var(--border)] px-3 py-2"
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="contacto@empresa.com"
                  type="email"
                  value={form.email}
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Teléfono</label>
                <input
                  className="mt-1 w-full rounded-[var(--radius)] border border-[var(--border)] px-3 py-2"
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+54 9 11 1234-5678"
                  type="tel"
                  value={form.phone}
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Contacto Responsable</label>
                <input
                  className="mt-1 w-full rounded-[var(--radius)] border border-[var(--border)] px-3 py-2"
                  onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                  placeholder="Nombre del responsable"
                  value={form.contactName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Función del Contacto</label>
                <input
                  className="mt-1 w-full rounded-[var(--radius)] border border-[var(--border)] px-3 py-2"
                  onChange={(e) => setForm((f) => ({ ...f, contactRole: e.target.value }))}
                  placeholder="Ej: Recursos Humanos, Dueño, Gerente de Operaciones"
                  value={form.contactRole}
                />
              </div>

              <div
                className="rounded-lg border p-3"
                style={{ background: '#f0f9ff', borderColor: '#bfdbfe' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  🔐 Credenciales de Acceso
                </p>
                <p className="mt-1 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                  Usuario: {generatedCreds?.email ?? '-'}
                </p>
                <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                  Contraseña: {generatedCreds?.password ?? '-'}
                </p>
                <button
                  className="mt-2 rounded-[var(--radius)] border border-[var(--border)] bg-white px-3 py-1.5 text-sm transition-colors hover:bg-gray-50"
                  onClick={handleGenerateCreds}
                  type="button"
                >
                  🔄 Generar Credenciales
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                className="rounded-[var(--radius)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                onClick={handleSave}
                style={{ background: 'var(--accent)' }}
                type="button"
              >
                Guardar
              </button>
              <button
                className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-2 text-sm font-medium"
                onClick={() => setShowModal(false)}
                style={{ color: 'var(--text)' }}
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
