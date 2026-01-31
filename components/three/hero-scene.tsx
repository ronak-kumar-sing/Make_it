'use client'

import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  Float, 
  MeshDistortMaterial, 
  Sphere, 
  Box,
  Torus,
  OrbitControls,
  Environment,
  Stars,
  useTexture,
  Text3D,
  Center
} from '@react-three/drei'
import * as THREE from 'three'

// ==================== ANIMATED SPHERE ====================

interface AnimatedSphereProps {
  position?: [number, number, number]
  color?: string
  speed?: number
  distort?: number
  size?: number
}

export function AnimatedSphere({ 
  position = [0, 0, 0], 
  color = '#ff6b35',
  speed = 2,
  distort = 0.4,
  size = 1
}: AnimatedSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }
  })

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[size, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={speed}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  )
}

// ==================== FLOATING PARTICLES ====================

interface ParticleFieldProps {
  count?: number
  color?: string
  size?: number
}

export function ParticleField({ count = 500, color = '#ff6b35', size = 0.02 }: ParticleFieldProps) {
  const points = useRef<THREE.Points>(null)
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return positions
  }, [count])

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.x = state.clock.getElapsedTime() * 0.05
      points.current.rotation.y = state.clock.getElapsedTime() * 0.08
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesPosition, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        sizeAttenuation
        transparent
        opacity={0.8}
      />
    </points>
  )
}

// ==================== GRADIENT BACKGROUND ====================

interface GradientBackgroundProps {
  colorA?: string
  colorB?: string
}

export function GradientBackground({ colorA = '#0a0a0a', colorB = '#1a1a2e' }: GradientBackgroundProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <mesh ref={meshRef} position={[0, 0, -5]} scale={[20, 20, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={{
          colorA: { value: new THREE.Color(colorA) },
          colorB: { value: new THREE.Color(colorB) },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 colorA;
          uniform vec3 colorB;
          varying vec2 vUv;
          void main() {
            gl_FragColor = vec4(mix(colorA, colorB, vUv.y), 1.0);
          }
        `}
      />
    </mesh>
  )
}

// ==================== ORBITING RINGS ====================

interface OrbitingRingsProps {
  color?: string
  count?: number
}

export function OrbitingRings({ color = '#ff6b35', count = 3 }: OrbitingRingsProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = state.clock.getElapsedTime() * 0.1
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15
    }
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => (
        <Torus
          key={i}
          args={[1.5 + i * 0.3, 0.02, 16, 100]}
          rotation={[Math.PI / 2, 0, (Math.PI / count) * i]}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.6 - i * 0.1}
          />
        </Torus>
      ))}
    </group>
  )
}

// ==================== FLOATING CUBES ====================

interface FloatingCubesProps {
  count?: number
  colors?: string[]
}

export function FloatingCubes({ 
  count = 8, 
  colors = ['#ff6b35', '#f7c59f', '#2ec4b6', '#e71d36'] 
}: FloatingCubesProps) {
  const cubes = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
      ] as [number, number, number],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
      scale: 0.2 + Math.random() * 0.3,
      color: colors[i % colors.length],
      speed: 0.5 + Math.random() * 1.5,
    }))
  }, [count, colors])

  return (
    <>
      {cubes.map((cube, i) => (
        <Float key={i} speed={cube.speed} rotationIntensity={0.5} floatIntensity={0.5}>
          <Box
            args={[cube.scale, cube.scale, cube.scale]}
            position={cube.position}
            rotation={cube.rotation}
          >
            <meshStandardMaterial
              color={cube.color}
              metalness={0.8}
              roughness={0.2}
              transparent
              opacity={0.8}
            />
          </Box>
        </Float>
      ))}
    </>
  )
}

// ==================== MOUSE FOLLOW LIGHT ====================

export function MouseFollowLight() {
  const lightRef = useRef<THREE.PointLight>(null)
  const { viewport } = useThree()

  useFrame((state) => {
    if (lightRef.current) {
      const x = (state.pointer.x * viewport.width) / 2
      const y = (state.pointer.y * viewport.height) / 2
      lightRef.current.position.set(x, y, 2)
    }
  })

  return <pointLight ref={lightRef} intensity={1} color="#ff6b35" distance={10} />
}

// ==================== WAVE MESH ====================

export function WaveMesh() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry as THREE.PlaneGeometry
      const position = geometry.attributes.position
      const time = state.clock.getElapsedTime()

      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i)
        const y = position.getY(i)
        position.setZ(i, Math.sin(x * 2 + time) * 0.3 + Math.cos(y * 2 + time) * 0.3)
      }
      position.needsUpdate = true
    }
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[10, 10, 32, 32]} />
      <meshStandardMaterial
        color="#ff6b35"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  )
}

// ==================== MAIN HERO SCENE ====================

interface HeroSceneProps {
  variant?: 'default' | 'minimal' | 'cosmic'
  primaryColor?: string
}

function HeroSceneContent({ variant = 'default', primaryColor = '#ff6b35' }: HeroSceneProps) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <MouseFollowLight />

      {variant === 'default' && (
        <>
          <AnimatedSphere position={[0, 0, 0]} color={primaryColor} size={1.5} />
          <OrbitingRings color={primaryColor} />
          <ParticleField count={300} color={primaryColor} />
        </>
      )}

      {variant === 'minimal' && (
        <>
          <AnimatedSphere position={[0, 0, 0]} color={primaryColor} size={1.2} distort={0.3} />
          <ParticleField count={100} color={primaryColor} size={0.015} />
        </>
      )}

      {variant === 'cosmic' && (
        <>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <AnimatedSphere position={[0, 0, 0]} color={primaryColor} size={1} />
          <FloatingCubes count={12} colors={[primaryColor, '#ffffff', '#2ec4b6']} />
          <WaveMesh />
        </>
      )}

      <Environment preset="city" />
    </>
  )
}

// ==================== CANVAS WRAPPER ====================

interface ThreeHeroProps extends HeroSceneProps {
  className?: string
  enableOrbitControls?: boolean
  cameraPosition?: [number, number, number]
}

export default function ThreeHero({
  className = '',
  variant = 'default',
  primaryColor = '#ff6b35',
  enableOrbitControls = false,
  cameraPosition = [0, 0, 5],
}: ThreeHeroProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: cameraPosition, fov: 45 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <HeroSceneContent variant={variant} primaryColor={primaryColor} />
          {enableOrbitControls && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 3}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}

// ==================== LOADING PLACEHOLDER ====================

export function ThreeLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-orange-500/20 rounded-full animate-pulse" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-orange-500 rounded-full animate-spin" />
      </div>
    </div>
  )
}
