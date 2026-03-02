import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

// Lazily load each diagram to keep initial bundle small
const diagramRegistry: Record<string, ComponentType> = {
  blockchain: dynamic(() => import('@/components/diagrams/BlockchainDiagram'), { ssr: false }),
  hashing: dynamic(() => import('@/components/diagrams/HashingDiagram'), { ssr: false }),
  transaction: dynamic(() => import('@/components/diagrams/TransactionDiagram'), { ssr: false }),
  mining: dynamic(() => import('@/components/diagrams/MiningDiagram'), { ssr: false }),
  wallet: dynamic(() => import('@/components/diagrams/WalletDiagram'), { ssr: false }),
}

export { diagramRegistry }
