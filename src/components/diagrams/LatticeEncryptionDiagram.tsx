'use client'

import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

extend({ ThreeLine: THREE.Line })

// Generate lattice points from basis vectors
function generateLatticePoints(
  v1: [number, number, number],
  v2: [number, number, number],
  v3: [number, number, number],
  range: number
): [number, number, number][] {
  const points: [number, number, number][] = []
  for (let a = -range; a <= range; a++) {
    for (let b = -range; b <= range; b++) {
      for (let c = -range; c <= range; c++) {
        const x = a * v1[0] + b * v2[0] + c * v3[0]
        const y = a * v1[1] + b * v2[1] + c * v3[1]
        const z = a * v1[2] + b * v2[2] + c * v3[2]
        // Only include points within a reasonable radius
        if (Math.sqrt(x * x + y * y + z * z) < 7) {
          points.push([x, y, z])
        }
      }
    }
  }
  return points
}

// Basis vectors for the lattice
const V1: [number, number, number] = [1.5, 0.3, 0.1]
const V2: [number, number, number] = [0.2, 1.4, 0.3]
const V3: [number, number, number] = [0.1, 0.2, 1.6]

// Target point (slightly off-lattice)
const TARGET: [number, number, number] = [2.3, 1.1, 0.8]

// Closest lattice point (the answer)
const CLOSEST: [number, number, number] = [V1[0] + V2[0], V1[1] + V2[1], V1[2] + V2[2]] // 1*v1 + 1*v2

function LatticePoints({ hoverRadius }: { hoverRadius: number }) {
  const points = useMemo(() => generateLatticePoints(V1, V2, V3, 3), [])
  const groupRef = useRef<THREE.Group>(null)

  const [flashIndex, setFlashIndex] = useState(-1)

  useFrame((state) => {
    // Cycle through points to simulate "checking"
    const t = state.clock.elapsedTime
    const idx = Math.floor(t * 4) % points.length
    setFlashIndex(idx)
  })

  return (
    <group ref={groupRef}>
      {points.map((pos, i) => {
        const dist = Math.sqrt(
          (pos[0] - TARGET[0]) ** 2 +
          (pos[1] - TARGET[1]) ** 2 +
          (pos[2] - TARGET[2]) ** 2
        )
        const inSearchRadius = dist < hoverRadius
        const isFlashing = i === flashIndex
        const isClosest =
          Math.abs(pos[0] - CLOSEST[0]) < 0.01 &&
          Math.abs(pos[1] - CLOSEST[1]) < 0.01 &&
          Math.abs(pos[2] - CLOSEST[2]) < 0.01

        return (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[isClosest ? 0.12 : 0.07, 8, 8]} />
            <meshStandardMaterial
              color={isClosest ? '#10b981' : isFlashing ? '#f59e0b' : inSearchRadius ? '#60a5fa' : '#334155'}
              transparent
              opacity={isClosest ? 0.95 : inSearchRadius ? 0.8 : 0.4}
              emissive={isClosest ? '#10b981' : isFlashing ? '#f59e0b' : '#000000'}
              emissiveIntensity={isClosest ? 0.5 : isFlashing ? 0.4 : 0}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function BasisVector({
  direction,
  color,
  label,
}: {
  direction: [number, number, number]
  color: string
  label: string
}) {
  const lineGeo = useMemo(() => {
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...direction)]
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [direction])

  const tipPos: [number, number, number] = [
    direction[0] * 1.15,
    direction[1] * 1.15,
    direction[2] * 1.15,
  ]

  return (
    <>
      <threeLine geometry={lineGeo}>
        <lineBasicMaterial color={color} transparent opacity={0.7} linewidth={2} />
      </threeLine>
      <mesh position={direction}>
        <coneGeometry args={[0.06, 0.18, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <Text position={tipPos} fontSize={0.14} color={color} anchorX="center">
        {label}
      </Text>
    </>
  )
}

function TargetPoint({
  hovered,
  onHover,
}: {
  hovered: boolean
  onHover: (h: boolean) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.02
      meshRef.current.scale.setScalar(hovered ? 1.5 : 1.2 + pulse)
    }
  })

  return (
    <group position={TARGET}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => onHover(true)}
        onPointerLeave={() => onHover(false)}
      >
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={hovered ? 0.6 : 0.3}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      <Text position={[0, 0.3, 0]} fontSize={0.14} color="#f59e0b" anchorX="center">
        Target Point
      </Text>
    </group>
  )
}

function ClosestPoint() {
  return (
    <group position={CLOSEST}>
      <Text position={[0, 0.3, 0]} fontSize={0.12} color="#10b981" anchorX="center">
        Closest Vector (answer)
      </Text>
    </group>
  )
}

function SearchSphere({ radius }: { radius: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.15
      meshRef.current.scale.setScalar(radius + pulse)
    }
  })

  return (
    <mesh ref={meshRef} position={TARGET}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial
        color="#f59e0b"
        transparent
        opacity={0.06}
        wireframe
      />
    </mesh>
  )
}

function ConnectionLine() {
  const geometry = useMemo(() => {
    const points = [new THREE.Vector3(...TARGET), new THREE.Vector3(...CLOSEST)]
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])

  return (
    <threeLine geometry={geometry}>
      <lineBasicMaterial color="#10b981" transparent opacity={0.5} linewidth={2} />
    </threeLine>
  )
}

function Particles() {
  const positions = useMemo(() => {
    const count = 30
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18
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
      <pointsMaterial color="#8b5cf6" size={0.04} transparent opacity={0.2} />
    </points>
  )
}

function Scene() {
  const [targetHovered, setTargetHovered] = useState(false)
  const searchRadius = targetHovered ? 3.5 : 2

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[6, 6, 6]} intensity={1} color="#3b82f6" />
      <pointLight position={[-6, -4, 6]} intensity={0.5} color="#8b5cf6" />
      <fog attach="fog" args={['#09090b', 14, 24]} />
      <Particles />

      {/* Basis vectors */}
      <BasisVector direction={V1} color="#3b82f6" label="v\u2081" />
      <BasisVector direction={V2} color="#8b5cf6" label="v\u2082" />
      <BasisVector direction={V3} color="#10b981" label="v\u2083" />

      <LatticePoints hoverRadius={searchRadius} />
      <TargetPoint hovered={targetHovered} onHover={setTargetHovered} />
      <ClosestPoint />
      <SearchSphere radius={searchRadius} />
      <ConnectionLine />

      {/* Labels */}
      <Text position={[0, -5, 0]} fontSize={0.16} color="#94a3b8" anchorX="center">
        Shortest Vector Problem — hard for classical & quantum computers
      </Text>
      <Text position={[0, -5.6, 0]} fontSize={0.12} color="#64748b" anchorX="center">
        Hover the target to expand search radius
      </Text>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.4}
        minDistance={5}
        maxDistance={20}
      />
    </>
  )
}

export default function LatticeEncryptionDiagram({ resetKey }: { resetKey?: number }) {
  return (
    <Canvas
      key={resetKey}
      camera={{ position: [4, 3, 10], fov: 55 }}
      style={{ width: '100%', height: '100%', background: '#09090b' }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  )
}
