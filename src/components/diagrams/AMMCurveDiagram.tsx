'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

extend({ ThreeLine: THREE.Line })

function generateCurvePoints(k: number, steps: number = 120): Float32Array {
  const positions = new Float32Array(steps * 3)
  const xMin = Math.sqrt(k) * 0.15
  const xMax = Math.sqrt(k) * 3
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const x = xMin + t * (xMax - xMin)
    const y = k / x
    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = 0
  }
  return positions
}

function CurveRibbon({ k, color, opacity = 0.9 }: { k: number; color: string; opacity?: number }) {
  const positions = useMemo(() => generateCurvePoints(k), [k])
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (let i = 0; i < positions.length / 3; i++) {
      points.push(new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [positions])

  return (
    <threeLine geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} linewidth={2} />
    </threeLine>
  )
}

function TradeMarker() {
  const markerBeforeRef = useRef<THREE.Mesh>(null)
  const markerAfterRef = useRef<THREE.Mesh>(null)
  const arrowGroupRef = useRef<THREE.Group>(null)

  const k = 20

  useFrame((state) => {
    const t = (Math.sin(state.clock.elapsedTime * 0.4) + 1) / 2
    const xBefore = 2 + t * 3
    const yBefore = k / xBefore
    const tradeAmount = 1.2
    const xAfter = xBefore + tradeAmount
    const yAfter = k / xAfter

    if (markerBeforeRef.current) {
      markerBeforeRef.current.position.set(xBefore, yBefore, 0)
    }
    if (markerAfterRef.current) {
      markerAfterRef.current.position.set(xAfter, yAfter, 0)
    }
    if (arrowGroupRef.current) {
      arrowGroupRef.current.position.set((xBefore + xAfter) / 2, (yBefore + yAfter) / 2, 0)
    }
  })

  return (
    <>
      {/* Before trade marker */}
      <mesh ref={markerBeforeRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.4} />
      </mesh>

      {/* After trade marker */}
      <mesh ref={markerAfterRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} />
      </mesh>

      {/* Direction indicator */}
      <group ref={arrowGroupRef}>
        <Text position={[0, 0.35, 0]} fontSize={0.14} color="#94a3b8" anchorX="center">
          {'Trade ->'}
        </Text>
      </group>
    </>
  )
}

function PriceImpactArea() {
  const meshRef = useRef<THREE.Mesh>(null)
  const k = 20

  useFrame((state) => {
    if (!meshRef.current) return
    const t = (Math.sin(state.clock.elapsedTime * 0.4) + 1) / 2
    const xBefore = 2 + t * 3
    const yBefore = k / xBefore
    const tradeAmount = 1.2
    const xAfter = xBefore + tradeAmount
    const yAfter = k / xAfter

    const width = Math.abs(xAfter - xBefore)
    const height = Math.abs(yBefore - yAfter)
    meshRef.current.scale.set(width, height, 1)
    meshRef.current.position.set(
      (xBefore + xAfter) / 2,
      (yBefore + yAfter) / 2,
      -0.01
    )
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#ef4444" transparent opacity={0.12} side={THREE.DoubleSide} />
    </mesh>
  )
}

function AxisLabels() {
  return (
    <>
      {/* X axis */}
      <Text position={[5, -0.4, 0]} fontSize={0.2} color="#94a3b8" anchorX="center">
        {'Token A Reserve ->'}
      </Text>
      {/* Y axis */}
      <Text position={[-0.6, 5, 0]} fontSize={0.2} color="#94a3b8" anchorX="center" rotation={[0, 0, Math.PI / 2]}>
        {'Token B Reserve ->'}
      </Text>
      {/* K labels */}
      <Text position={[7, 1.5, 0]} fontSize={0.16} color="#3b82f6" anchorX="left">
        k = 20 (deep pool)
      </Text>
      <Text position={[5.5, 0.8, 0]} fontSize={0.16} color="#8b5cf6" anchorX="left">
        k = 8 (shallow pool)
      </Text>
    </>
  )
}

function Axes() {
  const xAxis = useMemo(() => {
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(9, 0, 0)]
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])
  const yAxis = useMemo(() => {
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 9, 0)]
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])

  return (
    <>
      <threeLine geometry={xAxis}>
        <lineBasicMaterial color="#334155" transparent opacity={0.5} />
      </threeLine>
      <threeLine geometry={yAxis}>
        <lineBasicMaterial color="#334155" transparent opacity={0.5} />
      </threeLine>
    </>
  )
}

function Particles() {
  const positions = useMemo(() => {
    const count = 40
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = Math.random() * 12
      pos[i * 3 + 1] = Math.random() * 12
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4
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
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[8, 8, 6]} intensity={1} color="#3b82f6" />
      <pointLight position={[-4, -4, 4]} intensity={0.6} color="#f59e0b" />
      <fog attach="fog" args={['#09090b', 16, 26]} />
      <Particles />

      {/* Deep pool curve (k=20) */}
      <CurveRibbon k={20} color="#3b82f6" />

      {/* Shallow pool curve (k=8) */}
      <CurveRibbon k={8} color="#8b5cf6" opacity={0.5} />

      <Axes />
      <AxisLabels />
      <TradeMarker />
      <PriceImpactArea />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.3}
        minDistance={5}
        maxDistance={20}
        target={[4, 4, 0]}
      />
    </>
  )
}

export default function AMMCurveDiagram({ resetKey }: { resetKey?: number }) {
  return (
    <Canvas
      key={resetKey}
      camera={{ position: [4, 4, 12], fov: 50 }}
      style={{ width: '100%', height: '100%', background: '#09090b' }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  )
}
