'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function NetworkNode() {
    const groupRef = useRef<THREE.Group>(null)

    // Generate random node positions
    const nodeCount = 80
    const edgeCount = 120

    const { positions, colors, edges } = useMemo(() => {
        const pos = new Float32Array(nodeCount * 3)
        const cols = new Float32Array(nodeCount * 3)
        const edgeIndices = []

        const color1 = new THREE.Color('#3b82f6') // Blue
        const color2 = new THREE.Color('#8b5cf6') // Purple
        const color3 = new THREE.Color('#10b981') // Green

        for (let i = 0; i < nodeCount; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 15
            pos[i * 3 + 1] = (Math.random() - 0.5) * 10
            pos[i * 3 + 2] = (Math.random() - 0.5) * 15

            const mixedColor = [color1, color2, color3][Math.floor(Math.random() * 3)]
            cols[i * 3] = mixedColor.r
            cols[i * 3 + 1] = mixedColor.g
            cols[i * 3 + 2] = mixedColor.b
        }

        // Create random connections (edges) between close nodes
        for (let i = 0; i < edgeCount; i++) {
            const a = Math.floor(Math.random() * nodeCount)
            let b = Math.floor(Math.random() * nodeCount)
            while (b === a) b = Math.floor(Math.random() * nodeCount)
            edgeIndices.push(a, b)
        }

        return {
            positions: pos,
            colors: cols,
            edges: new Uint16Array(edgeIndices)
        }
    }, [])

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.05
            groupRef.current.rotation.x += delta * 0.02
        }
    })

    return (
        <group ref={groupRef}>
            {/* The Nodes */}
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={nodeCount} array={positions} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={nodeCount} array={colors} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial
                    size={0.15}
                    vertexColors
                    transparent
                    opacity={0.8}
                    sizeAttenuation
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* The Edges */}
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={nodeCount} array={positions} itemSize={3} />
                    <bufferAttribute attach="index" count={edges.length} array={edges} itemSize={1} />
                </bufferGeometry>
                <lineBasicMaterial color="#3b82f6" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
            </lineSegments>

            {/* Floating abstract glowing block */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
                <mesh position={[0, 0, 0]} scale={2}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshStandardMaterial
                        color="#0f172a"
                        roughness={0.1}
                        metalness={0.9}
                        wireframe
                        emissive="#3b82f6"
                        emissiveIntensity={0.5}
                        transparent
                        opacity={0.6}
                    />
                </mesh>
            </Float>
        </group>
    )
}

function Scene() {
    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#8b5cf6" />
            <NetworkNode />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </>
    )
}

export default function HeroScene() {
    return (
        <Canvas
            camera={{ position: [0, 0, 10], fov: 60 }}
            style={{ width: '100%', height: '100%' }}
            dpr={[1, 1.5]}
        >
            <Scene />
        </Canvas>
    )
}
