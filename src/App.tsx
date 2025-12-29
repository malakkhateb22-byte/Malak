import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Text } from '@react-three/drei'
import { motion } from 'framer-motion'
import TimeManagementScene from './components/TimeManagementScene'
import './App.css'

function App() {
  return (
    <div className="App">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="presentation-container"
      >
        <Canvas
          camera={{ position: [0, 0, 10], fov: 75 }}
          style={{ background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)' }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} />
            <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade />
            <TimeManagementScene />
            <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
          </Suspense>
        </Canvas>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="ui-overlay"
        >
          <h1 className="title">Master Your Time</h1>
          <p className="subtitle">A 3D Journey Through Time Management</p>
          <div className="instructions">
            <p>🖱️ Click and drag to explore</p>
            <p>🔄 Scroll to zoom</p>
            <p>⚡ Click on elements to interact</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default App