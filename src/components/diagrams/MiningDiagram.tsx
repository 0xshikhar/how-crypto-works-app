'use client'

import { useRef } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

extend({ ThreeLine: THREE.Line })

function Miner({
    position,
    label,
    speed,
    isWinner,
}: {
    position: [number, number, number]
    label: string
    speed: number
    isWinner: boolean
}) {
    const ref = useRef<THREE.Mesh>(null)
    const progressRef = useRef(0)

    useFrame((state, delta) => {
        if (!ref.current) return
        progressRef.current = (progressRef.current + speed * delta) % 1
        // Pulse effect
        const pulse = Math.sin(state.clock.elapsedTime * speed * 8) * 0.05 + 1
        ref.current.scale.setScalar(pulse)
        if (isWinner && ref.current.material instanceof THREE.MeshStandardMaterial) {
            ref.current.material.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 4) * 0.2
        }
    })

    return (
        <group position={position}>
            <mesh ref={ref}>
                <octahedronGeometry args={[0.55, 0]} />
                <meshStandardMaterial
                    color={isWinner ? '#22c55e' : '#3b82f6'}
                    roughness={0.3}
                    metalness={0.7}
                    emissive={new THREE.Color(isWinner ? '#22c55e' : '#3b82f6')}
                    emissiveIntensity={isWinner ? 0.4 : 0.1}
                />
            </mesh>
            <Text position={[0, -0.9, 0]} fontSize={0.14} color={isWinner ? '#22c55e' : '#94a3b8'} anchorX="center">
                {label}
            </Text>
            <Text position={[0, -1.15, 0]} fontSize={0.12} color="#64748b" anchorX="center">
                {isWinner ? '✓ Found Block!' : 'Hashing...'}
            </Text>
        </group>
    )
}

function Block3D({ position, label }: { position: [number, number, number]; label: string }) {
    const ref = useRef<THREE.Mesh>(null)
    useFrame((_, delta) => {
        if (ref.current) ref.current.rotation.y += delta * 0.4
    })
    return (
        <group position={position}>
            <mesh ref={ref}>
                <boxGeometry args={[1.4, 1.0, 1.0]} />
                <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.7} emissive={new THREE.Color('#f59e0b')} emissiveIntensity={0.3} />
            </mesh>
            <Text position={[0, 0.85, 0]} fontSize={0.2} color="#f59e0b" anchorX="center">
                {label}
            </Text>
        </group>
    )
}

function TargetRing() {
    const ref = useRef<THREE.Mesh>(null)
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.z += 0.01
            if (ref.current.material instanceof THREE.MeshStandardMaterial) {
                ref.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.2
            }
        }
    })
    return (
        <mesh ref={ref} position={[0, 3, 0]}>
            <torusGeometry args={[1.2, 0.06, 8, 32]} />
            <meshStandardMaterial color="#ef4444" transparent opacity={0.6} />
        </mesh>
    )
}

function Scene() {
    const miners = [
        { pos: [-3.5, -1, 1] as [number, number, number], label: 'Miner A', speed: 0.8, isWinner: false },
        { pos: [-1.5, -1, -1] as [number, number, number], label: 'Miner B', speed: 1.2, isWinner: true },
        { pos: [1.5, -1, 1] as [number, number, number], label: 'Miner C', speed: 0.6, isWinner: false },
        { pos: [3.5, -1, -1] as [number, number, number], label: 'Miner D', speed: 1.0, isWinner: false },
    ]

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 5, 5]} intensity={1.2} color="#f59e0b" />
            <pointLight position={[0, -5, 5]} intensity={0.8} color="#3b82f6" />

            {/* New block reward */}
            <Block3D position={[0, 2.8, 0]} label="New Block" />

            {/* Difficulty target ring */}
            <TargetRing />

            <Text position={[0, 5, 0]} fontSize={0.18} color="#94a3b8" anchorX="center">
                Difficulty Target
            </Text>

            {/* Connecting lines from miners to block */}
            {miners.map((m, i) => {
                const from = new THREE.Vector3(...m.pos).add(new THREE.Vector3(0, 0.6, 0))
                const to = new THREE.Vector3(0, 2.2, 0)
                const pts = [from, to]
                const geo = new THREE.BufferGeometry().setFromPoints(pts)
                return (
                    <threeLine key={i} geometry={geo}>
                        <lineBasicMaterial color={m.isWinner ? '#22c55e' : '#1e40af'} transparent opacity={m.isWinner ? 0.8 : 0.2} />
                    </threeLine>
                )
            })}

            {miners.map((m, i) => (
                <Miner key={i} position={m.pos} label={m.label} speed={m.speed} isWinner={m.isWinner} />
            ))}

            <OrbitControls autoRotate autoRotateSpeed={0.5} minDistance={6} maxDistance={16} />
        </>
    )
}

export default function MiningDiagram({ resetKey }: { resetKey?: number }) {
    return (
        <Canvas
            key={resetKey}
            camera={{ position: [0, 2, 11], fov: 55 }}
            style={{ width: '100%', height: '100%', background: '#09090b' }}
            dpr={[1, 1.5]}
        >
            <Scene />
        </Canvas>
    )
}
