'use client'

import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Text, Float } from '@react-three/drei'
import * as THREE from 'three'

extend({ ThreeLine: THREE.Line })

const VALIDATORS = [
  { id: 0, stake: 32, label: '32 ETH', isProposer: true, isSlashed: false },
  { id: 1, stake: 64, label: '64 ETH', isProposer: false, isSlashed: false },
  { id: 2, stake: 128, label: '128 ETH', isProposer: false, isSlashed: false },
  { id: 3, stake: 32, label: '32 ETH', isProposer: false, isSlashed: false },
  { id: 4, stake: 256, label: '256 ETH', isProposer: false, isSlashed: false },
  { id: 5, stake: 32, label: '32 ETH', isProposer: false, isSlashed: true },
  { id: 6, stake: 96, label: '96 ETH', isProposer: false, isSlashed: false },
  { id: 7, stake: 64, label: '64 ETH', isProposer: false, isSlashed: false },
  { id: 8, stake: 32, label: '32 ETH', isProposer: false, isSlashed: false },
  { id: 9, stake: 160, label: '160 ETH', isProposer: false, isSlashed: false },
  { id: 10, stake: 48, label: '48 ETH', isProposer: false, isSlashed: false },
  { id: 11, stake: 32, label: '32 ETH', isProposer: false, isSlashed: false },
]

const RING_RADIUS = 4.5
const ATTESTATION_SPEED = 0.6 // seconds per attestation

function ValidatorNode({
  validator,
  angle,
  hovered,
  onHover,
  attestationProgress,
}: {
  validator: (typeof VALIDATORS)[0]
  angle: number
  hovered: number | null
  onHover: (id: number | null) => void
  attestationProgress: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const isHovered = hovered === validator.id
  const x = Math.cos(angle) * RING_RADIUS
  const z = Math.sin(angle) * RING_RADIUS

  const hasAttested = attestationProgress > validator.id
  const scale = 0.25 + (validator.stake / 256) * 0.4

  useFrame((state, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += delta * 0.5
    if (validator.isSlashed) {
      const shrink = Math.max(0.3, scale - Math.sin(state.clock.elapsedTime * 2) * 0.1)
      meshRef.current.scale.setScalar(shrink)
    }
  })

  const color = validator.isSlashed
    ? '#ef4444'
    : validator.isProposer
      ? '#f59e0b'
      : hasAttested
        ? '#10b981'
        : '#3b82f6'

  return (
    <group position={[x, 0, z]}>
      <mesh
        ref={meshRef}
        scale={scale}
        onPointerEnter={() => onHover(validator.id)}
        onPointerLeave={() => onHover(null)}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={hovered !== null && !isHovered ? '#1e293b' : color}
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={hovered !== null && !isHovered ? 0.4 : 0.9}
          emissive={new THREE.Color(isHovered ? color : '#000000')}
          emissiveIntensity={isHovered ? 0.4 : validator.isProposer ? 0.2 : 0}
        />
      </mesh>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.14}
        color={hovered !== null && !isHovered ? '#334155' : '#94a3b8'}
        anchorX="center"
      >
        {validator.label}
      </Text>
      {validator.isProposer && (
        <Text position={[0, 0.9, 0]} fontSize={0.13} color="#f59e0b" anchorX="center">
          Proposer
        </Text>
      )}
      {validator.isSlashed && (
        <Text position={[0, 0.9, 0]} fontSize={0.13} color="#ef4444" anchorX="center">
          Slashed
        </Text>
      )}
    </group>
  )
}

function AttestationLine({
  fromAngle,
  progress,
  isActive,
}: {
  fromAngle: number
  progress: number
  isActive: boolean
}) {
  const geometry = useMemo(() => {
    const from = new THREE.Vector3(
      Math.cos(fromAngle) * RING_RADIUS * 0.8,
      0,
      Math.sin(fromAngle) * RING_RADIUS * 0.8
    )
    const to = new THREE.Vector3(0, 0, 0)
    const mid = from.clone().lerp(to, progress)
    return new THREE.BufferGeometry().setFromPoints([from, mid])
  }, [fromAngle, progress])

  if (!isActive) return null

  return (
    <threeLine geometry={geometry}>
      <lineBasicMaterial color="#10b981" transparent opacity={0.5} linewidth={2} />
    </threeLine>
  )
}

function FinalityRing({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.PI / 2
    }
  })

  const arcLength = Math.min(progress, 1) * Math.PI * 2
  const isFinal = progress >= 0.667

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1.8, 0.06, 8, 64, arcLength]} />
        <meshStandardMaterial
          color={isFinal ? '#10b981' : '#f59e0b'}
          emissive={isFinal ? '#10b981' : '#f59e0b'}
          emissiveIntensity={isFinal ? 0.5 : 0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
      <Text position={[0, -2, 0]} fontSize={0.16} color={isFinal ? '#10b981' : '#f59e0b'} anchorX="center">
        {isFinal ? 'Finalized (2/3 supermajority)' : `Attestations: ${Math.floor(progress * 12)}/12`}
      </Text>
    </group>
  )
}

function ProposedBlock() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial
          color="#3b82f6"
          roughness={0.2}
          metalness={0.8}
          emissive="#3b82f6"
          emissiveIntensity={0.15}
          transparent
          opacity={0.85}
        />
      </mesh>
      <Text position={[0, 1, 0]} fontSize={0.16} color="#f1f5f9" anchorX="center">
        Proposed Block
      </Text>
      <Text position={[0, -0.9, 0.62]} fontSize={0.1} color="#94a3b8" anchorX="center">
        Slot 8,234,567
      </Text>
    </Float>
  )
}

function Particles() {
  const positions = useMemo(() => {
    const count = 50
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16
    }
    return pos
  }, [])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  return (
    <points geometry={geo}>
      <pointsMaterial color="#3b82f6" size={0.04} transparent opacity={0.3} />
    </points>
  )
}

function Scene() {
  const [hovered, setHovered] = useState<number | null>(null)
  const [attestationProgress, setAttestationProgress] = useState(0)
  const attestationStepRef = useRef(0)

  useFrame((state) => {
    const cycleTime = 12
    const t = state.clock.elapsedTime % cycleTime
    // Attestations arrive over the first 8 seconds
    const progress = Math.min(t / (ATTESTATION_SPEED * 12), 1) * 12
    const step = Math.floor(progress)
    if (step !== attestationStepRef.current) {
      attestationStepRef.current = step
      setAttestationProgress(step)
    }
  })

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[6, 6, 6]} intensity={1} color="#3b82f6" />
      <pointLight position={[-6, -4, 6]} intensity={0.6} color="#8b5cf6" />
      <fog attach="fog" args={['#09090b', 14, 24]} />
      <Particles />

      <ProposedBlock />

      {VALIDATORS.map((v, i) => {
        const angle = (i / VALIDATORS.length) * Math.PI * 2 - Math.PI / 2
        return (
          <ValidatorNode
            key={v.id}
            validator={v}
            angle={angle}
            hovered={hovered}
            onHover={setHovered}
            attestationProgress={attestationProgress}
          />
        )
      })}

      {VALIDATORS.map((v, i) => {
        if (v.isSlashed) return null
        const angle = (i / VALIDATORS.length) * Math.PI * 2 - Math.PI / 2
        const isActive = attestationProgress > i
        const lineProgress = Math.min(Math.max(attestationProgress - i, 0), 1)
        return (
          <AttestationLine
            key={`att-${v.id}`}
            fromAngle={angle}
            progress={lineProgress}
            isActive={isActive}
          />
        )
      })}

      <FinalityRing progress={attestationProgress / 12} />

      <Text position={[0, 3.2, 0]} fontSize={0.2} color="#f1f5f9" anchorX="center">
        Epoch 45,678
      </Text>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.3}
        minDistance={6}
        maxDistance={20}
      />
    </>
  )
}

export default function ProofOfStakeDiagram({ resetKey }: { resetKey?: number }) {
  return (
    <Canvas
      key={resetKey}
      camera={{ position: [0, 6, 12], fov: 50 }}
      style={{ width: '100%', height: '100%', background: '#09090b' }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  )
}
