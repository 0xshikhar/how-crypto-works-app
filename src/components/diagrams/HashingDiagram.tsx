'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

// Simple hash function for visualization
function simpleHash(str: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (h * 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0').toUpperCase()
}

function Panel({
  position,
  size,
  color,
  label,
  value,
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  label: string
  value: string
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} transparent opacity={0.85} />
      </mesh>
      <Text position={[0, size[1] / 2 + 0.2, size[2] / 2 + 0.01]} fontSize={0.18} color="#94a3b8" anchorX="center">
        {label}
      </Text>
      <Text position={[0, -0.05, size[2] / 2 + 0.01]} fontSize={0.14} color="#f1f5f9" anchorX="center" maxWidth={size[0] - 0.2}>
        {value.slice(0, 12)}
      </Text>
    </group>
  )
}

function Arrow({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)]
  const geo = new THREE.BufferGeometry().setFromPoints(points)
  return (
    <threeLine geometry={geo}>
      <lineBasicMaterial color="#f59e0b" linewidth={3} />
    </threeLine>
  )
}

function HashMachine({ input }: { input: string }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15
    }
  })

  const hash = simpleHash(input)
  const shortInput = input.slice(0, 12) || '(empty)'

  return (
    <group ref={groupRef}>
      {/* Input box */}
      <Panel
        position={[-3.5, 0, 0]}
        size={[2.6, 1.2, 0.5]}
        color="#1e3a5f"
        label="INPUT"
        value={shortInput}
      />

      {/* Arrow in */}
      <Arrow from={[-2.2, 0, 0]} to={[-1.4, 0, 0]} />

      {/* SHA-256 box */}
      <group position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[2.4, 1.6, 0.8]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.2} metalness={0.8} emissive={new THREE.Color('#1d4ed8')} emissiveIntensity={0.2} />
        </mesh>
        <Text position={[0, 0, 0.41]} fontSize={0.2} color="white" anchorX="center">
          {'SHA-256\nOne-Way'}
        </Text>
      </group>

      {/* Arrow out */}
      <Arrow from={[1.4, 0, 0]} to={[2.2, 0, 0]} />

      {/* Output box */}
      <Panel
        position={[3.5, 0, 0]}
        size={[2.6, 1.2, 0.5]}
        color="#163a20"
        label="OUTPUT (HASH)"
        value={hash}
      />
    </group>
  )
}

export default function HashingDiagram({ resetKey }: { resetKey?: number }) {
  const [input, setInput] = useState('Hello, Bitcoin!')

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Interactive input */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type anything..."
          className="px-3 py-2 rounded-lg bg-surface-light border border-border text-sm text-foreground placeholder-muted-dark focus:outline-none focus:border-accent w-52"
        />
        <div className="px-3 py-2 rounded-lg bg-surface border border-border text-xs font-mono text-accent">
          → {simpleHash(input)}
        </div>
      </div>

      <Canvas
        key={resetKey}
        camera={{ position: [0, 1.5, 7], fov: 55 }}
        style={{ width: '100%', height: '100%', background: '#09090b' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#3b82f6" />
        <pointLight position={[-3, 3, 3]} intensity={0.8} color="#f59e0b" />
        <HashMachine input={input} />
        <OrbitControls enablePan={false} minDistance={4} maxDistance={12} />
      </Canvas>
    </div>
  )
}
