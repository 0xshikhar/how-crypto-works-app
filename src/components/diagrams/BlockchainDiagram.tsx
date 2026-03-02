'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

const BLOCK_DATA = [
  { id: '000a3f...', tx: '3 txns', hash: 'acdf12...', color: '#3b82f6' },
  { id: '001d9c...', tx: '7 txns', hash: 'e72f89...', color: '#60a5fa' },
  { id: '002b8e...', tx: '5 txns', hash: '4a91c2...', color: '#93c5fd' },
  { id: '003f12...', tx: '2 txns', hash: 'b38d54...', color: '#bfdbfe' },
]

function Block({
  position,
  data,
  index,
  hovered,
  onHover,
}: {
  position: [number, number, number]
  data: (typeof BLOCK_DATA)[0]
  index: number
  hovered: number | null
  onHover: (i: number | null) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const isHovered = hovered === index
  const isGrayed = hovered !== null && !isHovered

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const targetY = isHovered ? 0.2 : 0
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 6 * delta
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => onHover(index)}
        onPointerLeave={() => onHover(null)}
      >
        <boxGeometry args={[1.6, 1.1, 1]} />
        <meshStandardMaterial
          color={isGrayed ? '#1e293b' : data.color}
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={isGrayed ? 0.4 : 0.9}
          emissive={isHovered ? new THREE.Color(data.color) : new THREE.Color(0x000000)}
          emissiveIntensity={isHovered ? 0.3 : 0}
        />
      </mesh>
      {/* Block label */}
      <Text
        position={[0, 0, 0.52]}
        fontSize={0.11}
        color={isGrayed ? '#475569' : '#f1f5f9'}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {`Block\n#${data.id.slice(0, 6)}\n${data.tx}`}
      </Text>
    </group>
  )
}

function Chain({ from, to, opacity }: { from: [number, number, number]; to: [number, number, number]; opacity: number }) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)]
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  return (
    <threeLine geometry={geometry}>
      <lineBasicMaterial color="#3b82f6" transparent opacity={opacity} linewidth={2} />
    </threeLine>
  )
}

function Particles() {
  const count = 60
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 14
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return (
    <points geometry={geo}>
      <pointsMaterial color="#3b82f6" size={0.04} transparent opacity={0.4} />
    </points>
  )
}

function Scene() {
  const [hovered, setHovered] = useState<number | null>(null)
  const spacing = 2.4

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#3b82f6" />
      <pointLight position={[-5, -5, 5]} intensity={0.6} color="#60a5fa" />
      <fog attach="fog" args={['#09090b', 12, 20]} />
      <Particles />

      {BLOCK_DATA.map((block, i) => (
        <Block
          key={block.id}
          position={[i * spacing - (BLOCK_DATA.length - 1) * spacing / 2, 0, 0]}
          data={block}
          index={i}
          hovered={hovered}
          onHover={setHovered}
        />
      ))}

      {/* Chain links */}
      {BLOCK_DATA.slice(0, -1).map((_, i) => (
        <Chain
          key={i}
          from={[i * spacing - (BLOCK_DATA.length - 1) * spacing / 2 + 0.82, 0, 0]}
          to={[(i + 1) * spacing - (BLOCK_DATA.length - 1) * spacing / 2 - 0.82, 0, 0]}
          opacity={hovered === null || hovered === i || hovered === i + 1 ? 0.7 : 0.15}
        />
      ))}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.6}
        minDistance={4}
        maxDistance={14}
      />
    </>
  )
}

export default function BlockchainDiagram({ resetKey }: { resetKey?: number }) {
  return (
    <Canvas
      key={resetKey}
      camera={{ position: [0, 2, 8], fov: 55 }}
      style={{ width: '100%', height: '100%', background: '#09090b' }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  )
}
