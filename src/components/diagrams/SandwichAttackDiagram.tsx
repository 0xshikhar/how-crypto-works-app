'use client'

import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

const CYCLE = 16 // seconds per full cycle

function getPhase(t: number): { phase: number; progress: number } {
  const ct = t % CYCLE
  if (ct < 3) return { phase: 0, progress: ct / 3 }       // Victim tx appears
  if (ct < 5) return { phase: 1, progress: (ct - 3) / 2 }  // Bot detects
  if (ct < 8) return { phase: 2, progress: (ct - 5) / 3 }  // Frontrun
  if (ct < 11) return { phase: 3, progress: (ct - 8) / 3 } // Victim executes
  if (ct < 14) return { phase: 4, progress: (ct - 11) / 3 } // Backrun + profit
  return { phase: 5, progress: (ct - 14) / 2 }              // Reset fade
}

function Mempool() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })

  return (
    <group position={[0, 2.5, 0]}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial
          color="#8b5cf6"
          wireframe
          transparent
          opacity={0.2}
          emissive="#8b5cf6"
          emissiveIntensity={0.1}
        />
      </mesh>
      <Text position={[0, 1.8, 0]} fontSize={0.18} color="#8b5cf6" anchorX="center">
        Mempool
      </Text>
    </group>
  )
}

function BotEntity() {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<number>(0)

  useFrame((state) => {
    if (!meshRef.current) return
    const { phase } = getPhase(state.clock.elapsedTime)
    const targetGlow = phase === 1 ? 0.6 : phase >= 2 && phase <= 4 ? 0.3 : 0
    glowRef.current += (targetGlow - glowRef.current) * 0.05
    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = glowRef.current
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
  })

  return (
    <group position={[4, 2.5, 0]}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color="#ef4444"
          roughness={0.3}
          metalness={0.7}
          emissive="#ef4444"
          emissiveIntensity={0}
        />
      </mesh>
      <Text position={[0, -0.8, 0]} fontSize={0.16} color="#ef4444" anchorX="center">
        MEV Bot
      </Text>
    </group>
  )
}

function TransactionBox({
  label,
  basePosition,
  color,
  phaseStart,
  detail,
  hovered,
  onHover,
  id,
}: {
  label: string
  basePosition: [number, number, number]
  color: string
  phaseStart: number
  detail: string
  hovered: string | null
  onHover: (id: string | null) => void
  id: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const isHovered = hovered === id

  useFrame((state) => {
    if (!meshRef.current) return
    const { phase, progress } = getPhase(state.clock.elapsedTime)

    let opacity = 0
    let yOffset = 0

    if (phase > phaseStart) {
      opacity = 1
    } else if (phase === phaseStart) {
      opacity = progress
      yOffset = (1 - progress) * 1.5
    }

    if (phase === 5) {
      opacity = 1 - progress
    }

    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    mat.opacity = opacity
    mat.emissiveIntensity = isHovered ? 0.3 : 0
    meshRef.current.position.set(
      basePosition[0],
      basePosition[1] + yOffset,
      basePosition[2]
    )
  })

  return (
    <group>
      <mesh
        ref={meshRef}
        position={basePosition}
        onPointerEnter={() => onHover(id)}
        onPointerLeave={() => onHover(null)}
      >
        <boxGeometry args={[2, 0.8, 0.6]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.6}
          transparent
          opacity={0}
          emissive={new THREE.Color(color)}
          emissiveIntensity={0}
        />
      </mesh>
      <Text
        position={[basePosition[0], basePosition[1] + 0, basePosition[2] + 0.32]}
        fontSize={0.13}
        color="#f1f5f9"
        anchorX="center"
      >
        {label}
      </Text>
      {isHovered && (
        <Text
          position={[basePosition[0], basePosition[1] - 0.6, basePosition[2]]}
          fontSize={0.1}
          color="#94a3b8"
          anchorX="center"
        >
          {detail}
        </Text>
      )}
    </group>
  )
}

function PriceBar() {
  const meshRef = useRef<THREE.Mesh>(null)
  const labelRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!meshRef.current || !labelRef.current) return
    const { phase, progress } = getPhase(state.clock.elapsedTime)

    let height = 1
    if (phase === 0) height = 1
    else if (phase === 1) height = 1
    else if (phase === 2) height = 1 + progress * 0.8          // Frontrun pushes price up
    else if (phase === 3) height = 1.8 + progress * 0.6        // Victim pushes higher
    else if (phase === 4) height = 2.4 - progress * 1.4        // Backrun brings it back
    else height = 1

    meshRef.current.scale.y = height
    meshRef.current.position.y = -1.5 + height * 0.5
    labelRef.current.position.y = -1.5 + height + 0.3
  })

  return (
    <group position={[-4, 0, 0]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.6, 1, 0.4]} />
        <meshStandardMaterial color="#10b981" roughness={0.4} metalness={0.5} emissive="#10b981" emissiveIntensity={0.15} />
      </mesh>
      <group ref={labelRef}>
        <Text fontSize={0.14} color="#10b981" anchorX="center">
          Price
        </Text>
      </group>
      <Text position={[0, -2.3, 0]} fontSize={0.12} color="#64748b" anchorX="center">
        Pool Price
      </Text>
    </group>
  )
}

function PhaseLabel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const { phase } = getPhase(state.clock.elapsedTime)
    if (groupRef.current) {
      const children = groupRef.current.children
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as THREE.Mesh
        if (child.material && 'opacity' in child.material) {
          (child.material as THREE.MeshBasicMaterial).opacity = i === phase ? 1 : 0
        }
      }
    }
  })

  const labels = [
    '1. Victim submits swap to mempool',
    '2. MEV bot detects pending transaction',
    '3. Bot frontruns: buys before victim',
    '4. Victim executes at worse price',
    '5. Bot backruns: sells for profit',
    '',
  ]

  return (
    <group ref={groupRef} position={[0, -3, 0]}>
      {labels.map((label, i) => (
        <Text key={i} fontSize={0.18} color="#f59e0b" anchorX="center">
          {label}
        </Text>
      ))}
    </group>
  )
}

function Particles() {
  const positions = useMemo(() => {
    const count = 40
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6
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
      <pointsMaterial color="#8b5cf6" size={0.04} transparent opacity={0.3} />
    </points>
  )
}

function Scene() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[6, 6, 6]} intensity={1} color="#3b82f6" />
      <pointLight position={[-6, -4, 4]} intensity={0.6} color="#ef4444" />
      <fog attach="fog" args={['#09090b', 14, 22]} />
      <Particles />

      <Mempool />
      <BotEntity />
      <PriceBar />

      {/* Transaction boxes in execution order */}
      <TransactionBox
        id="frontrun"
        label="Frontrun Tx"
        basePosition={[-1, 0.5, 0]}
        color="#ef4444"
        phaseStart={2}
        detail="Bot buys: 100 Gas, +2 ETH"
        hovered={hovered}
        onHover={setHovered}
      />
      <TransactionBox
        id="victim"
        label="Victim Swap"
        basePosition={[-1, -0.5, 0]}
        color="#f59e0b"
        phaseStart={0}
        detail="User swaps 1 ETH → USDC (worse price)"
        hovered={hovered}
        onHover={setHovered}
      />
      <TransactionBox
        id="backrun"
        label="Backrun Tx"
        basePosition={[-1, -1.5, 0]}
        color="#10b981"
        phaseStart={4}
        detail="Bot sells: captures $12 profit"
        hovered={hovered}
        onHover={setHovered}
      />

      <PhaseLabel />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.2}
        minDistance={6}
        maxDistance={18}
      />
    </>
  )
}

export default function SandwichAttackDiagram({ resetKey }: { resetKey?: number }) {
  return (
    <Canvas
      key={resetKey}
      camera={{ position: [0, 1, 12], fov: 50 }}
      style={{ width: '100%', height: '100%', background: '#09090b' }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  )
}
