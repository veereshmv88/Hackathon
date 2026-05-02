import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Stars, Sphere, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useShieldStore, Threat } from '../store/useShieldStore';

// Constants
const GLOBE_RADIUS = 2.5;

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

const AttackArc: React.FC<{ threat: Threat }> = ({ threat }) => {
  const projectileRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const interceptThreat = useShieldStore(state => state.interceptThreat);
  const isNeutralized = useShieldStore(state => state.neutralized_ids.has(threat.id));
  
  const curve = useMemo(() => {
    const start = latLngToVector3(threat.lat, threat.lng, GLOBE_RADIUS);
    const end = latLngToVector3(threat.target.lat, threat.target.lng, GLOBE_RADIUS);
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
    const distance = start.distanceTo(end);
    mid.normalize().multiplyScalar(GLOBE_RADIUS + distance * 0.6);
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [threat]);

  useFrame(({ clock }) => {
    if (isNeutralized) return;
    const t = (clock.getElapsedTime() * 0.7) % 1;
    if (projectileRef.current) {
      const pos = curve.getPoint(t);
      projectileRef.current.position.copy(pos);
      projectileRef.current.lookAt(curve.getPoint(Math.min(t + 0.01, 1)));
    }
    
    // Impact Pulse (Red Blinking Shockwave)
    if (pulseRef.current) {
      const speed = 4;
      const s = 1 + (clock.getElapsedTime() * speed % 1) * 5;
      pulseRef.current.scale.set(s, s, s);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = 1 - (clock.getElapsedTime() * speed % 1);
    }

    if (coreRef.current) {
      // Very fast strobe for "Alarm" feel
      const strobe = Math.sin(clock.getElapsedTime() * 30) > 0;
      coreRef.current.visible = strobe;
      coreRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 10) * 0.2);
    }
  });

  if (isNeutralized) return null;

  return (
    <group>
      {/* Visual Trajectory (Subtle) */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={64}
            array={new Float32Array(curve.getPoints(63).flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#ff0000" transparent opacity={0.2} />
      </line>

      {/* Travelling Malware Packet */}
      <mesh ref={projectileRef}>
        <boxGeometry args={[0.05, 0.05, 0.15]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      
      {/* TARGET IMPACT ZONE (AGGRESSIVE RED BLINK) */}
      <group 
        position={latLngToVector3(threat.target.lat, threat.target.lng, GLOBE_RADIUS + 0.05)}
        onClick={(e) => {
          e.stopPropagation();
          interceptThreat(threat.id);
        }}
      >
        {/* Expanding Ring */}
        <mesh ref={pulseRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.04, 0.12, 32]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Rapidly Blinking Core Spot */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      </group>
    </group>
  );
};

const Atmosphere = () => {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS * 1.15, 64, 64]} />
      <meshBasicMaterial
        color="#4264fb"
        transparent
        opacity={0.08}
        side={THREE.BackSide}
      />
    </mesh>
  );
};

const GlobeMesh = () => {
  const meshRef = useRef<THREE.Group>(null);
  const threats = useShieldStore(state => state.threats);

  const [colorMap, bumpMap] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png'
  ]);

  // Let OrbitControls handle the rotation interactivity
  
  return (
    <group ref={meshRef}>
      {/* Vibrant Daytime Earth */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshPhongMaterial 
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.05}
          shininess={15}
          specular={new THREE.Color('#333333')}
        />
      </mesh>

      {/* Atmospheric Haze */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.015, 64, 64]} />
        <meshPhongMaterial
          color="#93c5fd"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Cyber Overlays */}
      <points>
        <sphereGeometry args={[GLOBE_RADIUS * 1.02, 128, 128]} />
        <pointsMaterial size={0.015} color="#4f46e5" transparent opacity={0.1} />
      </points>

      {/* Active Attack Arcs */}
      {threats.slice(0, 15).map(threat => (
        <AttackArc key={threat.id} threat={threat} />
      ))}
    </group>
  );
};

export const Globe3D = () => {
  return (
    <div className="fixed inset-0 z-0 bg-[#010208]">
      <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
        <color attach="background" args={['#010208']} />
        
        <ambientLight intensity={1.5} />
        <pointLight position={[20, 10, 10]} intensity={2.5} color="#ffffff" />
        <pointLight position={[-20, -10, -10]} intensity={0.8} color="#4264fb" />
        
        <Stars radius={150} depth={50} count={8000} factor={4} saturation={0} fade speed={1.5} />
        
        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.1}>
          <GlobeMesh />
          <Atmosphere />
        </Float>

        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={4} 
          maxDistance={12}
          autoRotate={true}
          autoRotateSpeed={0.5} // Slowed down significantly
          rotateSpeed={0.8}     // Snave responsive click rotation
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Grid Overlay for depth */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:40px_40px]" />
    </div>
  );
};
