import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

// Lazily load each diagram to keep initial bundle small
const diagramRegistry: Record<string, ComponentType> = {
  blockchain: dynamic(() => import('@/components/diagrams/BlockchainDiagram'), { ssr: false }),
  hashing: dynamic(() => import('@/components/diagrams/HashingDiagram'), { ssr: false }),
  transaction: dynamic(() => import('@/components/diagrams/TransactionDiagram'), { ssr: false }),
  mining: dynamic(() => import('@/components/diagrams/MiningDiagram'), { ssr: false }),
  wallet: dynamic(() => import('@/components/diagrams/WalletDiagram'), { ssr: false }),
  'merkle-tree': dynamic(() => import('@/components/diagrams/MerkleTreeDiagram'), { ssr: false }),
  'elliptic-curve': dynamic(() => import('@/components/diagrams/EllipticCurveDiagram'), { ssr: false }),
  'proof-of-stake': dynamic(() => import('@/components/diagrams/ProofOfStakeDiagram'), { ssr: false }),
  'amm-curve': dynamic(() => import('@/components/diagrams/AMMCurveDiagram'), { ssr: false }),
  'sandwich-attack': dynamic(() => import('@/components/diagrams/SandwichAttackDiagram'), { ssr: false }),
  'validator-network': dynamic(() => import('@/components/diagrams/ValidatorNetworkDiagram'), { ssr: false }),
  'evm-stack': dynamic(() => import('@/components/diagrams/EVMStackDiagram'), { ssr: false }),
  'blockchain-trilemma': dynamic(() => import('@/components/diagrams/BlockchainTrilemma'), { ssr: false }),
  'proof-of-history': dynamic(() => import('@/components/diagrams/ProofOfHistoryDiagram'), { ssr: false }),
  'lattice-crypto': dynamic(() => import('@/components/diagrams/LatticeEncryptionDiagram'), { ssr: false }),
}

export { diagramRegistry }
