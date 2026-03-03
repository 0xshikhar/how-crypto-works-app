'use client'

import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

interface StackItem {
  value: string
  color: string
  label: string
}

interface ExecutionStep {
  opcode: string
  description: string
  stack: StackItem[]
}

const STEPS: ExecutionStep[] = [
  {
    opcode: '',
    description: 'Stack empty',
    stack: [],
  },
  {
    opcode: 'PUSH1 0x03',
    description: 'Push 3 onto stack',
    stack: [{ value: '0x03', color: '#3b82f6', label: '3' }],
  },
  {
    opcode: 'PUSH1 0x05',
    description: 'Push 5 onto stack',
    stack: [
      { value: '0x03', color: '#3b82f6', label: '3' },
      { value: '0x05', color: '#60a5fa', label: '5' },
    ],
  },
  {
    opcode: 'ADD',
    description: 'Pop 3 and 5, push 8',
    stack: [{ value: '0x08', color: '#10b981', label: '8 (result)' }],
  },
  {
    opcode: 'PUSH1 0x02',
    description: 'Push 2 onto stack',
    stack: [
      { value: '0x08', color: '#10b981', label: '8' },
      { value: '0x02', color: '#3b82f6', label: '2' },
    ],
  },
  {
    opcode: 'MUL',
    description: 'Pop 8 and 2, push 16',
    stack: [{ value: '0x10', color: '#f59e0b', label: '16 (result)' }],
  },
  {
    opcode: 'STOP',
    description: 'Execution halted',
    stack: [{ value: '0x10', color: '#f59e0b', label: '16 (final)' }],
  },
]

const STEP_DURATION = 2 // seconds per step
const CYCLE = STEPS.length * STEP_DURATION + 2 // +2 for pause at end

function StackPlate({
  item,
  targetY,
  isNew,
}: {
  item: StackItem
  targetY: number
  isNew: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const currentY = useRef(targetY + 3) // start above for slide-in effect

  useFrame((_, delta) => {
    if (!groupRef.current) return
    // Spring towards target Y
    currentY.current += (targetY - currentY.current) * 6 * delta
    groupRef.current.position.y = currentY.current
  })

  return (
    <group ref={groupRef} position={[0, targetY + 3, 0]}>
      <mesh>
        <cylinderGeometry args={[0.9, 0.9, 0.35, 24]} />
        <meshStandardMaterial
          color={item.color}
          roughness={0.3}
          metalness={0.6}
          transparent
          opacity={0.85}
          emissive={item.color}
          emissiveIntensity={isNew ? 0.3 : 0.1}
        />
      </mesh>
      <Text
        position={[0, 0, 0.95]}
        fontSize={0.16}
        color="#f1f5f9"
        anchorX="center"
      >
        {item.value}
      </Text>
      <Text
        position={[1.3, 0, 0]}
        fontSize={0.12}
        color="#94a3b8"
        anchorX="left"
      >
        {item.label}
      </Text>
    </group>
  )
}

function MemoryPanel() {
  return (
    <group position={[3.5, 0, 0]}>
      <mesh>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.2} transparent opacity={0.5} />
      </mesh>
      <Text position={[0, 1.2, 0.06]} fontSize={0.14} color="#64748b" anchorX="center">
        Memory
      </Text>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[0, 0.6 - i * 0.5, 0.06]}>
          <mesh>
            <boxGeometry args={[1.6, 0.35, 0.02]} />
            <meshStandardMaterial color="#1e293b" transparent opacity={0.4} />
          </mesh>
          <Text fontSize={0.09} color="#475569" anchorX="center">
            {`0x${(i * 32).toString(16).padStart(2, '0')}: 0x00`}
          </Text>
        </group>
      ))}
    </group>
  )
}

function StackBase() {
  return (
    <group position={[0, -2.2, 0]}>
      <mesh>
        <cylinderGeometry args={[1.1, 1.2, 0.15, 24]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.4} transparent opacity={0.6} />
      </mesh>
      <Text position={[0, -0.3, 0]} fontSize={0.12} color="#475569" anchorX="center">
        Stack Bottom
      </Text>
    </group>
  )
}

function Particles() {
  const positions = useMemo(() => {
    const count = 30
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
      <pointsMaterial color="#3b82f6" size={0.04} transparent opacity={0.25} />
    </points>
  )
}

function Scene() {
  const [stepIndex, setStepIndex] = useState(0)
  const [prevStepIndex, setPrevStepIndex] = useState(0)

  useFrame((state) => {
    const t = state.clock.elapsedTime % CYCLE
    const newStep = Math.min(Math.floor(t / STEP_DURATION), STEPS.length - 1)
    if (newStep !== stepIndex) {
      setPrevStepIndex(stepIndex)
      setStepIndex(newStep)
    }
  })

  const currentStep = STEPS[stepIndex]

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#3b82f6" />
      <pointLight position={[-4, 3, 4]} intensity={0.5} color="#10b981" />
      <fog attach="fog" args={['#09090b', 14, 22]} />
      <Particles />

      <StackBase />

      {/* Stack items */}
      {currentStep.stack.map((item, i) => (
        <StackPlate
          key={`${stepIndex}-${i}`}
          item={item}
          targetY={-1.8 + i * 0.55}
          isNew={i === currentStep.stack.length - 1 && stepIndex !== prevStepIndex}
        />
      ))}

      {/* Opcode display */}
      <group position={[-3.5, 2, 0]}>
        <mesh>
          <boxGeometry args={[2.8, 1.8, 0.15]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.3} transparent opacity={0.7} />
        </mesh>
        <Text position={[0, 0.5, 0.09]} fontSize={0.12} color="#64748b" anchorX="center">
          Current Opcode
        </Text>
        <Text position={[0, 0.15, 0.09]} fontSize={0.2} color="#f59e0b" anchorX="center">
          {currentStep.opcode || '—'}
        </Text>
        <Text position={[0, -0.25, 0.09]} fontSize={0.11} color="#94a3b8" anchorX="center" maxWidth={2.4}>
          {currentStep.description}
        </Text>
        <Text position={[0, -0.6, 0.09]} fontSize={0.1} color="#475569" anchorX="center">
          {`Step ${stepIndex + 1}/${STEPS.length}`}
        </Text>
      </group>

      <MemoryPanel />

      {/* Title */}
      <Text position={[0, 3.5, 0]} fontSize={0.2} color="#f1f5f9" anchorX="center">
        EVM Stack Machine
      </Text>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.2}
        minDistance={5}
        maxDistance={16}
      />
    </>
  )
}

export default function EVMStackDiagram({ resetKey }: { resetKey?: number }) {
  return (
    <Canvas
      key={resetKey}
      camera={{ position: [0, 1, 9], fov: 55 }}
      style={{ width: '100%', height: '100%', background: '#09090b' }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  )
}
