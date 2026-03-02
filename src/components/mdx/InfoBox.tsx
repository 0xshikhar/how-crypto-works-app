'use client'

import { cn } from '@/lib/utils'

interface InfoBoxProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function InfoBox({ title, children, className }: InfoBoxProps) {
  return (
    <div className={cn('my-6 rounded-xl border border-accent/25 bg-accent/5 px-5 py-4', className)}>
      {title && (
        <p className="text-sm font-semibold text-accent mb-2">{title}</p>
      )}
      <div className="text-sm text-foreground/80 leading-relaxed">{children}</div>
    </div>
  )
}
