'use client'

import { createContext, useContext } from 'react'

export type ToastType = 'error' | 'info' | 'success'

export type ToastItem = {
  id: string
  message: string
  type: ToastType
}

export type ToastContextValue = {
  dismiss: (_id: string) => void
  items: ToastItem[]
  show: (_message: string, _type?: ToastType) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return { show: ctx.show }
}

export function useToastState() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToastState must be used within ToastProvider')
  }
  return { dismiss: ctx.dismiss, items: ctx.items }
}
