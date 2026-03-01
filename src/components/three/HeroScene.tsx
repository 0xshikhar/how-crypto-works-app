'use client'

import { Canvas } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function FloatingBlock({ position, scale, speed }: { position: [number, number, number]; scale: number; speed: number }) {
    const meshRef = useRef<THREE.Mesh>(null)

    return (
        <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
            <mesh ref={meshRef} position={position} scale={scale}>
                <boxGeometry args={[1, 1, 1]} />
                <MeshDistortMaterial
                    color="#3b82f6"
                    roughness={0.4}
                    metalness={0.8}
                    distort={0.2}
                    speed={2}
                    transparent
                    opacity={0.15}
                />
            </mesh>
        </Float>
    )
}

function ChainLink({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({ color: '#3b82f6', transparent: true, opacity: 0.1 })

    return <primitive object={new THREE.Line(geometry, material)} />
}

function Scene() {
    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.5} color="#3b82f6" />
            <pointLight position={[-10, -10, -10]} intensity={0.3} color="#60a5fa" />

            <FloatingBlock position={[-4, 2, -5]} scale={1.5} speed={1.2} />
            <FloatingBlock position={[3, -1, -4]} scale={1.2} speed={1.5} />
            <FloatingBlock position={[-1, -2, -6]} scale={1.8} speed={0.8} />
            <FloatingBlock position={[5, 1, -7]} scale={1} speed={2} />
            <FloatingBlock position={[-3, -3, -3]} scale={0.8} speed={1.8} />
            <FloatingBlock position={[0, 3, -8]} scale={2} speed={0.6} />
            <FloatingBlock position={[4, -3, -5]} scale={1.3} speed={1.4} />

            <ChainLink start={[-4, 2, -5]} end={[3, -1, -4]} />
            <ChainLink start={[3, -1, -4]} end={[-1, -2, -6]} />
            <ChainLink start={[-1, -2, -6]} end={[5, 1, -7]} />
            <ChainLink start={[5, 1, -7]} end={[0, 3, -8]} />
        </>
    )
}

export default function HeroScene() {
    return (
        <Canvas
            camera={{ position: [0, 0, 8], fov: 60 }}
            style={{ width: '100%', height: '100%' }}
            dpr={[1, 1.5]}
        >
            <Scene />
        </Canvas>
    )
}
