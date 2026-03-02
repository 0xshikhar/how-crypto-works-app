'use client'

import { AlertCircle, Info, Lightbulb, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const variants = {
  info: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/30', iconColor: 'text-blue-400', textColor: 'text-blue-100' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/30', iconColor: 'text-amber-400', textColor: 'text-amber-100' },
  danger: { icon: AlertCircle, bg: 'bg-red-500/10', border: 'border-red-500/30', iconColor: 'text-red-400', textColor: 'text-red-100' },
  tip: { icon: Lightbulb, bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', iconColor: 'text-emerald-400', textColor: 'text-emerald-100' },
}

interface CalloutProps {
  type?: keyof typeof variants
  title?: string
  children: React.ReactNode
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const v = variants[type]
  const Icon = v.icon

  return (
    <div className={cn('my-6 rounded-xl border px-5 py-4', v.bg, v.border)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', v.iconColor)} />
        <div>
          {title && <p className={cn('font-semibold mb-1 text-sm', v.iconColor)}>{title}</p>}
          <div className={cn('text-sm leading-relaxed', v.textColor)}>{children}</div>
        </div>
      </div>
    </div>
  )
}
