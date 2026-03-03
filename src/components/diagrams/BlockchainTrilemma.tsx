'use client'

import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Text, Float } from '@react-three/drei'
import * as THREE from 'three'

extend({ ThreeLine: THREE.Line })

// Triangle vertices (equilateral in XZ plane)
const TRI_SCALE = 4.5
const VERTICES: { label: string; position: [number, number, number]; color: string }[] = [
  { label: 'Decentralization', position: [0, 0, -TRI_SCALE], color: '#8b5cf6' },
  { label: 'Security', position: [-TRI_SCALE * Math.sin(Math.PI / 3), 0, TRI_SCALE * 0.5], color: '#3b82f6' },
  { label: 'Scalability', position: [TRI_SCALE * Math.sin(Math.PI / 3), 0, TRI_SCALE * 0.5], color: '#10b981' },
]

// Blockchain positions as barycentric coordinates [decentralization, security, scalability]
const BLOCKCHAINS: {
  name: string
  bary: [number, number, number]
  color: string
  desc: string
}[] = [
  { name: 'Bitcoin', bary: [0.45, 0.45, 0.1], color: '#f59e0b', desc: 'High decentralization & security, low scalability' },
  { name: 'Ethereum', bary: [0.35, 0.38, 0.27], color: '#3b82f6', desc: 'Balanced with L2 scaling roadmap' },
  { name: 'Solana', bary: [0.15, 0.3, 0.55], color: '#10b981', desc: 'High scalability, lower decentralization' },
  { name: 'L2 Rollups', bary: [0.2, 0.35, 0.45], color: '#8b5cf6', desc: 'Inherit L1 security, add scalability' },
]

function baryToCartesian(bary: [number, number, number]): [number, number, number] {
  const [a, b, c] = bary
  const x = a * VERTICES[0].position[0] + b * VERTICES[1].position[0] + c * VERTICES[2].position[0]
  const y = 0.3 // slightly above the triangle
  const z = a * VERTICES[0].position[2] + b * VERTICES[1].position[2] + c * VERTICES[2].position[2]
  return [x, y, z]
}

function TriangleFace() {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array([
      VERTICES[0].position[0], -0.05, VERTICES[0].position[2],
      VERTICES[1].position[0], -0.05, VERTICES[1].position[2],
      VERTICES[2].position[0], -0.05, VERTICES[2].position[2],
    ])
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setIndex([0, 1, 2])
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh geometry={geometry} rotation={[0, 0, 0]}>
      <meshStandardMaterial
        color="#1e293b"
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  )
}

function TriangleEdges() {
  const edges = useMemo(() => {
    const lines: THREE.BufferGeometry[] = []
    for (let i = 0; i < 3; i++) {
      const a = VERTICES[i].position
      const b = VERTICES[(i + 1) % 3].position
      const points = [new THREE.Vector3(a[0], 0, a[2]), new THREE.Vector3(b[0], 0, b[2])]
      lines.push(new THREE.BufferGeometry().setFromPoints(points))
    }
    return lines
  }, [])

  return (
    <>
      {edges.map((geo, i) => (
        <threeLine key={i} geometry={geo}>
          <lineBasicMaterial color="#3b82f6" transparent opacity={0.4} linewidth={2} />
        </threeLine>
      ))}
    </>
  )
}

function VertexMarker({
  vertex,
  hovered,
  onHover,
  index,
}: {
  vertex: (typeof VERTICES)[0]
  hovered: string | null
  onHover: (id: string | null) => void
  index: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const isHovered = hovered === vertex.label

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6 + index) * 0.1
    }
  })

  return (
    <group position={[vertex.position[0], 0, vertex.position[2]]}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => onHover(vertex.label)}
        onPointerLeave={() => onHover(null)}
      >
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial
          color={vertex.color}
          roughness={0.3}
          metalness={0.7}
          emissive={vertex.color}
          emissiveIntensity={isHovered ? 0.5 : 0.15}
        />
      </mesh>
      <Text
        position={[0, 0.7, 0]}
        fontSize={0.22}
        color={vertex.color}
        anchorX="center"
      >
        {vertex.label}
      </Text>
    </group>
  )
}

function BlockchainPoint({
  blockchain,
  hovered,
  onHover,
  vertexHovered,
}: {
  blockchain: (typeof BLOCKCHAINS)[0]
  hovered: string | null
  onHover: (id: string | null) => void
  vertexHovered: string | null
}) {
  const [x, y, z] = useMemo(() => baryToCartesian(blockchain.bary), [blockchain.bary])
  const meshRef = useRef<THREE.Mesh>(null)
  const isHovered = hovered === blockchain.name

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = y + Math.sin(state.clock.elapsedTime * 0.8 + x) * 0.12
    }
  })

  // Highlight if nearest to hovered vertex
  const isNearestToVertex = useMemo(() => {
    if (!vertexHovered) return false
    const vIndex = VERTICES.findIndex(v => v.label === vertexHovered)
    if (vIndex === -1) return false
    return blockchain.bary[vIndex] >= 0.35
  }, [vertexHovered, blockchain.bary])

  const dimmed = (hovered !== null && !isHovered) || (vertexHovered !== null && !isNearestToVertex)

  return (
    <group>
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
        <mesh
          ref={meshRef}
          position={[x, y, z]}
          onPointerEnter={() => onHover(blockchain.name)}
          onPointerLeave={() => onHover(null)}
        >
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial
            color={dimmed ? '#1e293b' : blockchain.color}
            roughness={0.3}
            metalness={0.6}
            transparent
            opacity={dimmed ? 0.3 : 0.9}
            emissive={isHovered ? new THREE.Color(blockchain.color) : new THREE.Color(0x000000)}
            emissiveIntensity={isHovered ? 0.5 : 0}
          />
        </mesh>
      </Float>

      <Text
        position={[x, y + 0.5, z]}
        fontSize={0.18}
        color={dimmed ? '#334155' : '#f1f5f9'}
        anchorX="center"
      >
        {blockchain.name}
      </Text>

      {isHovered && (
        <Text
          position={[x, y - 0.4, z]}
          fontSize={0.11}
          color="#94a3b8"
          anchorX="center"
          maxWidth={3}
        >
          {blockchain.desc}
        </Text>
      )}
    </group>
  )
}

function ConnectionLines({
  blockchain,
  isActive,
}: {
  blockchain: (typeof BLOCKCHAINS)[0]
  isActive: boolean
}) {
  const pos = useMemo(() => baryToCartesian(blockchain.bary), [blockchain.bary])

  const lines = useMemo(() => {
    return VERTICES.map((v) => {
      const from = new THREE.Vector3(pos[0], 0.3, pos[2])
      const to = new THREE.Vector3(v.position[0], 0, v.position[2])
      return new THREE.BufferGeometry().setFromPoints([from, to])
    })
  }, [pos])

  if (!isActive) return null

  return (
    <>
      {lines.map((geo, i) => (
        <threeLine key={i} geometry={geo}>
          <lineBasicMaterial color={VERTICES[i].color} transparent opacity={0.3} linewidth={1} />
        </threeLine>
      ))}
    </>
  )
}

function Particles() {
  const positions = useMemo(() => {
    const count = 40
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
      <pointsMaterial color="#3b82f6" size={0.04} transparent opacity={0.25} />
    </points>
  )
}

function Scene() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [vertexHovered, setVertexHovered] = useState<string | null>(null)

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[6, 8, 6]} intensity={1} color="#3b82f6" />
      <pointLight position={[-6, -4, 6]} intensity={0.5} color="#8b5cf6" />
      <fog attach="fog" args={['#09090b', 16, 26]} />
      <Particles />

      <TriangleFace />
      <TriangleEdges />

      {VERTICES.map((v, i) => (
        <VertexMarker key={v.label} vertex={v} hovered={vertexHovered} onHover={setVertexHovered} index={i} />
      ))}

      {BLOCKCHAINS.map((bc) => (
        <BlockchainPoint
          key={bc.name}
          blockchain={bc}
          hovered={hovered}
          onHover={setHovered}
          vertexHovered={vertexHovered}
        />
      ))}

      {BLOCKCHAINS.map((bc) => (
        <ConnectionLines key={`line-${bc.name}`} blockchain={bc} isActive={hovered === bc.name} />
      ))}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.4}
        minDistance={6}
        maxDistance={20}
      />
    </>
  )
}

export default function BlockchainTrilemma({ resetKey }: { resetKey?: number }) {
  return (
    <Canvas
      key={resetKey}
      camera={{ position: [0, 7, 9], fov: 50 }}
      style={{ width: '100%', height: '100%', background: '#09090b' }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  )
}
