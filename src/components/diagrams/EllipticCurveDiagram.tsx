'use client'

import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

extend({ ThreeLine: THREE.Line })

// Generate y²=x³+7 curve points (real-number simplification of secp256k1)
function generateCurvePoints(): { upper: THREE.Vector3[]; lower: THREE.Vector3[] } {
  const upper: THREE.Vector3[] = []
  const lower: THREE.Vector3[] = []
  const xStart = -1.91 // cube root of 7 is ~1.913 so x > -1.913 for real solutions
  const xEnd = 3.5
  const steps = 200

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const x = xStart + t * (xEnd - xStart)
    const val = x * x * x + 7
    if (val >= 0) {
      const y = Math.sqrt(val)
      upper.push(new THREE.Vector3(x, y, 0))
      lower.push(new THREE.Vector3(x, -y, 0))
    }
  }

  return { upper, lower }
}

// Point on curve: given x, returns y (positive)
function curveY(x: number): number {
  const val = x * x * x + 7
  return val >= 0 ? Math.sqrt(val) : Number.NaN
}

function CurveLine({ points, color, opacity = 0.8 }: { points: THREE.Vector3[]; color: string; opacity?: number }) {
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])
  return (
    <threeLine geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} linewidth={2} />
    </threeLine>
  )
}

function CurvePoint({
  position,
  color,
  label,
  isHovered,
  onHover,
  id,
}: {
  position: [number, number, number]
  color: string
  label: string
  isHovered: boolean
  onHover: (id: string | null) => void
  id: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.02
      meshRef.current.scale.setScalar(isHovered ? 1.3 + pulse : 1 + pulse)
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => onHover(id)}
        onPointerLeave={() => onHover(null)}
      >
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.6}
          emissive={color}
          emissiveIntensity={isHovered ? 0.6 : 0.2}
        />
      </mesh>
      <Text position={[0, 0.3, 0]} fontSize={0.14} color={color} anchorX="center">
        {label}
      </Text>
    </group>
  )
}

function AdditionVisualization({ showLine }: { showLine: boolean }) {
  // P and Q on the curve
  const pX = -1.5
  const pY = curveY(pX)
  const qX = 0.5
  const qY = curveY(qX)
  const isValid = Number.isFinite(pY) && Number.isFinite(qY)

  // Line through P and Q: y = mx + b
  const m = isValid ? (qY - pY) / (qX - pX) : 0
  const b = isValid ? pY - m * pX : 0

  // Find intersection: substitute into y² = x³ + 7
  // (mx + b)² = x³ + 7
  const rX = isValid ? m * m - pX - qX : 0 // third intersection x on y^2 = x^3 + 7
  const rY = isValid ? m * rX + b : 0
  const reflectedY = -rY // P + Q = reflected point

  const lineGeo = useMemo(() => {
    if (!showLine || !isValid) return null
    const points = [
      new THREE.Vector3(pX - 1, pY - m, 0),
      new THREE.Vector3(rX + 0.5, m * (rX + 0.5) + b, 0),
    ]
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [showLine, isValid, pX, pY, m, b, rX])

  const reflectGeo = useMemo(() => {
    if (!showLine || !isValid) return null
    const points = [
      new THREE.Vector3(rX, rY, 0),
      new THREE.Vector3(rX, reflectedY, 0),
    ]
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [showLine, isValid, rX, rY, reflectedY])

  if (!showLine || !isValid) return null

  return (
    <>
      {lineGeo && (
        <threeLine geometry={lineGeo}>
          <lineBasicMaterial color="#f59e0b" transparent opacity={0.6} linewidth={2} />
        </threeLine>
      )}
      {reflectGeo && (
        <threeLine geometry={reflectGeo}>
          <lineBasicMaterial color="#f59e0b" transparent opacity={0.4} linewidth={1} />
        </threeLine>
      )}
      {/* R' intersection point */}
      <mesh position={[rX, rY, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#64748b" transparent opacity={0.6} />
      </mesh>
      {/* R = P + Q (reflected) */}
      <mesh position={[rX, reflectedY, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.4} />
      </mesh>
      <Text position={[rX + 0.3, reflectedY, 0]} fontSize={0.14} color="#10b981" anchorX="left">
        R = P + Q
      </Text>
    </>
  )
}

function MultiplicationTrail() {
  const trailRef = useRef<THREE.Group>(null)
  const trailPoints = useMemo(() => {
    // Simulate scalar multiplication: G, 2G, 3G, ...
    const points: { x: number; y: number; label: string }[] = []
    const xValues = [-1.7, -1.2, -0.3, 0.8, 1.5, 2.2, 2.8]
    for (let i = 0; i < xValues.length; i++) {
      const x = xValues[i]
      const y = -curveY(x) // lower half of curve for trail
      if (Number.isFinite(y)) {
        points.push({ x, y, label: `${i + 1}G` })
      }
    }
    return points
  }, [])

  useFrame((state) => {
    if (!trailRef.current) return
    const visibleCount = Math.floor((state.clock.elapsedTime * 0.5) % (trailPoints.length + 2))
    trailRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      if (mesh.material && 'opacity' in mesh.material) {
        (mesh.material as THREE.MeshStandardMaterial).opacity = i < visibleCount ? 0.7 - i * 0.08 : 0
      }
    })
  })

  return (
    <group ref={trailRef}>
      {trailPoints.map((pt, i) => (
        <mesh key={i} position={[pt.x, pt.y, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#8b5cf6" transparent opacity={0} emissive="#8b5cf6" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function Axes() {
  const xGeo = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-3, 0, 0),
      new THREE.Vector3(4.5, 0, 0),
    ])
  }, [])
  const yGeo = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -5, 0),
      new THREE.Vector3(0, 5, 0),
    ])
  }, [])

  return (
    <>
      <threeLine geometry={xGeo}>
        <lineBasicMaterial color="#334155" transparent opacity={0.4} />
      </threeLine>
      <threeLine geometry={yGeo}>
        <lineBasicMaterial color="#334155" transparent opacity={0.4} />
      </threeLine>
    </>
  )
}

function Particles() {
  const positions = useMemo(() => {
    const count = 40
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14
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
      <pointsMaterial color="#8b5cf6" size={0.04} transparent opacity={0.25} />
    </points>
  )
}

function Scene() {
  const [hovered, setHovered] = useState<string | null>(null)
  const { upper, lower } = useMemo(() => generateCurvePoints(), [])
  const showAdditionLine = hovered === 'P' || hovered === 'Q'

  const pX = -1.5
  const pY = curveY(pX)
  const qX = 0.5
  const qY = curveY(qX)
  const gY = curveY(-1.7)
  const isPValid = Number.isFinite(pY)
  const isQValid = Number.isFinite(qY)
  const isGValid = Number.isFinite(gY)

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[6, 6, 6]} intensity={1} color="#3b82f6" />
      <pointLight position={[-6, -6, 4]} intensity={0.5} color="#8b5cf6" />
      <fog attach="fog" args={['#09090b', 14, 24]} />
      <Particles />
      <Axes />

      {/* The curve y² = x³ + 7 */}
      <CurveLine points={upper} color="#3b82f6" />
      <CurveLine points={lower} color="#3b82f6" />

      {/* Points P and Q */}
      {isPValid && (
        <CurvePoint
          position={[pX, pY, 0]}
          color="#f59e0b"
          label="P"
          isHovered={hovered === 'P'}
          onHover={setHovered}
          id="P"
        />
      )}
      {isQValid && (
        <CurvePoint
          position={[qX, qY, 0]}
          color="#f59e0b"
          label="Q"
          isHovered={hovered === 'Q'}
          onHover={setHovered}
          id="Q"
        />
      )}

      {/* Generator point G */}
      {isGValid && (
        <CurvePoint
          position={[-1.7, -gY, 0]}
          color="#8b5cf6"
          label="G (Generator)"
          isHovered={hovered === 'G'}
          onHover={setHovered}
          id="G"
        />
      )}

      <AdditionVisualization showLine={showAdditionLine} />
      <MultiplicationTrail />

      {/* Equation label */}
      <Text position={[0, 5.5, 0]} fontSize={0.22} color="#94a3b8" anchorX="center">
        {'y\u00B2 = x\u00B3 + 7  (secp256k1)'}
      </Text>
      <Text position={[0, -5.5, 0]} fontSize={0.14} color="#64748b" anchorX="center">
        Hover P or Q to see point addition
      </Text>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.2}
        minDistance={5}
        maxDistance={18}
      />
    </>
  )
}

export default function EllipticCurveDiagram({ resetKey }: { resetKey?: number }) {
  return (
    <Canvas
      key={resetKey}
      camera={{ position: [0, 0, 10], fov: 55 }}
      style={{ width: '100%', height: '100%', background: '#09090b' }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  )
}
