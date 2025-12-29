import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cylinder, Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface FloatingClockProps {
  position: [number, number, number]
}

const FloatingClock: React.FC<FloatingClockProps> = ({ position }) => {
  const clockRef = useRef<THREE.Group>(null!)
  const hourHandRef = useRef<THREE.Mesh>(null!)
  const minuteHandRef = useRef<THREE.Mesh>(null!)
  const secondHandRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (clockRef.current) {
      clockRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1
      clockRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.3
    }

    // Animate clock hands
    const time = state.clock.elapsedTime
    if (hourHandRef.current) hourHandRef.current.rotation.z = (time / 43200) * Math.PI * 2 // 12 hours
    if (minuteHandRef.current) minuteHandRef.current.rotation.z = (time / 3600) * Math.PI * 2 // 60 minutes
    if (secondHandRef.current) secondHandRef.current.rotation.z = (time / 60) * Math.PI * 2 // 60 seconds
  })

  return (
    <group ref={clockRef} position={position}>
      {/* Clock face */}
      <Cylinder args={[1.2, 1.2, 0.1, 32]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#2d3436" />
      </Cylinder>

      {/* Clock numbers */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 * Math.PI) / 180
        const x = Math.sin(angle) * 0.9
        const y = Math.cos(angle) * 0.9
        return (
          <mesh key={i} position={[x, y, 0.06]}>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.1} />
          </mesh>
        )
      })}

      {/* Hour hand */}
      <mesh ref={hourHandRef} position={[0, 0, 0.06]}>
        <boxGeometry args={[0.03, 0.6, 0.01]} />
        <meshStandardMaterial color="#ff4757" />
      </mesh>

      {/* Minute hand */}
      <mesh ref={minuteHandRef} position={[0, 0, 0.07]}>
        <boxGeometry args={[0.02, 0.8, 0.01]} />
        <meshStandardMaterial color="#3742fa" />
      </mesh>

      {/* Second hand */}
      <mesh ref={secondHandRef} position={[0, 0, 0.08]}>
        <boxGeometry args={[0.01, 0.9, 0.005]} />
        <meshStandardMaterial color="#ffa502" />
      </mesh>

      {/* Center dot */}
      <Sphere args={[0.05]} position={[0, 0, 0.06]}>
        <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.3} />
      </Sphere>
    </group>
  )
}

export default FloatingClock