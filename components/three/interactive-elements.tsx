'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  Float, 
  MeshDistortMaterial,
  Sphere,
  Environment,
} from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

// ==================== INTERACTIVE ORB ====================

interface InteractiveOrbProps {
  color?: string
  hoverColor?: string
  size?: number
  onClick?: () => void
}

export function InteractiveOrb({ 
  color = '#ff6b35', 
  hoverColor = '#ff8c5a',
  size = 1,
  onClick 
}: InteractiveOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2
    }
  })

  const handlePointerOver = () => {
    if (materialRef.current) {
      gsap.to(materialRef.current.color, {
        r: new THREE.Color(hoverColor).r,
        g: new THREE.Color(hoverColor).g,
        b: new THREE.Color(hoverColor).b,
        duration: 0.3,
      })
    }
    if (meshRef.current) {
      gsap.to(meshRef.current.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.3 })
    }
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    if (materialRef.current) {
      gsap.to(materialRef.current.color, {
        r: new THREE.Color(color).r,
        g: new THREE.Color(color).g,
        b: new THREE.Color(color).b,
        duration: 0.3,
      })
    }
    if (meshRef.current) {
      gsap.to(meshRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.3 })
    }
    document.body.style.cursor = 'auto'
  }

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1}
        />
      </mesh>
    </Float>
  )
}

// ==================== GRADIENT ORB WITH GLOW ====================

export function GlowOrb({ position = [0, 0, 0], color = '#ff6b35', intensity = 1 }: {
  position?: [number, number, number]
  color?: string
  intensity?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.3
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05)
    }
  })

  return (
    <group position={position}>
      {/* Inner orb */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.8, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          distort={0.4}
          speed={3}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Outer glow */}
      <mesh ref={glowRef} scale={1.2}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15 * intensity}
        />
      </mesh>
    </group>
  )
}

// ==================== DNA HELIX ====================

export function DNAHelix({ color1 = '#ff6b35', color2 = '#2ec4b6', segments = 20 }) {
  const groupRef = useRef<THREE.Group>(null)

  const helixData = useMemo(() => {
    const data = []
    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 4
      const y = (i / segments) * 4 - 2
      data.push({
        pos1: [Math.cos(t) * 0.5, y, Math.sin(t) * 0.5] as [number, number, number],
        pos2: [Math.cos(t + Math.PI) * 0.5, y, Math.sin(t + Math.PI) * 0.5] as [number, number, number],
      })
    }
    return data
  }, [segments])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      {helixData.map((point, i) => (
        <group key={i}>
          <mesh position={point.pos1}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color={color1} metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={point.pos2}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color={color2} metalness={0.8} roughness={0.2} />
          </mesh>
          {i % 3 === 0 && (
            <mesh position={[0, point.pos1[1], 0]}>
              <cylinderGeometry args={[0.01, 0.01, 1, 8]} />
              <meshStandardMaterial color="#ffffff" opacity={0.3} transparent />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

// ==================== MORPHING BLOB ====================

export function MorphingBlob({ color = '#ff6b35' }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime()
      meshRef.current.rotation.x = time * 0.2
      meshRef.current.rotation.y = time * 0.3
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color={color}
          distort={0.6}
          speed={2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  )
}

// ==================== NEURAL NETWORK ====================

interface NeuralNetworkProps {
  nodeCount?: number
  color?: string
}

export function NeuralNetwork({ nodeCount = 30, color = '#ff6b35' }: NeuralNetworkProps) {
  const groupRef = useRef<THREE.Group>(null)
  
  const nodes = useMemo(() => {
    return Array.from({ length: nodeCount }).map(() => ({
      position: [
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
      ] as [number, number, number],
    }))
  }, [nodeCount])

  const connections = useMemo(() => {
    const conns = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = new THREE.Vector3(...nodes[i].position)
          .distanceTo(new THREE.Vector3(...nodes[j].position))
        if (dist < 1.5) {
          conns.push({ from: nodes[i].position, to: nodes[j].position })
        }
      }
    }
    return conns
  }, [nodes])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      {nodes.map((node, i) => (
        <mesh key={`node-${i}`} position={node.position}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      
      {/* Connections */}
      {connections.map((conn, i) => {
        const start = new THREE.Vector3(...conn.from)
        const end = new THREE.Vector3(...conn.to)
        const mid = start.clone().add(end).multiplyScalar(0.5)
        const length = start.distanceTo(end)
        const direction = end.clone().sub(start).normalize()
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction
        )

        return (
          <mesh
            key={`conn-${i}`}
            position={mid}
            quaternion={quaternion}
          >
            <cylinderGeometry args={[0.005, 0.005, length, 4]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.3}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// ==================== FLOATING GEOMETRY CLUSTER ====================

export function GeometryCluster({ colors = ['#ff6b35', '#2ec4b6', '#e71d36', '#f7c59f'] }) {
  const groupRef = useRef<THREE.Group>(null)

  const geometries = useMemo(() => {
    return [
      { type: 'icosahedron', position: [0, 0, 0], scale: 0.5, color: colors[0] },
      { type: 'octahedron', position: [1.5, 0.5, -0.5], scale: 0.3, color: colors[1] },
      { type: 'tetrahedron', position: [-1.2, -0.3, 0.5], scale: 0.4, color: colors[2] },
      { type: 'dodecahedron', position: [0.5, -1, 0.8], scale: 0.35, color: colors[3] },
      { type: 'box', position: [-0.8, 0.8, -0.8], scale: 0.25, color: colors[0] },
    ]
  }, [colors])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15
    }
  })

  const renderGeometry = (type: string) => {
    switch (type) {
      case 'icosahedron': return <icosahedronGeometry args={[1, 0]} />
      case 'octahedron': return <octahedronGeometry args={[1, 0]} />
      case 'tetrahedron': return <tetrahedronGeometry args={[1, 0]} />
      case 'dodecahedron': return <dodecahedronGeometry args={[1, 0]} />
      case 'box': return <boxGeometry args={[1, 1, 1]} />
      default: return <sphereGeometry args={[1, 16, 16]} />
    }
  }

  return (
    <group ref={groupRef}>
      {geometries.map((geo, i) => (
        <Float key={i} speed={1 + i * 0.2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh
            position={geo.position as [number, number, number]}
            scale={geo.scale}
          >
            {renderGeometry(geo.type)}
            <meshStandardMaterial
              color={geo.color}
              metalness={0.8}
              roughness={0.2}
              transparent
              opacity={0.9}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

// ==================== CANVAS EXPORTS ====================

interface SceneProps {
  className?: string
  type?: 'orb' | 'blob' | 'network' | 'cluster' | 'helix'
  color?: string
}

export default function InteractiveScene({ className = '', type = 'orb', color = '#ff6b35' }: SceneProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />
        <pointLight position={[-5, 5, 5]} intensity={0.4} color={color} />

        {type === 'orb' && <GlowOrb color={color} />}
        {type === 'blob' && <MorphingBlob color={color} />}
        {type === 'network' && <NeuralNetwork color={color} />}
        {type === 'cluster' && <GeometryCluster />}
        {type === 'helix' && <DNAHelix />}

        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
