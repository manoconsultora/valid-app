'use client'

import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'

import { ToastContext, useToastState } from '@/hooks/useToast'
import type { ToastItem, ToastType } from '@/hooks/useToast'

const TYPE_STYLES: Record<
  ToastType,
  { background: string; border: string; color: string }
> = {
  error: { background: '#fef2f2', border: '#fecaca', color: '#dc2626' },
  info: { background: 'var(--surface)', border: 'var(--border)', color: 'var(--accent)' },
  success: { background: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
}

function ToastItemEl({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const styles = TYPE_STYLES[item.type]
  return (
    <div
      className="flex max-w-95 min-w-70 items-start gap-3 rounded-(--radius) border px-4 py-3 text-sm shadow-(--shadow-lg)"
      role="alert"
      style={{
        background: styles.background,
        borderColor: styles.border,
        color: styles.color,
      }}
    >
      <span className="flex-1">{item.message}</span>
      <button
        className="ml-2 shrink-0 text-base leading-none opacity-60 hover:opacity-100"
        onClick={onDismiss}
        type="button"
      >
        ×
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback(
    (id: string) => setItems(prev => prev.filter(t => t.id !== id)),
    []
  )

  const show = useCallback(
    function handleShow(message: string, type: ToastType = 'info') {
      const id = crypto.randomUUID()
      setItems(prev => [...prev, { id, message, type }])
      setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 4000)
    },
    []
  )

  return (
    <ToastContext.Provider value={{ dismiss, items, show }}>
      {children}
    </ToastContext.Provider>
  )
}

export function ToastContainer() {
  const { dismiss, items } = useToastState()
  if (!items.length) {
    return null
  }
  return (
    <div className="fixed right-6 bottom-6 z-9999 flex flex-col gap-2">
      {items.map(item => (
        <ToastItemEl item={item} key={item.id} onDismiss={() => dismiss(item.id)} />
      ))}
    </div>
  )
}
