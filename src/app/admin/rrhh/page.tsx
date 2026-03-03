'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { MOCK_EMPLOYEES, RRHH_COMPANIES } from '@/data/mock-employees'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { Employee } from '@/types'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
]

const getInitials = (name: string): string => name
    .split(/\s+/)
    .map((s) => s.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

const getCompanyName = (companyId: string): string => RRHH_COMPANIES.find((c) => c.id === companyId)?.name ?? companyId;

export default function RRHHPage() {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    companyId: '',
    cuil: '',
    email: '',
    name: '',
    phone: '',
    position: '',
    status: 'Activo' as 'Activo' | 'Inactivo',
  })

  const q = search.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      !search.trim()
        ? employees
        : employees.filter(
            (e) =>
              e.name.toLowerCase().includes(q) ||
              e.cuil.replace(/-/g, '').includes(q.replace(/-/g, '')) ||
              getCompanyName(e.companyId).toLowerCase().includes(q) ||
              e.position.toLowerCase().includes(q)
          ),
    [employees, q, search]
  )

  useDocumentTitle('RRHH - VALID')

  const openModal = () => (
    setShowModal(true),
    setForm({
      companyId: '',
      cuil: '',
      email: '',
      name: '',
      phone: '',
      position: '',
      status: 'Activo',
    })
  )

  const handleSave = () =>
    form.name &&
    form.cuil &&
    form.companyId &&
    form.position &&
    form.email &&
    (setEmployees((prev) => [
      ...prev,
      {
        companyId: form.companyId,
        cuil: form.cuil,
        email: form.email,
        id: `emp${Date.now()}`,
        name: form.name,
        phone: form.phone,
        position: form.position,
        status: form.status,
      },
    ]),
    setShowModal(false))

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
        <button
          className="rounded-(--radius) px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          onClick={openModal}
          style={{ background: 'var(--accent)' }}
          type="button"
        >
          + Agregar Empleado
        </button>
      </div>

      <div
        className="mb-6 rounded-(--radius) border px-4 py-3 shadow-(--shadow)"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <input
          className="w-full bg-transparent text-sm outline-none"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Buscar por nombre, CUIL, empresa o puesto..."
          style={{ color: 'var(--text)' }}
          value={search}
        />
      </div>

      <div
        className="rounded-(--radius) border shadow-(--shadow) overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {filtered.map((e, i) => (
            <li className="flex items-center gap-4 px-4 py-4" key={e.id}>
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}
              >
                {getInitials(e.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  {e.name}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  CUIL: <span className="font-mono">{e.cuil}</span> • {getCompanyName(e.companyId)} • {e.position}
                </p>
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={
                  e.status === 'Activo'
                    ? { background: '#d1fae5', color: 'var(--success)' }
                    : { background: '#fee', color: 'var(--error)' }
                }
              >
                {e.status}
              </span>
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
                Agregar Empleado
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
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Nombre Completo</label>
                <input
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Juan Pérez"
                  value={form.name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>CUIL</label>
                <input
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2 font-mono"
                  onChange={(e) => setForm((f) => ({ ...f, cuil: e.target.value }))}
                  placeholder="20-12345678-9"
                  value={form.cuil}
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Empresa / Proveedor</label>
                <select
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
                  onChange={(e) => setForm((f) => ({ ...f, companyId: e.target.value }))}
                  value={form.companyId}
                >
                  <option value="">Seleccionar empresa...</option>
                  {RRHH_COMPANIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Puesto</label>
                <input
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                  placeholder="Ej: Coordinador de Producción"
                  value={form.position}
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Email</label>
                <input
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="empleado@empresa.com"
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
                <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Estado</label>
                <select
                  className="mt-1 w-full rounded-(--radius) border border-(--border) px-3 py-2"
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'Activo' | 'Inactivo' }))}
                  value={form.status}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                className="rounded-(--radius) px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                onClick={handleSave}
                style={{ background: 'var(--accent)' }}
                type="button"
              >
                Guardar
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
