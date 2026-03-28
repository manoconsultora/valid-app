'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useCompanies } from '@/hooks/useCompanies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useEmployees } from '@/hooks/useEmployees'
import { useProviderCategories } from '@/hooks/useProviderCategories'
import { createCompany } from '@/lib/actions/companies'
import type { CompanyRow } from '@/lib/actions/companies'
import {
  createEmployee,
  recreateEmployeeUser,
  resendEmployeeInvite,
  resetEmployeePassword,
} from '@/lib/actions/employees'
import type { EmployeeRowWithStatus } from '@/lib/actions/employees'
import type { ProviderCategory } from '@/lib/actions/providers'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
]

const EMPTY_EMPLOYEE_FORM = {
  companyId: '',
  cuil: '',
  email: '',
  hasDashboardAccess: false,
  name: '',
  phone: '',
  position: '',
  status: 'Activo' as 'Activo' | 'Inactivo',
}

const EMPTY_COMPANY_FORM = {
  categoryId: '',
  contactName: '',
  contactRole: '',
  cuit: '',
  email: '',
  name: '',
  phone: '',
}

type EmployeeFormState = typeof EMPTY_EMPLOYEE_FORM
type CompanyFormState = typeof EMPTY_COMPANY_FORM

const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .map(s => s.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)

// ---------------------------------------------------------------------------
// EmployeeAuthBadge
// ---------------------------------------------------------------------------

type EmployeeAuthBadgeProps = {
  emp: EmployeeRowWithStatus
  isBusy: boolean
  onRecreate: (_emp: EmployeeRowWithStatus) => void
  onResend: (_emp: EmployeeRowWithStatus) => void
  recreatingId: string | null
  resettingId: string | null
}

function EmployeeAuthBadge({
  emp,
  isBusy,
  onRecreate,
  onResend,
  recreatingId,
  resettingId,
}: EmployeeAuthBadgeProps) {
  const hasAcceptedInvite = emp.last_sign_in_at != null
  return (
    <>
      <span
        className="rounded px-2 py-0.5 text-xs font-medium"
        style={{
          background: hasAcceptedInvite
            ? 'rgba(34, 197, 94, 0.15)'
            : 'rgba(234, 179, 8, 0.2)',
          color: hasAcceptedInvite ? '#15803d' : '#a16207',
        }}
      >
        {hasAcceptedInvite ? 'Activo' : 'Invitación pendiente'}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          disabled={isBusy}
          onClick={() => onResend(emp)}
          size="sm"
          variant="accent-outline"
        >
          {resettingId === emp.id
            ? 'Enviando…'
            : hasAcceptedInvite
              ? 'Restablecer contraseña'
              : 'Reenviar invitación'}
        </Button>
        <Button
          disabled={isBusy}
          onClick={() => onRecreate(emp)}
          size="sm"
          title="Crea un nuevo acceso desde cero para este empleado."
          variant="accent-outline"
        >
          {recreatingId === emp.id ? 'Recreando…' : 'Restablecer acceso'}
        </Button>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// EmployeeRow
// ---------------------------------------------------------------------------

type EmployeeRowProps = {
  companies: CompanyRow[]
  emp: EmployeeRowWithStatus
  index: number
  onRecreate: (_emp: EmployeeRowWithStatus) => void
  onResend: (_emp: EmployeeRowWithStatus) => void
  recreatingId: string | null
  resettingId: string | null
}

function EmployeeRow({
  companies,
  emp,
  index,
  onRecreate,
  onResend,
  recreatingId,
  resettingId,
}: EmployeeRowProps) {
  const companyName = companies.find(c => c.id === emp.company_id)?.name ?? emp.company_id
  const isBusy = resettingId === emp.id || recreatingId === emp.id

  return (
    <li className="flex items-center gap-4 px-4 py-4">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ background: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length] }}
      >
        {getInitials(emp.name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium" style={{ color: 'var(--text)' }}>
          {emp.name}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          CUIL: <span className="font-mono">{emp.cuil}</span> • {companyName} •{' '}
          {emp.position}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2 text-right text-sm">
        <Badge variant={emp.status === 'Activo' ? 'successSoft' : 'errorSoft'}>
          {emp.status}
        </Badge>
        {emp.user_id != null && (
          <EmployeeAuthBadge
            emp={emp}
            isBusy={isBusy}
            onRecreate={onRecreate}
            onResend={onResend}
            recreatingId={recreatingId}
            resettingId={resettingId}
          />
        )}
      </div>
    </li>
  )
}

// ---------------------------------------------------------------------------
// CompanyForm
// ---------------------------------------------------------------------------

type CompanyFormProps = {
  categories: ProviderCategory[]
  creating: boolean
  error: string | null
  form: CompanyFormState
  onCancel: () => void
  onChange: (_patch: Partial<CompanyFormState>) => void
  onSubmit: () => void
}

const CompanyForm = ({
  categories,
  creating,
  error,
  form,
  onCancel,
  onChange,
  onSubmit,
}: CompanyFormProps) => (
  <div className="mt-4 space-y-3">
    <div>
      <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
        Razón Social
      </label>
      <input
        className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
        onChange={e => onChange({ name: e.target.value })}
        placeholder="Ej: SULLAIR ARGENTINA SA"
        value={form.name}
      />
    </div>
    <div>
      <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
        CUIT
      </label>
      <input
        className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2 font-mono"
        onChange={e => onChange({ cuit: e.target.value })}
        placeholder="30-12345678-9"
        value={form.cuit}
      />
    </div>
    <div>
      <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
        Categoría
      </label>
      <select
        className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
        onChange={e => onChange({ categoryId: e.target.value })}
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
      <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
        Email Corporativo
      </label>
      <input
        className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
        onChange={e => onChange({ email: e.target.value })}
        placeholder="contacto@empresa.com"
        type="email"
        value={form.email}
      />
    </div>
    <div>
      <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
        Teléfono
      </label>
      <input
        className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
        onChange={e => onChange({ phone: e.target.value })}
        placeholder="+54 9 11 1234-5678"
        type="tel"
        value={form.phone}
      />
    </div>
    <div>
      <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
        Contacto Responsable
      </label>
      <input
        className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
        onChange={e => onChange({ contactName: e.target.value })}
        placeholder="Nombre del responsable"
        value={form.contactName}
      />
    </div>
    <div>
      <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
        Función del Contacto
      </label>
      <input
        className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
        onChange={e => onChange({ contactRole: e.target.value })}
        placeholder="Ej: Recursos Humanos, Dueño, Gerente de Operaciones"
        value={form.contactRole}
      />
    </div>
    {error && (
      <p className="text-sm text-red-600" role="alert">
        {error}
      </p>
    )}
    <div className="mt-6 flex gap-3">
      <Button disabled={creating} onClick={onSubmit}>
        {creating ? 'Creando…' : 'Crear empresa'}
      </Button>
      <Button onClick={onCancel} variant="ghost">
        Cancelar
      </Button>
    </div>
  </div>
)

// ---------------------------------------------------------------------------
// EmployeeForm
// ---------------------------------------------------------------------------

type EmployeeFormProps = {
  companies: CompanyRow[]
  error: string | null
  form: EmployeeFormState
  onCancel: () => void
  onChange: (_patch: Partial<EmployeeFormState>) => void
  onCompanySelect: (_value: string) => void
  onSubmit: () => void
  saving: boolean
}

const EmployeeForm = ({
  companies,
  error,
  form,
  onCancel,
  onChange,
  onCompanySelect,
  onSubmit,
  saving,
}: EmployeeFormProps) => (
  <div className="mt-4 space-y-3">
    <div>
      <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
        Nombre Completo
      </label>
      <input
        className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
        onChange={e => onChange({ name: e.target.value })}
        placeholder="Ej: Juan Pérez"
        value={form.name}
      />
    </div>
    <div>
      <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
        CUIL
      </label>
      <input
        className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2 font-mono"
        onChange={e => onChange({ cuil: e.target.value })}
        placeholder="20-12345678-9"
        value={form.cuil}
      />
    </div>
    <div>
      <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
        Empresa / Proveedor
      </label>
      <select
        className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
        onChange={e => onCompanySelect(e.target.value)}
        value={form.companyId}
      >
        <option value="">Seleccionar empresa...</option>
        {companies.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
        <option value="__new__">+ Agregar empresa...</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
        Puesto
      </label>
      <input
        className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
        onChange={e => onChange({ position: e.target.value })}
        placeholder="Ej: Coordinador de Producción"
        value={form.position}
      />
    </div>
    <div>
      <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
        Email
      </label>
      <input
        className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
        onChange={e => onChange({ email: e.target.value })}
        placeholder="empleado@empresa.com"
        type="email"
        value={form.email}
      />
    </div>
    <div>
      <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
        Teléfono
      </label>
      <input
        className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
        onChange={e => onChange({ phone: e.target.value })}
        placeholder="+54 9 11 1234-5678"
        type="tel"
        value={form.phone}
      />
    </div>
    <div>
      <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
        Estado
      </label>
      <select
        className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
        onChange={e => onChange({ status: e.target.value as 'Activo' | 'Inactivo' })}
        value={form.status}
      >
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
      </select>
    </div>
    <div className="flex items-start gap-2">
      <input
        checked={form.hasDashboardAccess}
        className="mt-0.5 h-4 w-4 cursor-pointer"
        id="hasDashboardAccess"
        onChange={e => onChange({ hasDashboardAccess: e.target.checked })}
        type="checkbox"
      />
      <label
        className="cursor-pointer text-sm"
        htmlFor="hasDashboardAccess"
        style={{ color: 'var(--text)' }}
      >
        Dar acceso al dashboard de administrador
      </label>
    </div>
    {error && (
      <p className="text-sm text-red-600" role="alert">
        {error}
      </p>
    )}
    <div className="mt-6 flex gap-3">
      <Button disabled={saving} onClick={onSubmit}>
        {saving ? 'Guardando...' : 'Guardar'}
      </Button>
      <Button onClick={onCancel} variant="ghost">
        Cancelar
      </Button>
    </div>
  </div>
)

// ---------------------------------------------------------------------------
// RRHHPage
// ---------------------------------------------------------------------------

export default function RRHHPage() {
  const { data: list, error: listError, loading, refresh } = useEmployees()
  const { data: companies, refresh: companiesRefresh } = useCompanies()
  const { categories } = useProviderCategories()

  const [companyError, setCompanyError] = useState<string | null>(null)
  const [companyForm, setCompanyForm] = useState(EMPTY_COMPANY_FORM)
  const [creatingCompany, setCreatingCompany] = useState(false)
  const [employeeForm, setEmployeeForm] = useState(EMPTY_EMPLOYEE_FORM)
  const [recreatingId, setRecreatingId] = useState<string | null>(null)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [resettingId, setResettingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useDocumentTitle('RRHH - VALID')

  const q = search.trim().toLowerCase()
  const filtered = useMemo(
    function computeFiltered() {
      if (!search.trim()) {
        return list
      }
      return list.filter(function matchesQuery(e) {
        const companyName =
          companies.find(c => c.id === e.company_id)?.name?.toLowerCase() ?? ''
        return (
          e.name.toLowerCase().includes(q) ||
          e.cuil.replace(/-/g, '').includes(q.replace(/-/g, '')) ||
          companyName.includes(q) ||
          e.position.toLowerCase().includes(q)
        )
      })
    },
    [companies, list, q, search]
  )

  function openModal(): void {
    setCompanyError(null)
    setCompanyForm(EMPTY_COMPANY_FORM)
    setEmployeeForm(EMPTY_EMPLOYEE_FORM)
    setSaveError(null)
    setShowCompanyForm(false)
    setShowModal(true)
  }

  function handleCompanySelectChange(value: string): void {
    if (value === '__new__') {
      setCompanyError(null)
      setCompanyForm(EMPTY_COMPANY_FORM)
      setEmployeeForm(f => ({ ...f, companyId: '__new__' }))
      setShowCompanyForm(true)
      return
    }
    setEmployeeForm(f => ({ ...f, companyId: value }))
    setShowCompanyForm(false)
  }

  function handleCancelCompanyForm(): void {
    setCompanyError(null)
    setCompanyForm(EMPTY_COMPANY_FORM)
    setEmployeeForm(f => ({ ...f, companyId: '' }))
    setShowCompanyForm(false)
  }

  /* eslint-disable camelcase -- DB/API uses snake_case */
  async function handleCreateCompany(): Promise<void> {
    setCompanyError(null)
    setCreatingCompany(true)
    try {
      const result = await createCompany({
        category_id: companyForm.categoryId,
        contact_name: companyForm.contactName.trim() || undefined,
        contact_role: companyForm.contactRole.trim() || undefined,
        cuit: companyForm.cuit.trim(),
        email: companyForm.email.trim(),
        name: companyForm.name.trim(),
        phone: companyForm.phone.trim() || undefined,
      })
      if (result.error) {
        setCompanyError(result.error)
        return
      }
      if (!result.data?.companyId) {
        setCompanyError('No se recibió respuesta del servidor.')
        return
      }
      companiesRefresh()
      setEmployeeForm(f => ({ ...f, companyId: result.data!.companyId }))
      setShowCompanyForm(false)
    } catch (err) {
      setCompanyError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setCreatingCompany(false)
    }
  }

  async function handleSave(): Promise<void> {
    setSaveError(null)
    setResetMessage(null)
    setSaving(true)
    try {
      const result = await createEmployee({
        company_id: employeeForm.companyId,
        cuil: employeeForm.cuil.trim(),
        email: employeeForm.email.trim(),
        has_dashboard_access: employeeForm.hasDashboardAccess,
        name: employeeForm.name.trim(),
        phone: employeeForm.phone.trim() || undefined,
        position: employeeForm.position.trim(),
        status: employeeForm.status,
      })
      /* eslint-enable camelcase */
      if (result.error) {
        setSaveError(result.error)
        return
      }
      setShowModal(false)
      refresh()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setSaving(false)
    }
  }

  async function handleResendInvite(emp: EmployeeRowWithStatus): Promise<void> {
    setResetMessage(null)
    setResettingId(emp.id)
    try {
      if (emp.last_sign_in_at != null) {
        const { error } = await resetEmployeePassword(emp.id)
        if (error) {
          setResetMessage(`Error al enviar el enlace: ${error}`)
          return
        }
        setResetMessage('Enlace para restablecer contraseña enviado.')
        return
      }
      const { error } = await resendEmployeeInvite(emp.id)
      if (error) {
        setResetMessage(`Error al reenviar invitación: ${error}`)
        return
      }
      setResetMessage('Invitación reenviada al correo del empleado.')
      refresh()
    } finally {
      setResettingId(null)
    }
  }

  async function handleRecreateUser(emp: EmployeeRowWithStatus): Promise<void> {
    setResetMessage(null)
    setRecreatingId(emp.id)
    try {
      const { error } = await recreateEmployeeUser(emp.id)
      if (error) {
        setResetMessage(`Error al recrear usuario: ${error}`)
        return
      }
      setResetMessage('Acceso recreado. Nueva invitación enviada.')
      refresh()
    } finally {
      setRecreatingId(null)
    }
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
          RRHH - Empleados Propios
        </h1>
        <Button onClick={openModal}>+ Agregar Empleado</Button>
      </div>

      <div
        className="mb-6 rounded-(--radius) border px-4 py-3 shadow-(--shadow)"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <input
          className="w-full bg-transparent text-sm outline-none"
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar por nombre, CUIL, empresa o puesto..."
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
      {loading && (
        <p
          className="mb-4 text-sm"
          role="status"
          style={{ color: 'var(--text-secondary)' }}
        >
          Cargando empleados…
        </p>
      )}

      <div
        className="overflow-hidden rounded-(--radius) border shadow-(--shadow)"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {filtered.map((emp, i) => (
            <EmployeeRow
              companies={companies}
              emp={emp}
              index={i}
              key={emp.id}
              onRecreate={e => void handleRecreateUser(e)}
              onResend={e => void handleResendInvite(e)}
              recreatingId={recreatingId}
              resettingId={resettingId}
            />
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
                {showCompanyForm ? 'Agregar Empresa' : 'Agregar Empleado'}
              </h2>
              <Button onClick={() => setShowModal(false)} variant="icon">
                ×
              </Button>
            </div>

            {showCompanyForm ? (
              <CompanyForm
                categories={categories}
                creating={creatingCompany}
                error={companyError}
                form={companyForm}
                onCancel={handleCancelCompanyForm}
                onChange={patch => setCompanyForm(f => ({ ...f, ...patch }))}
                onSubmit={() => void handleCreateCompany()}
              />
            ) : (
              <EmployeeForm
                companies={companies}
                error={saveError}
                form={employeeForm}
                onCancel={() => setShowModal(false)}
                onChange={patch => setEmployeeForm(f => ({ ...f, ...patch }))}
                onCompanySelect={handleCompanySelectChange}
                onSubmit={() => void handleSave()}
                saving={saving}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
