'use client'

import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

extend({ ThreeLine: THREE.Line })

const HELIX_RADIUS = 2.5
const HELIX_PITCH = 0.5 // vertical distance per full rotation
const TOTAL_HASHES = 60
const EVENT_INDICES = [5, 12, 23, 34, 45, 55] // which hashes have events
const GROW_SPEED = 3 // hashes per second

function simpleHash(n: number): string {
  let h = 0x811c9dc5 ^ n
  h = (h * 0x01000193) >>> 0
  return h.toString(16).padStart(8, '0').slice(0, 6)
}

function getHelixPosition(index: number): [number, number, number] {
  const theta = (index / 8) * Math.PI * 2
  const x = HELIX_RADIUS * Math.cos(theta)
  const y = index * HELIX_PITCH - (TOTAL_HASHES * HELIX_PITCH) / 2
  const z = HELIX_RADIUS * Math.sin(theta)
  return [x, y, z]
}

function HashCube({
  index,
  isEvent,
  isVisible,
  hovered,
  onHover,
}: {
  index: number
  isEvent: boolean
  isVisible: boolean
  hovered: number | null
  onHover: (id: number | null) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const pos = useMemo(() => getHelixPosition(index), [index])
  const isHovered = hovered === index

  useFrame((state) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    mat.opacity = isVisible ? (isEvent ? 0.95 : 0.75) : 0

    if (isEvent) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + index) * 0.04
      meshRef.current.scale.setScalar(isHovered ? 1.5 : 1.2 + pulse)
    } else {
      meshRef.current.scale.setScalar(isHovered ? 1.3 : 1)
    }
  })

  const size = isEvent ? 0.25 : 0.15
  const color = isEvent ? '#f59e0b' : '#3b82f6'

  return (
    <group position={pos}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => onHover(index)}
        onPointerLeave={() => onHover(null)}
      >
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={0}
          emissive={color}
          emissiveIntensity={isHovered ? 0.5 : isEvent ? 0.25 : 0.1}
        />
      </mesh>
      {isHovered && isVisible && (
        <Text position={[0.4, 0, 0]} fontSize={0.12} color="#f1f5f9" anchorX="left">
          {isEvent ? `Event @ Hash #${index}` : `Hash #${index}: ${simpleHash(index)}`}
        </Text>
      )}
    </group>
  )
}

function HelixConnections() {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (let i = 0; i < TOTAL_HASHES; i++) {
      const pos = getHelixPosition(i)
      points.push(new THREE.Vector3(...pos))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])

  return (
    <threeLine geometry={geometry}>
      <lineBasicMaterial color="#3b82f6" transparent opacity={0.2} linewidth={1} />
    </threeLine>
  )
}

function EventMarker({ index, isVisible }: { index: number; isVisible: boolean }) {
  const pos = useMemo(() => getHelixPosition(index), [index])
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = state.clock.elapsedTime * 1.5
    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    mat.opacity = isVisible ? 0.7 : 0
  })

  return (
    <group position={pos}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial
          color="#f59e0b"
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0}
          emissive="#f59e0b"
          emissiveIntensity={0.3}
        />
      </mesh>
      {isVisible && (
        <Text position={[-0.5, 0, 0]} fontSize={0.1} color="#f59e0b" anchorX="right">
          Tx
        </Text>
      )}
    </group>
  )
}

function VerificationBeam({ visibleCount }: { visibleCount: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    // Beam sweeps up periodically
    const cycleTime = 4
    const t = (state.clock.elapsedTime % cycleTime) / cycleTime
    const maxY = visibleCount * HELIX_PITCH - (TOTAL_HASHES * HELIX_PITCH) / 2
    const minY = -(TOTAL_HASHES * HELIX_PITCH) / 2
    meshRef.current.position.y = minY + t * (maxY - minY)

    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    mat.opacity = 0.3 + Math.sin(t * Math.PI) * 0.2
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.12, 8, 8]} />
      <meshStandardMaterial
        color="#10b981"
        transparent
        opacity={0.3}
        emissive="#10b981"
        emissiveIntensity={0.8}
      />
    </mesh>
  )
}

function TimeAxis() {
  const geometry = useMemo(() => {
    const minY = -(TOTAL_HASHES * HELIX_PITCH) / 2 - 1
    const maxY = (TOTAL_HASHES * HELIX_PITCH) / 2 + 1
    const points = [new THREE.Vector3(0, minY, 0), new THREE.Vector3(0, maxY, 0)]
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])

  return (
    <>
      <threeLine geometry={geometry}>
        <lineBasicMaterial color="#334155" transparent opacity={0.2} />
      </threeLine>
      <Text
        position={[0, (TOTAL_HASHES * HELIX_PITCH) / 2 + 1.5, 0]}
        fontSize={0.16}
        color="#64748b"
        anchorX="center"
      >
        {'Time ->'}
      </Text>
    </>
  )
}

function Particles() {
  const positions = useMemo(() => {
    const count = 40
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12
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
      <pointsMaterial color="#3b82f6" size={0.04} transparent opacity={0.2} />
    </points>
  )
}

function Scene() {
  const [hovered, setHovered] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(0)

  useFrame((state) => {
    const t = state.clock.elapsedTime % ((TOTAL_HASHES / GROW_SPEED) + 3)
    const count = Math.min(Math.floor(t * GROW_SPEED), TOTAL_HASHES)
    setVisibleCount(count)
  })

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 8, 5]} intensity={1} color="#3b82f6" />
      <pointLight position={[-5, -8, 5]} intensity={0.5} color="#f59e0b" />
      <fog attach="fog" args={['#09090b', 16, 28]} />
      <Particles />
      <TimeAxis />

      <HelixConnections />

      {Array.from({ length: TOTAL_HASHES }).map((_, i) => (
        <HashCube
          key={i}
          index={i}
          isEvent={EVENT_INDICES.includes(i)}
          isVisible={i < visibleCount}
          hovered={hovered}
          onHover={setHovered}
        />
      ))}

      {EVENT_INDICES.map((idx) => (
        <EventMarker key={`event-${idx}`} index={idx} isVisible={idx < visibleCount} />
      ))}

      <VerificationBeam visibleCount={visibleCount} />

      <Text
        position={[0, -(TOTAL_HASHES * HELIX_PITCH) / 2 - 2, 0]}
        fontSize={0.16}
        color="#94a3b8"
        anchorX="center"
      >
        Sequential hashing creates verifiable time ordering
      </Text>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.4}
        minDistance={8}
        maxDistance={25}
      />
    </>
  )
}

export default function ProofOfHistoryDiagram({ resetKey }: { resetKey?: number }) {
  return (
    <Canvas
      key={resetKey}
      camera={{ position: [5, 2, 10], fov: 55 }}
      style={{ width: '100%', height: '100%', background: '#09090b' }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  )
}
