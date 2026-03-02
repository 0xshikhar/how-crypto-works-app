'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Float } from '@react-three/drei'
import * as THREE from 'three'

function UTXO({
    position,
    label,
    amount,
    color,
    isInput,
}: {
    position: [number, number, number]
    label: string
    amount: string
    color: string
    isInput: boolean
}) {
    const mesh = useRef<THREE.Mesh>(null)
    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * (isInput ? 0.6 : 0.7) + (isInput ? 0 : 1)) * 0.1
        }
    })

    return (
        <group position={position}>
            <Float speed={1.5} floatIntensity={0.3}>
                <mesh ref={mesh}>
                    <cylinderGeometry args={[0.55, 0.55, 0.25, 8]} />
                    <meshStandardMaterial
                        color={color}
                        roughness={0.3}
                        metalness={0.7}
                        emissive={new THREE.Color(color)}
                        emissiveIntensity={0.15}
                    />
                </mesh>
                <Text position={[0, 0.2, 0]} fontSize={0.12} color="#f1f5f9" anchorX="center">
                    {label}
                </Text>
                <Text position={[0, -0.02, 0]} fontSize={0.15} color="#f59e0b" anchorX="center" fontWeight={700}>
                    {amount}
                </Text>
            </Float>
        </group>
    )
}

function TxBox() {
    return (
        <group position={[0, 0, 0]}>
            <mesh>
                <boxGeometry args={[1.8, 2, 0.5]} />
                <meshStandardMaterial color="#1d4ed8" roughness={0.2} metalness={0.8} emissive={new THREE.Color('#1d4ed8')} emissiveIntensity={0.25} />
            </mesh>
            <Text position={[0, 0.1, 0.26]} fontSize={0.18} color="white" anchorX="center">
                {'TRANSACTION'}
            </Text>
            <Text position={[0, -0.25, 0.26]} fontSize={0.12} color="#93c5fd" anchorX="center">
                {'Fee: 0.0001 BTC'}
            </Text>
        </group>
    )
}

function FlowLine({ from, to, color }: { from: [number, number, number]; to: [number, number, number]; color: string }) {
    const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)]
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return (
        <threeLine geometry={geo}>
            <lineBasicMaterial color={color} transparent opacity={0.6} />
        </threeLine>
    )
}

function Scene() {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[4, 4, 4]} intensity={1} color="#3b82f6" />
            <pointLight position={[-4, -4, 4]} intensity={0.8} color="#f59e0b" />

            {/* Inputs */}
            <UTXO position={[-3.5, 0.9, 0]} label="UTXO #1" amount="0.5 BTC" color="#1e3a5f" isInput={true} />
            <UTXO position={[-3.5, -0.9, 0]} label="UTXO #2" amount="0.3 BTC" color="#1e3a5f" isInput={true} />

            {/* Input label */}
            <Text position={[-3.5, 2.1, 0]} fontSize={0.16} color="#64748b" anchorX="center">
                INPUTS (spent UTXOs)
            </Text>

            {/* Transaction box */}
            <TxBox />

            {/* Outputs */}
            <UTXO position={[3.5, 1, 0]} label="Recipient" amount="0.7 BTC" color="#163a20" isInput={false} />
            <UTXO position={[3.5, -1, 0]} label="Change" amount="0.099 BTC" color="#3b1f0a" isInput={false} />

            {/* Output label */}
            <Text position={[3.5, 2.1, 0]} fontSize={0.16} color="#64748b" anchorX="center">
                OUTPUTS (new UTXOs)
            </Text>

            {/* Flow lines */}
            <FlowLine from={[-2.8, 0.9, 0]} to={[-0.9, 0.4, 0]} color="#3b82f6" />
            <FlowLine from={[-2.8, -0.9, 0]} to={[-0.9, -0.4, 0]} color="#3b82f6" />
            <FlowLine from={[0.9, 0.4, 0]} to={[2.8, 1, 0]} color="#22c55e" />
            <FlowLine from={[0.9, -0.4, 0]} to={[2.8, -1, 0]} color="#f59e0b" />

            <OrbitControls autoRotate autoRotateSpeed={0.4} enablePan={false} minDistance={5} maxDistance={14} />
        </>
    )
}

export default function TransactionDiagram({ resetKey }: { resetKey?: number }) {
    return (
        <Canvas
            key={resetKey}
            camera={{ position: [0, 2, 9], fov: 55 }}
            style={{ width: '100%', height: '100%', background: '#09090b' }}
            dpr={[1, 1.5]}
        >
            <Scene />
        </Canvas>
    )
}
