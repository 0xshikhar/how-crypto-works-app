'use client'

import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

extend({ ThreeLine: THREE.Line })

interface TreeNode {
  id: number
  hash: string
  level: number
  position: [number, number, number]
  parentId: number | null
  children: number[]
}

function buildTree(): TreeNode[] {
  const leaves = [
    'Tx: Alice→Bob', 'Tx: Carol→Dan', 'Tx: Eve→Frank', 'Tx: Grace→Hank',
    'Tx: Ivy→Jack', 'Tx: Kim→Leo', 'Tx: Mia→Noah', 'Tx: Olga→Pete',
  ]
  const nodes: TreeNode[] = []
  let id = 0

  // Leaf level (level 0)
  const leafSpacing = 1.8
  const leafStartX = -(leaves.length - 1) * leafSpacing / 2
  for (let i = 0; i < leaves.length; i++) {
    nodes.push({
      id: id++,
      hash: simpleHash(leaves[i]),
      level: 0,
      position: [leafStartX + i * leafSpacing, -3, 0],
      parentId: null,
      children: [],
    })
  }

  // Build up levels
  let currentLevel = nodes.filter(n => n.level === 0)
  let level = 1
  while (currentLevel.length > 1) {
    const nextLevel: TreeNode[] = []
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i]
      const right = currentLevel[i + 1]
      const parentX = (left.position[0] + right.position[0]) / 2
      const parentY = -3 + level * 2.2
      const parent: TreeNode = {
        id: id++,
        hash: simpleHash(left.hash + right.hash),
        level,
        position: [parentX, parentY, 0],
        parentId: null,
        children: [left.id, right.id],
      }
      left.parentId = parent.id
      right.parentId = parent.id
      nodes.push(parent)
      nextLevel.push(parent)
    }
    currentLevel = nextLevel
    level++
  }

  return nodes
}

function simpleHash(str: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (h * 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0').slice(0, 6)
}

function getAncestorPath(nodes: TreeNode[], nodeId: number): Set<number> {
  const path = new Set<number>()
  let current: TreeNode | undefined = nodes.find(n => n.id === nodeId)
  while (current) {
    path.add(current.id)
    current = current.parentId !== null ? nodes.find(n => n.id === current!.parentId) : undefined
  }
  return path
}

const LEVEL_COLORS = ['#3b82f6', '#60a5fa', '#8b5cf6', '#f59e0b']

function TreeNodeMesh({
  node,
  isHighlighted,
  isDimmed,
  onHover,
}: {
  node: TreeNode
  isHighlighted: boolean
  isDimmed: boolean
  onHover: (id: number | null) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const baseY = node.position[1]

  useFrame((state) => {
    if (!meshRef.current) return
    const bob = Math.sin(state.clock.elapsedTime * 0.8 + node.level * 1.2) * 0.08
    meshRef.current.position.y = baseY + bob
    const targetScale = isHighlighted ? 1.25 : isDimmed ? 0.75 : 1
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
  })

  const radius = node.level === 3 ? 0.45 : node.level === 0 ? 0.25 : 0.35
  const color = LEVEL_COLORS[node.level] || '#3b82f6'

  return (
    <group>
      <mesh
        ref={meshRef}
        position={node.position}
        onPointerEnter={() => onHover(node.id)}
        onPointerLeave={() => onHover(null)}
      >
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial
          color={isDimmed ? '#1e293b' : color}
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={isDimmed ? 0.3 : 0.9}
          emissive={isHighlighted ? new THREE.Color(color) : new THREE.Color(0x000000)}
          emissiveIntensity={isHighlighted ? 0.5 : 0}
        />
      </mesh>
      <Text
        position={[node.position[0], node.position[1] - radius - 0.25, node.position[2] + 0.01]}
        fontSize={0.15}
        color={isDimmed ? '#334155' : '#94a3b8'}
        anchorX="center"
        anchorY="middle"
      >
        {node.level === 3 ? 'ROOT' : node.hash}
      </Text>
    </group>
  )
}

function TreeEdge({
  from,
  to,
  isHighlighted,
  isDimmed,
}: {
  from: [number, number, number]
  to: [number, number, number]
  isHighlighted: boolean
  isDimmed: boolean
}) {
  const points = useMemo(
    () => [new THREE.Vector3(...from), new THREE.Vector3(...to)],
    [from, to]
  )
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  return (
    <threeLine geometry={geometry}>
      <lineBasicMaterial
        color={isHighlighted ? '#f59e0b' : '#3b82f6'}
        transparent
        opacity={isDimmed ? 0.08 : isHighlighted ? 0.9 : 0.3}
        linewidth={2}
      />
    </threeLine>
  )
}

function Particles() {
  const positions = useMemo(() => {
    const count = 50
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12
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
      <pointsMaterial color="#3b82f6" size={0.04} transparent opacity={0.35} />
    </points>
  )
}

function Scene() {
  const [hovered, setHovered] = useState<number | null>(null)
  const nodes = useMemo(() => buildTree(), [])
  const ancestorPath = useMemo(
    () => (hovered !== null ? getAncestorPath(nodes, hovered) : new Set<number>()),
    [hovered, nodes]
  )

  // Build edges
  const edges = useMemo(() => {
    const e: { from: [number, number, number]; to: [number, number, number]; parentId: number; childId: number }[] = []
    for (const node of nodes) {
      for (const childId of node.children) {
        const child = nodes.find(n => n.id === childId)!
        e.push({ from: node.position, to: child.position, parentId: node.id, childId })
      }
    }
    return e
  }, [nodes])

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[6, 6, 6]} intensity={1.2} color="#3b82f6" />
      <pointLight position={[-6, -4, 4]} intensity={0.6} color="#8b5cf6" />
      <fog attach="fog" args={['#09090b', 14, 24]} />
      <Particles />

      {edges.map((edge, i) => {
        const highlighted = ancestorPath.has(edge.parentId) && ancestorPath.has(edge.childId)
        const dimmed = hovered !== null && !highlighted
        return (
          <TreeEdge
            key={i}
            from={edge.from}
            to={edge.to}
            isHighlighted={highlighted}
            isDimmed={dimmed}
          />
        )
      })}

      {nodes.map((node) => {
        const highlighted = ancestorPath.has(node.id)
        const dimmed = hovered !== null && !highlighted
        return (
          <TreeNodeMesh
            key={node.id}
            node={node}
            isHighlighted={highlighted}
            isDimmed={dimmed}
            onHover={setHovered}
          />
        )
      })}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.3}
        minDistance={5}
        maxDistance={18}
      />
    </>
  )
}

export default function MerkleTreeDiagram({ resetKey }: { resetKey?: number }) {
  return (
    <Canvas
      key={resetKey}
      camera={{ position: [0, 0.5, 12], fov: 55 }}
      style={{ width: '100%', height: '100%', background: '#09090b' }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  )
}
