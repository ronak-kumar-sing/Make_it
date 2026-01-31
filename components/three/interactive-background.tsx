"use client"

import { useRef, useMemo, useCallback, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Float, MeshDistortMaterial, Sphere, Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"

// Mouse position tracking hook
function useMousePosition() {
  const mouse = useRef({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])
  
  return mouse
}

// Interactive floating orbs that follow mouse
function InteractiveOrbs({ count = 5 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const mouse = useMousePosition()
  const [clicked, setClicked] = useState(false)
  
  const orbs = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 3 - 1,
      ] as [number, number, number],
      scale: 0.2 + Math.random() * 0.4,
      speed: 0.5 + Math.random() * 0.5,
      color: [
        "#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b"
      ][i % 5],
    }))
  }, [count])
  
  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.getElapsedTime()
    
    groupRef.current.children.forEach((child, i) => {
      const orb = orbs[i]
      // Smooth follow mouse with offset based on index
      const targetX = mouse.current.x * 2 + Math.sin(time * orb.speed + i) * 0.5
      const targetY = mouse.current.y * 1.5 + Math.cos(time * orb.speed + i) * 0.3
      
      child.position.x += (targetX + orb.position[0] * 0.3 - child.position.x) * 0.02
      child.position.y += (targetY + orb.position[1] * 0.3 - child.position.y) * 0.02
      
      // Scale animation on click
      if (clicked) {
        child.scale.setScalar(orb.scale * (1 + Math.sin(time * 10) * 0.3))
      } else {
        child.scale.setScalar(orb.scale * (1 + Math.sin(time * 2 + i) * 0.1))
      }
    })
  })
  
  const handleClick = useCallback(() => {
    setClicked(true)
    setTimeout(() => setClicked(false), 500)
  }, [])
  
  return (
    <group ref={groupRef} onClick={handleClick}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial
            color={orb.color}
            transparent
            opacity={0.6}
            roughness={0.1}
            metalness={0.8}
            distort={clicked ? 0.6 : 0.3}
            speed={2}
          />
        </mesh>
      ))}
    </group>
  )
}

// Reactive particle field
function ReactiveParticles({ count = 1000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const mouse = useMousePosition()
  const [clicked, setClicked] = useState(false)
  
  const { positions, originalPositions } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const original = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 3 + Math.random() * 5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i3 + 2] = (Math.random() - 0.5) * 4
      
      original[i3] = pos[i3]
      original[i3 + 1] = pos[i3 + 1]
      original[i3 + 2] = pos[i3 + 2]
    }
    
    return { positions: pos, originalPositions: original }
  }, [count])
  
  useFrame((state) => {
    if (!ref.current) return
    const time = state.clock.getElapsedTime()
    const positionAttr = ref.current.geometry.attributes.position
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      // Mouse influence
      const dx = mouse.current.x * 3 - originalPositions[i3]
      const dy = mouse.current.y * 3 - originalPositions[i3 + 1]
      const dist = Math.sqrt(dx * dx + dy * dy)
      const maxDist = 2
      
      if (dist < maxDist) {
        const force = (1 - dist / maxDist) * (clicked ? 1.5 : 0.3)
        positionAttr.array[i3] = originalPositions[i3] + dx * force
        positionAttr.array[i3 + 1] = originalPositions[i3 + 1] + dy * force
      } else {
        // Return to original with floating animation
        positionAttr.array[i3] += (originalPositions[i3] + Math.sin(time + i) * 0.05 - positionAttr.array[i3]) * 0.05
        positionAttr.array[i3 + 1] += (originalPositions[i3 + 1] + Math.cos(time + i) * 0.05 - positionAttr.array[i3 + 1]) * 0.05
      }
      
      // Gentle z floating
      positionAttr.array[i3 + 2] = originalPositions[i3 + 2] + Math.sin(time * 0.5 + i * 0.1) * 0.2
    }
    
    positionAttr.needsUpdate = true
    ref.current.rotation.z = time * 0.02
  })
  
  const handleClick = useCallback(() => {
    setClicked(true)
    setTimeout(() => setClicked(false), 300)
  }, [])
  
  return (
    <points ref={ref} onClick={handleClick}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={clicked ? 0.04 : 0.02}
        color="#8b5cf6"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Click ripple effect
function ClickRipple() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; time: number }[]>([])
  const { camera } = useThree()
  
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      const id = Date.now()
      setRipples(prev => [...prev, { id, x: x * 3, y: y * 2, time: 0 }])
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id))
      }, 1000)
    }
    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [])
  
  return (
    <>
      {ripples.map((ripple) => (
        <RippleRing key={ripple.id} x={ripple.x} y={ripple.y} />
      ))}
    </>
  )
}

function RippleRing({ x, y }: { x: number; y: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const [scale, setScale] = useState(0.1)
  const [opacity, setOpacity] = useState(1)
  
  useFrame((_, delta) => {
    setScale(prev => Math.min(prev + delta * 3, 3))
    setOpacity(prev => Math.max(prev - delta * 2, 0))
  })
  
  return (
    <mesh ref={ref} position={[x, y, 0]}>
      <ringGeometry args={[scale * 0.9, scale, 64]} />
      <meshBasicMaterial color="#8b5cf6" transparent opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  )
}

// Floating geometric shapes
function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null)
  const mouse = useMousePosition()
  
  const shapes = useMemo(() => [
    { type: "box", position: [-3, 2, -2] as [number, number, number], rotation: [0.5, 0.5, 0], scale: 0.3, color: "#8b5cf6" },
    { type: "octahedron", position: [3, -1, -1.5] as [number, number, number], rotation: [0.3, 0.2, 0], scale: 0.4, color: "#ec4899" },
    { type: "icosahedron", position: [-2, -2, -2] as [number, number, number], rotation: [0.1, 0.4, 0], scale: 0.35, color: "#06b6d4" },
    { type: "torus", position: [2.5, 1.5, -1] as [number, number, number], rotation: [0.2, 0.3, 0], scale: 0.25, color: "#10b981" },
  ], [])
  
  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.getElapsedTime()
    
    groupRef.current.children.forEach((child, i) => {
      const shape = shapes[i]
      // Rotate based on time
      child.rotation.x = shape.rotation[0] + time * 0.3
      child.rotation.y = shape.rotation[1] + time * 0.2
      
      // Subtle mouse follow
      child.position.x = shape.position[0] + mouse.current.x * 0.3
      child.position.y = shape.position[1] + mouse.current.y * 0.2 + Math.sin(time + i) * 0.2
    })
  })
  
  const renderShape = (type: string, scale: number) => {
    switch (type) {
      case "box":
        return <boxGeometry args={[1, 1, 1]} />
      case "octahedron":
        return <octahedronGeometry args={[1]} />
      case "icosahedron":
        return <icosahedronGeometry args={[1]} />
      case "torus":
        return <torusGeometry args={[1, 0.4, 16, 32]} />
      default:
        return <sphereGeometry args={[1, 32, 32]} />
    }
  }
  
  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <mesh key={i} position={shape.position} scale={shape.scale}>
          {renderShape(shape.type, shape.scale)}
          <meshStandardMaterial
            color={shape.color}
            transparent
            opacity={0.5}
            roughness={0.2}
            metalness={0.8}
            wireframe
          />
        </mesh>
      ))}
    </group>
  )
}

// Main center sphere with distortion
function CenterSphere() {
  const ref = useRef<THREE.Mesh>(null)
  const mouse = useMousePosition()
  const [clicked, setClicked] = useState(false)
  
  useFrame((state) => {
    if (!ref.current) return
    const time = state.clock.getElapsedTime()
    
    // Smooth rotation following mouse
    ref.current.rotation.x += (mouse.current.y * 0.3 - ref.current.rotation.x) * 0.05
    ref.current.rotation.y += (mouse.current.x * 0.5 - ref.current.rotation.y) * 0.05
    
    // Breathing scale effect
    const baseScale = clicked ? 1.3 : 1
    ref.current.scale.setScalar(baseScale + Math.sin(time * 2) * 0.05)
  })
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={ref} args={[1, 64, 64]} onClick={() => {
        setClicked(true)
        setTimeout(() => setClicked(false), 500)
      }}>
        <MeshDistortMaterial
          color="#8b5cf6"
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.9}
          distort={clicked ? 0.6 : 0.4}
          speed={clicked ? 5 : 2}
        />
      </Sphere>
    </Float>
  )
}

// Gradient background
function GradientBg() {
  const ref = useRef<THREE.Mesh>(null)
  
  const shader = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#0f0f23") },
      uColor2: { value: new THREE.Color("#1a1a3e") },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying vec2 vUv;
      
      void main() {
        float gradient = smoothstep(0.0, 1.0, vUv.y + sin(vUv.x * 3.0 + uTime * 0.2) * 0.1);
        vec3 color = mix(uColor1, uColor2, gradient);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  }), [])
  
  useFrame((state) => {
    if (ref.current) {
      (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime()
    }
  })
  
  return (
    <mesh ref={ref} position={[0, 0, -5]} scale={[20, 20, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial args={[shader]} />
    </mesh>
  )
}

// Main component - lightweight and fast loading
export default function InteractiveBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]} // Lower DPR for performance
        performance={{ min: 0.5 }}
        gl={{ 
          antialias: false, // Disable for performance
          powerPreference: "high-performance",
          alpha: true,
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#8b5cf6" intensity={0.5} />
        
        <GradientBg />
        <CenterSphere />
        <ReactiveParticles count={500} />
        <FloatingShapes />
        <InteractiveOrbs count={4} />
        <ClickRipple />
      </Canvas>
    </div>
  )
}

// Lightweight version for slower devices
export function LightweightBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={1}
        performance={{ min: 0.3 }}
        gl={{ 
          antialias: false,
          powerPreference: "high-performance",
          alpha: true,
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        
        <GradientBg />
        <CenterSphere />
        <ReactiveParticles count={200} />
      </Canvas>
    </div>
  )
}
