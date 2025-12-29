import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleSystemProps {
  count?: number
  position?: [number, number, number]
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({
  count = 1000,
  position = [0, 0, 0]
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ] as [number, number, number],
        velocity: [
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ] as [number, number, number],
        life: Math.random() * 1000
      })
    }
    return temp
  }, [count])

  useFrame((state) => {
    if (!meshRef.current) return

    particles.forEach((particle, i) => {
      particle.life += 1

      // Update position
      particle.position[0] += particle.velocity[0]
      particle.position[1] += particle.velocity[1]
      particle.position[2] += particle.velocity[2]

      // Reset particle if it goes too far
      if (particle.position[0] > 5 || particle.position[0] < -5 ||
          particle.position[1] > 5 || particle.position[1] < -5 ||
          particle.position[2] > 5 || particle.position[2] < -5) {
        particle.position = [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ]
        particle.velocity = [
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ]
        particle.life = 0
      }

      // Set instance matrix
      dummy.position.set(...particle.position)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} position={position}>
      <sphereGeometry args={[0.01]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
    </instancedMesh>
  )
}

export default ParticleSystem