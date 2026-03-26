'use client'

import { Slot } from '@radix-ui/react-slot'
import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant =
  | 'accent'
  | 'accent-outline'
  | 'dark'
  | 'ghost'
  | 'gradient'
  | 'icon'
  | 'success'
  | 'success-soft'
  | 'warning-soft'

export type ButtonSize = 'md' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  size?: ButtonSize
  variant?: ButtonVariant
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  'accent':
    'bg-accent text-white transition-opacity hover:opacity-90 disabled:opacity-70',
  'accent-outline':
    'border border-(--border) bg-transparent text-accent transition-opacity hover:opacity-80 disabled:opacity-70',
  'dark':
    'bg-(--text) text-white transition-opacity hover:opacity-90 disabled:opacity-70',
  'ghost':
    'border border-(--border) bg-transparent text-(--text) transition-opacity hover:opacity-80 disabled:opacity-70',
  'gradient':
    'bg-(--gradient-accent) text-white transition-opacity hover:opacity-90 disabled:opacity-70',
  'icon': 'text-(--text-secondary) transition-opacity hover:opacity-70',
  'success':
    'bg-(--success) text-white transition-opacity hover:opacity-90 disabled:opacity-70',
  'success-soft':
    'bg-success-soft text-success-soft-text hover:bg-success-soft-hover transition-colors disabled:opacity-70',
  'warning-soft':
    'bg-warning-soft text-warning-soft-text hover:bg-warning-soft-hover transition-colors disabled:opacity-70',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'rounded-(--radius) px-4 py-2 text-sm font-medium',
  sm: 'rounded-(--radius) px-3 py-1 text-xs font-medium',
}

const BASE_CLASS = 'inline-flex cursor-pointer items-center justify-center'

export function Button({
  asChild = false,
  children,
  className = '',
  size = 'md',
  type = 'button',
  variant = 'accent',
  ...props
}: ButtonProps) {
  const isIcon = variant === 'icon'
  const sizeClass = isIcon ? 'text-2xl leading-none' : SIZE_CLASSES[size]
  const computedClass =
    `${BASE_CLASS} ${VARIANT_CLASSES[variant]} ${sizeClass} ${className}`.trim()
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp className={computedClass} type={type} {...props}>
      {children}
    </Comp>
  )
}
