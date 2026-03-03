'use client'

import { useRef } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

extend({ ThreeLine: THREE.Line })

interface Layer {
    label: string
    sublabel: string
    color: string
    y: number
    scale: number
}

const LAYERS: Layer[] = [
    { label: 'Bitcoin Address', sublabel: 'bc1q...pub key hash', color: '#22c55e', y: -2.4, scale: 1.0 },
    { label: 'Public Key', sublabel: 'Compressed, 33 bytes', color: '#3b82f6', y: -0.8, scale: 0.88 },
    { label: 'Private Key', sublabel: '256-bit secret number', color: '#f59e0b', y: 0.8, scale: 0.76 },
    { label: 'Seed Phrase', sublabel: '12 / 24 BIP-39 words', color: '#a855f7', y: 2.4, scale: 0.64 },
]

function KeyLayer({ layer }: { layer: Layer }) {
    const ref = useRef<THREE.Mesh>(null)
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.25
        }
    })

    return (
        <group position={[0, layer.y, 0]}>
            <mesh ref={ref}>
                <cylinderGeometry args={[layer.scale * 1.6, layer.scale * 1.6, 0.35, 32]} />
                <meshStandardMaterial
                    color={layer.color}
                    roughness={0.3}
                    metalness={0.75}
                    transparent
                    opacity={0.85}
                    emissive={new THREE.Color(layer.color)}
                    emissiveIntensity={0.1}
                />
            </mesh>
            <Text position={[0, 0.3, layer.scale * 1.65]} fontSize={0.2} color="#f1f5f9" anchorX="center">
                {layer.label}
            </Text>
            <Text position={[0, 0.05, layer.scale * 1.65]} fontSize={0.13} color="#94a3b8" anchorX="center">
                {layer.sublabel}
            </Text>
        </group>
    )
}

function ArrowDown({ y }: { y: number }) {
    const from = new THREE.Vector3(0, y + 0.8, 0)
    const to = new THREE.Vector3(0, y, 0)
    const pts = [from, to]
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    return (
        <threeLine geometry={geo}>
            <lineBasicMaterial color="#475569" transparent opacity={0.6} />
        </threeLine>
    )
}

function Scene() {
    return (
        <>
            <ambientLight intensity={0.4} />
            <pointLight position={[4, 4, 4]} intensity={1} color="#a855f7" />
            <pointLight position={[-4, -4, 4]} intensity={0.8} color="#3b82f6" />

            {LAYERS.map((layer) => (
                <KeyLayer key={layer.label} layer={layer} />
            ))}

            {/* One-way arrows */}
            {[-1.6, 0, 1.6].map((y, i) => (
                <ArrowDown key={i} y={y} />
            ))}

            <Text position={[2.6, 0, 0]} fontSize={0.15} color="#64748b" anchorX="center" rotation={[0, 0, -Math.PI / 2]}>
                ← One-way derivation (cannot reverse)
            </Text>

            <OrbitControls autoRotate autoRotateSpeed={0.4} minDistance={5} maxDistance={16} />
        </>
    )
}

export default function WalletDiagram({ resetKey }: { resetKey?: number }) {
    return (
        <Canvas
            key={resetKey}
            camera={{ position: [3, 0, 9], fov: 50 }}
            style={{ width: '100%', height: '100%', background: '#09090b' }}
            dpr={[1, 1.5]}
        >
            <Scene />
        </Canvas>
    )
}
