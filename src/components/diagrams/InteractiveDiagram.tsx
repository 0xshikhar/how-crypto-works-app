'use client'

import { Suspense, useState } from 'react'
import dynamic from 'next/dynamic'
import { RotateCcw, ZoomIn, ZoomOut, Move3D } from 'lucide-react'

// Lazy-load diagrams
const diagrams: Record<string, React.ComponentType<{ resetKey?: number }>> = {
  blockchain: dynamic(() => import('./BlockchainDiagram'), { ssr: false }),
  hashing: dynamic(() => import('./HashingDiagram'), { ssr: false }),
  transaction: dynamic(() => import('./TransactionDiagram'), { ssr: false }),
  mining: dynamic(() => import('./MiningDiagram'), { ssr: false }),
  wallet: dynamic(() => import('./WalletDiagram'), { ssr: false }),
}

const titles: Record<string, string> = {
  blockchain: 'Blockchain Structure',
  hashing: 'Hash Function Visualizer',
  transaction: 'Transaction Flow (UTXO)',
  mining: 'Mining Process',
  wallet: 'Wallet & Key Hierarchy',
}

interface InteractiveDiagramProps {
  type: string
  height?: number
}

export function InteractiveDiagram({ type, height = 420 }: InteractiveDiagramProps) {
  const [resetKey, setResetKey] = useState(0)
  const Diagram = diagrams[type]

  if (!Diagram) {
    return (
      <div className="my-8 border border-border rounded-2xl bg-surface p-6 text-center text-muted text-sm">
        Unknown diagram type: <code className="text-accent">{type}</code>
      </div>
    )
  }

  return (
    <div className="my-10 rounded-2xl border border-border overflow-hidden bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface-light/50">
        <div className="flex items-center gap-2">
          <Move3D className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">{titles[type] || type}</span>
          <span className="text-[11px] text-muted-dark border border-border rounded-full px-2 py-0.5">3D Interactive</span>
        </div>
        <button
          onClick={() => setResetKey(k => k + 1)}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-surface"
          title="Reset view"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Diagram canvas */}
      <div style={{ height }} className="relative">
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-muted">Loading 3D scene…</span>
              </div>
            </div>
          }
        >
          <Diagram resetKey={resetKey} />
        </Suspense>
      </div>

      {/* Footer hint */}
      <div className="px-5 py-2.5 border-t border-border bg-surface-light/30 flex items-center gap-4">
        <span className="text-[11px] text-muted-dark flex items-center gap-1"><ZoomIn className="w-3 h-3" /> Scroll to zoom</span>
        <span className="text-[11px] text-muted-dark flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Drag to rotate</span>
        <span className="text-[11px] text-muted-dark flex items-center gap-1"><ZoomOut className="w-3 h-3" /> Right-drag to pan</span>
      </div>
    </div>
  )
}
