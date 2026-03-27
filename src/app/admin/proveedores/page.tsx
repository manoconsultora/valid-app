'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useProviderCategories } from '@/hooks/useProviderCategories'
import { useProviders } from '@/hooks/useProviders'
import {
  createProvider,
  recreateProviderUser,
  resendProviderInvite,
  resetProviderPassword,
  updateProvider,
} from '@/lib/actions/providers'
import type { ProviderCategory, ProviderRowWithStatus } from '@/lib/actions/providers'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
]

const getModalTitle = (isEditing: boolean) =>
  isEditing ? 'Editar Proveedor' : 'Agregar Proveedor'

function getInitials(razonSocial: string): string {
  const first = razonSocial.trim().charAt(0)
  return first ? first.toUpperCase() : '?'
}

function rowToDisplay(p: ProviderRowWithStatus, categories: ProviderCategory[]) {
  const categoryName = categories.find(c => c.id === p.category_id)?.name ?? p.category_id
  const hasAcceptedInvite = p.last_sign_in_at != null
  return {
    categoryId: p.category_id,
    categoryName,
    contactName: p.contact_name ?? '',
    contactRole: p.contact_role ?? '',
    cuit: p.cuit,
    email: p.email,
    hasAcceptedInvite,
    id: p.id,
    phone: p.phone ?? '',
    razonSocial: p.razon_social,
  }
}

export default function ProveedoresPage() {
  const { categories } = useProviderCategories()
  const { data: list, error: listError, loading: listLoading, refresh } = useProviders()
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [resettingId, setResettingId] = useState<string | null>(null)
  const [recreatingId, setRecreatingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
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

  const displayList = useMemo(
    () => list.map(p => rowToDisplay(p, categories)),
    [list, categories]
  )

  const q = search.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      !search.trim()
        ? displayList
        : displayList.filter(
            p =>
              p.razonSocial.toLowerCase().includes(q) ||
              p.cuit.replace(/-/g, '').includes(q.replace(/-/g, '')) ||
              p.categoryName.toLowerCase().includes(q)
          ),
    [displayList, q, search]
  )

  function openModal(): void {
    setEditingId(null)
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

  function openEditModal(p: (typeof displayList)[0]): void {
    setEditingId(p.id)
    setShowModal(true)
    setSaveError(null)
    setForm({
      categoryId: p.categoryId,
      contactName: p.contactName,
      contactRole: p.contactRole,
      cuit: p.cuit,
      email: p.email,
      phone: p.phone,
      razonSocial: p.razonSocial,
    })
  }

  function extractSaveError(result: unknown): string | null {
    if (!result || typeof result !== 'object' || !('error' in result)) {
      return null
    }
    const { error: err } = result as { error: unknown }
    if (typeof err === 'string') {
      return err
    }
    return err != null ? String(err) : null
  }

  /* eslint-disable camelcase -- API/DB usa snake_case */
  const buildFormPayload = () => ({
    category_id: form.categoryId,
    contact_name: form.contactName.trim() || undefined,
    contact_role: form.contactRole.trim() || undefined,
    cuit: form.cuit.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || undefined,
    razon_social: form.razonSocial.trim(),
  })
  /* eslint-enable camelcase */

  async function handleUpdateCore(id: string): Promise<void> {
    const result = await updateProvider(id, buildFormPayload())
    if (result.error) {
      setSaveError(result.error)
      return
    }
    setShowModal(false)
    setEditingId(null)
    refresh()
  }

  async function handleCreateCore(): Promise<void> {
    const result = await createProvider(buildFormPayload())
    const errorMessage = extractSaveError(result)
    if (errorMessage) {
      setSaveError(errorMessage)
      return
    }
    if (!result || typeof result !== 'object' || !result.data?.providerId) {
      setSaveError(
        'No se recibió respuesta del servidor. Comprueba NEXT_PUBLIC_APP_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.'
      )
      return
    }
    setShowModal(false)
    refresh()
  }

  async function handleSave(): Promise<void> {
    setSaveError(null)
    setResetMessage(null)
    setSaving(true)
    try {
      if (editingId) {
        await handleUpdateCore(editingId)
      } else {
        await handleCreateCore()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado'
      setSaveError(typeof msg === 'string' ? msg : 'Error inesperado')
    } finally {
      setSaving(false)
    }
  }

  async function handleReenviarInvitacion(
    id: string,
    _email: string,
    hasAcceptedInvite: boolean
  ): Promise<void> {
    if (hasAcceptedInvite) {
      setResetMessage(null)
      setResettingId(id)
      const { error } = await resetProviderPassword(id)
      setResettingId(null)
      if (error) {
        setResetMessage(`Error al enviar enlace: ${error}`)
        return
      }
      setResetMessage(
        'Se envió el link para restablecer contraseña al email del proveedor.'
      )
      return
    }
    setResetMessage(null)
    setResettingId(id)
    const { error } = await resendProviderInvite(id)
    setResettingId(null)
    if (error) {
      setResetMessage(`Error al reenviar invitación: ${error}`)
      return
    }
    setResetMessage('Se reenvió la invitación al email del proveedor.')
    await refresh()
  }

  async function handleRecrearUsuario(id: string, _razonSocial: string): Promise<void> {
    setResetMessage(null)
    setRecreatingId(id)
    const { error } = await recreateProviderUser(id)
    setRecreatingId(null)
    if (error) {
      setResetMessage(`Error al recrear usuario: ${error}`)
      return
    }
    setResetMessage(
      'Usuario recreado. Se envió una nueva invitación al email del proveedor.'
    )
    await refresh()
  }

  return (
    <div className="mx-auto max-w-250">
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
        <Button onClick={openModal}>+ Agregar Proveedor</Button>
      </div>

      <div
        className="mb-6 rounded-(--radius) border px-4 py-3 shadow-(--shadow)"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <input
          className="w-full bg-transparent text-sm outline-none"
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar por nombre, CUIT o categoría..."
          style={{ color: 'var(--text)' }}
          value={search}
        />
      </div>

      {resetMessage && (
        <p
          className="mb-4 text-sm"
          role="status"
          style={{
            color: resetMessage.startsWith('Error') ? '#dc2626' : 'var(--accent)',
          }}
        >
          {resetMessage}
        </p>
      )}

      {listError && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {listError}
        </p>
      )}
      {listLoading && (
        <p
          className="mb-4 text-sm"
          role="status"
          style={{ color: 'var(--text-secondary)' }}
        >
          Cargando proveedores…
        </p>
      )}
      <div
        className="overflow-hidden rounded-(--radius) border shadow-(--shadow)"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {filtered.map((p, i) => (
            <li className="flex items-center gap-4 px-4 py-4" key={p.id}>
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
              <div className="flex flex-col items-end gap-2 text-right text-sm">
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {p.categoryName}
                </span>
                <span
                  className="rounded px-2 py-0.5 text-xs font-medium"
                  style={{
                    background: p.hasAcceptedInvite
                      ? 'rgba(34, 197, 94, 0.15)'
                      : 'rgba(234, 179, 8, 0.2)',
                    color: p.hasAcceptedInvite ? '#15803d' : '#a16207',
                  }}
                >
                  {p.hasAcceptedInvite ? 'Activo' : 'Invitación pendiente'}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={() => openEditModal(p)} size="sm" variant="ghost">
                    Editar
                  </Button>
                  <Tooltip content="Envía al proveedor un correo con un link para restablecer su contraseña. Útil si el proveedor olvidó su contraseña o no recibió la invitación original.">
                    <Button
                      disabled={resettingId === p.id || recreatingId === p.id}
                      onClick={() =>
                        void handleReenviarInvitacion(p.id, p.email, p.hasAcceptedInvite)
                      }
                      size="sm"
                      variant="accent-outline"
                    >
                      {resettingId === p.id
                        ? 'Enviando…'
                        : p.hasAcceptedInvite
                          ? 'Enviar link para restablecer contraseña'
                          : 'Reenviar invitación'}
                    </Button>
                  </Tooltip>
                  <Tooltip content="Borrar usuario actual y crear uno nuevo con la misma empresa (útil si el acceso está corrupto)">
                    <Button
                      disabled={resettingId === p.id || recreatingId === p.id}
                      onClick={() => void handleRecrearUsuario(p.id, p.razonSocial)}
                      size="sm"
                      variant="accent-outline"
                    >
                      {recreatingId === p.id ? 'Recreando…' : 'Regenerar acceso'}
                    </Button>
                  </Tooltip>
                </div>
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
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                {getModalTitle(!!editingId)}
              </h2>
              <Button onClick={() => setShowModal(false)} variant="icon">
                ×
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  Razón Social
                </label>
                <input
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
                  onChange={e => setForm(f => ({ ...f, razonSocial: e.target.value }))}
                  placeholder="Ej: SULLAIR ARGENTINA SA"
                  value={form.razonSocial}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  CUIT
                </label>
                <input
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2 font-mono"
                  onChange={e => setForm(f => ({ ...f, cuit: e.target.value }))}
                  placeholder="30-12345678-9"
                  value={form.cuit}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  Categoría
                </label>
                <select
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
                  onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  value={form.categoryId}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  Email Corporativo
                </label>
                <input
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="contacto@empresa.com"
                  type="email"
                  value={form.email}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  Teléfono
                </label>
                <input
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+54 9 11 1234-5678"
                  type="tel"
                  value={form.phone}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  Contacto Responsable
                </label>
                <input
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
                  onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                  placeholder="Nombre del responsable"
                  value={form.contactName}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  Función del Contacto
                </label>
                <input
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
                  onChange={e => setForm(f => ({ ...f, contactRole: e.target.value }))}
                  placeholder="Ej: Recursos Humanos, Dueño, Gerente de Operaciones"
                  value={form.contactRole}
                />
              </div>

              {!editingId && (
                <div
                  className="rounded-lg border p-3"
                  style={{ background: '#f0f9ff', borderColor: '#bfdbfe' }}
                >
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    🔐 Acceso del proveedor
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Al guardar se enviará un correo al email indicado con un link para que
                    el usuario defina su contraseña. No se envía contraseña por correo.
                  </p>
                </div>
              )}
              {saveError && (
                <p className="text-sm text-red-600" role="alert">
                  {typeof saveError === 'string' ? saveError : 'Error al guardar'}
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button disabled={saving} onClick={handleSave}>
                {saving ? 'Creando...' : 'Guardar'}
              </Button>
              <Button onClick={() => setShowModal(false)} variant="ghost">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
