'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  createProveedor,
  getProviderCategories,
  listProveedores,
  type ProviderCategory,
  type ProviderRow,
} from '@/lib/actions/proveedores'

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

function rowToDisplay(p: ProviderRow, categories: ProviderCategory[]) {
  const categoryName = categories.find((c) => c.id === p.category_id)?.name ?? p.category_id
  return {
    categoryId: p.category_id,
    categoryName,
    contactName: p.contact_name ?? '',
    contactRole: p.contact_role ?? '',
    cuit: p.cuit,
    email: p.email,
    id: p.id,
    phone: p.phone ?? '',
    razonSocial: p.razon_social,
  }
}

export default function ProveedoresPage() {
  const [list, setList] = useState<ProviderRow[]>([])
  const [categories, setCategories] = useState<ProviderCategory[]>([])
  const [listError, setListError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [form, setForm] = useState({
    categoryId: '',
    contactName: '',
    contactRole: '',
    cuit: '',
    email: '',
    phone: '',
    razonSocial: '',
  })

  useDocumentTitle('Proveedores - VALID')

  /* eslint-disable arrow-body-style -- múltiples sentencias en then/catch */
  const loadList = useCallback(() => {
    listProveedores()
      .then(({ data, error }) => (setListError(error ?? null), setList(data ?? [])))
      .catch(() => setListError('Error al cargar proveedores'))
  }, [])
  /* eslint-enable arrow-body-style */

  /* eslint-disable arrow-body-style -- múltiples sentencias */
  useEffect(() => {
    getProviderCategories()
      .then(({ data }) => data && setCategories(data))
      .catch(() => undefined)
  }, [])
  /* eslint-enable arrow-body-style */

  useEffect(() => loadList(), [loadList])

  const displayList = useMemo(() => list.map((p) => rowToDisplay(p, categories)), [list, categories])

  const q = search.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      !search.trim()
        ? displayList
        : displayList.filter((p) =>
            p.razonSocial.toLowerCase().includes(q) ||
            p.cuit.replace(/-/g, '').includes(q.replace(/-/g, '')) ||
            p.categoryName.toLowerCase().includes(q)
          ),
    [displayList, q, search]
  )

  // eslint-disable-next-line arrow-body-style -- múltiples sentencias
  const openModal = (): void => {
    setShowModal(true)
    setSaveError(null)
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

  // eslint-disable-next-line arrow-body-style -- múltiples sentencias
  const handleSave = async (): Promise<void> => {
    setSaveError(null)
    setSaving(true)
    /* eslint-disable camelcase -- API/DB usa snake_case */
    const { error } = await createProveedor({
      category_id: form.categoryId,
      contact_name: form.contactName.trim() || undefined,
      contact_role: form.contactRole.trim() || undefined,
      cuit: form.cuit.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      razon_social: form.razonSocial.trim(),
    })
    /* eslint-enable camelcase */
    setSaving(false)
    if (error) {
      setSaveError(error)
      return
    }
    setShowModal(false)
    loadList()
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
          className="rounded-(--radius) px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          onClick={openModal}
          style={{ background: 'var(--accent)' }}
          type="button"
        >
          + Agregar Proveedor
        </button>
      </div>

      <div
        className="mb-6 rounded-(--radius) border px-4 py-3 shadow-(--shadow)"
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

      {listError && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {listError}
        </p>
      )}
      <div
        className="rounded-(--radius) border shadow-(--shadow) overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {filtered.map((p, i) => (
            <li
              className="flex items-center gap-4 px-4 py-4"
              key={p.id}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
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
                {p.categoryName}
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
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-(--border) bg-white p-6 shadow-(--shadow-lg)"
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
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
                  onChange={(e) => setForm((f) => ({ ...f, razonSocial: e.target.value }))}
                  placeholder="Ej: SULLAIR ARGENTINA SA"
                  value={form.razonSocial}
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>CUIT</label>
                <input
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2 font-mono"
                  onChange={(e) => setForm((f) => ({ ...f, cuit: e.target.value }))}
                  placeholder="30-12345678-9"
                  value={form.cuit}
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Categoría</label>
                <select
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  value={form.categoryId}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Email Corporativo</label>
                <input
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="contacto@empresa.com"
                  type="email"
                  value={form.email}
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Teléfono</label>
                <input
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+54 9 11 1234-5678"
                  type="tel"
                  value={form.phone}
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Contacto Responsable</label>
                <input
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
                  onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                  placeholder="Nombre del responsable"
                  value={form.contactName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Función del Contacto</label>
                <input
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
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
                  🔐 Acceso del proveedor
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Al guardar se enviará un correo al email indicado con un link para que el usuario defina su contraseña. No se envía contraseña por correo.
                </p>
              </div>
              {saveError && (
                <p className="text-sm text-red-600" role="alert">
                  {saveError}
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                className="rounded-(--radius) px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-70"
                disabled={saving}
                onClick={handleSave}
                style={{ background: 'var(--accent)' }}
                type="button"
              >
                {saving ? 'Creando...' : 'Guardar'}
              </button>
              <button
                className="rounded-(--radius) border border-(--border) px-4 py-2 text-sm font-medium"
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
