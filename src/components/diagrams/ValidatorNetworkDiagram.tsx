'use client'

import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

extend({ ThreeLine: THREE.Line })

const NODE_COUNT = 35
const PROPAGATION_SPEED = 0.4 // seconds per hop
const CYCLE_DURATION = 12 // full cycle

// Deterministic seeded random for consistent layout
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

interface NetworkNode {
  id: number
  position: [number, number, number]
  hopDistance: number
  neighbors: number[]
}

interface NetworkEdge {
  from: number
  to: number
}

function buildNetwork(): { nodes: NetworkNode[]; edges: NetworkEdge[] } {
  const rng = seededRandom(42)
  const nodes: NetworkNode[] = []

  // Place nodes in a 3D sphere
  for (let i = 0; i < NODE_COUNT; i++) {
    const theta = rng() * Math.PI * 2
    const phi = Math.acos(2 * rng() - 1)
    const r = 2 + rng() * 3.5
    nodes.push({
      id: i,
      position: [
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ],
      hopDistance: Infinity,
      neighbors: [],
    })
  }

  // Connect nearby nodes
  const edges: NetworkEdge[] = []
  const distThreshold = 3.2

  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      const dx = nodes[i].position[0] - nodes[j].position[0]
      const dy = nodes[i].position[1] - nodes[j].position[1]
      const dz = nodes[i].position[2] - nodes[j].position[2]
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist < distThreshold) {
        edges.push({ from: i, to: j })
        nodes[i].neighbors.push(j)
        nodes[j].neighbors.push(i)
      }
    }
  }

  // BFS from node 0 (origin)
  const queue = [0]
  nodes[0].hopDistance = 0
  while (queue.length > 0) {
    const current = queue.shift()!
    for (const neighbor of nodes[current].neighbors) {
      if (nodes[neighbor].hopDistance === Infinity) {
        nodes[neighbor].hopDistance = nodes[current].hopDistance + 1
        queue.push(neighbor)
      }
    }
  }

  return { nodes, edges }
}

function NetworkNodeMesh({
  node,
  animationTime,
  hovered,
  onHover,
}: {
  node: NetworkNode
  animationTime: number
  hovered: number | null
  onHover: (id: number | null) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const isHovered = hovered === node.id

  const receiveTime = node.hopDistance * PROPAGATION_SPEED
  const isOrigin = node.hopDistance === 0
  const hasReceived = animationTime >= receiveTime && node.hopDistance !== Infinity
  const isReceiving = animationTime >= receiveTime - 0.2 && animationTime < receiveTime + 0.3 && node.hopDistance !== Infinity

  useFrame(() => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.MeshStandardMaterial

    if (isOrigin) {
      mat.color.set('#f59e0b')
      mat.emissive.set('#f59e0b')
      mat.emissiveIntensity = 0.4
    } else if (isReceiving) {
      mat.color.set('#f59e0b')
      mat.emissive.set('#f59e0b')
      mat.emissiveIntensity = 0.6
    } else if (hasReceived) {
      mat.color.set('#10b981')
      mat.emissive.set('#10b981')
      mat.emissiveIntensity = 0.15
    } else {
      mat.color.set('#334155')
      mat.emissive.set('#000000')
      mat.emissiveIntensity = 0
    }

    if (isHovered) {
      mat.emissiveIntensity = 0.5
    }

    const targetScale = isReceiving ? 1.5 : isHovered ? 1.3 : 1
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
  })

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => onHover(node.id)}
        onPointerLeave={() => onHover(null)}
      >
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.4}
          metalness={0.6}
          transparent
          opacity={0.9}
        />
      </mesh>
      {isHovered && node.hopDistance !== Infinity && (
        <Text position={[0, 0.35, 0]} fontSize={0.12} color="#f1f5f9" anchorX="center">
          {isOrigin ? 'Origin Node' : `Hop ${node.hopDistance} (${(receiveTime * 1000).toFixed(0)}ms)`}
        </Text>
      )}
    </group>
  )
}

function NetworkEdgeLine({
  fromPos,
  toPos,
  fromHop,
  toHop,
  animationTime,
}: {
  fromPos: [number, number, number]
  toPos: [number, number, number]
  fromHop: number
  toHop: number
  animationTime: number
}) {
  const geometry = useMemo(() => {
    const points = [new THREE.Vector3(...fromPos), new THREE.Vector3(...toPos)]
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [fromPos, toPos])

  const minHop = Math.min(fromHop, toHop)
  const receiveTime = minHop * PROPAGATION_SPEED
  const isActive = animationTime >= receiveTime && minHop !== Infinity
  const isFlashing = animationTime >= receiveTime - 0.1 && animationTime < receiveTime + 0.4

  return (
    <threeLine geometry={geometry}>
      <lineBasicMaterial
        color={isFlashing ? '#f59e0b' : isActive ? '#10b981' : '#1e293b'}
        transparent
        opacity={isFlashing ? 0.7 : isActive ? 0.25 : 0.08}
        linewidth={1}
      />
    </threeLine>
  )
}

function PropagationRipple({ animationTime }: { animationTime: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    const radius = animationTime * 2
    meshRef.current.scale.setScalar(radius)
    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    mat.opacity = Math.max(0, 0.15 - animationTime * 0.015)
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color="#f59e0b"
        transparent
        opacity={0.15}
        wireframe
      />
    </mesh>
  )
}

function Scene() {
  const [hovered, setHovered] = useState<number | null>(null)
  const { nodes, edges } = useMemo(() => buildNetwork(), [])
  const animTimeRef = useRef(0)
  const [animTime, setAnimTime] = useState(0)

  useFrame((state) => {
    const t = state.clock.elapsedTime % CYCLE_DURATION
    animTimeRef.current = t
    setAnimTime(t)
  })

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[6, 6, 6]} intensity={1} color="#3b82f6" />
      <pointLight position={[-6, -6, 4]} intensity={0.6} color="#f59e0b" />
      <fog attach="fog" args={['#09090b', 12, 22]} />

      <PropagationRipple animationTime={animTime} />

      {edges.map((edge, i) => (
        <NetworkEdgeLine
          key={i}
          fromPos={nodes[edge.from].position}
          toPos={nodes[edge.to].position}
          fromHop={nodes[edge.from].hopDistance}
          toHop={nodes[edge.to].hopDistance}
          animationTime={animTime}
        />
      ))}

      {nodes.map((node) => (
        <NetworkNodeMesh
          key={node.id}
          node={node}
          animationTime={animTime}
          hovered={hovered}
          onHover={setHovered}
        />
      ))}

      <Text position={[0, -5.5, 0]} fontSize={0.18} color="#94a3b8" anchorX="center">
        Block propagation across P2P network
      </Text>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.5}
        minDistance={5}
        maxDistance={18}
      />
    </>
  )
}

export default function ValidatorNetworkDiagram({ resetKey }: { resetKey?: number }) {
  return (
    <Canvas
      key={resetKey}
      camera={{ position: [0, 2, 10], fov: 55 }}
      style={{ width: '100%', height: '100%', background: '#09090b' }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  )
}
