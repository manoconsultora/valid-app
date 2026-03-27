'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import type { ReactNode } from 'react'

interface TooltipProps {
  children: ReactNode
  content: ReactNode
  delayDuration?: number
  side?: 'bottom' | 'left' | 'right' | 'top'
}

export const Tooltip = ({
  children,
  content,
  delayDuration = 400,
  side = 'top',
}: TooltipProps) => (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span className="inline-flex">{children}</span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className="z-50 max-w-[240px] rounded-lg bg-(--text) px-3 py-1.5 text-[11px] font-medium leading-relaxed text-white shadow-md animate-in fade-in-0 zoom-in-95"
            side={side}
            sideOffset={6}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-(--text)" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
