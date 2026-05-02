/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo, Suspense, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera, Stars, Float as FloatDrei, Text } from '@react-three/drei';
import { 
  Shield, 
  Droplets, 
  Target, 
  Zap, 
  Lock, 
  Eye, 
  BarChart3, 
  ArrowRight, 
  ChevronRight,
  Menu,
  X,
  Star,
  Globe,
  Cpu,
  Fingerprint,
  Activity,
  Layers,
  Terminal,
  ArrowLeft,
  Send,
  Sparkles,
  Command,
  ShieldCheck
} from 'lucide-react';
import * as THREE from 'three';

import { getChatResponse } from './services/geminiService';

// --- Three.js Background Elements ---
const ParticleField = () => {
  const points = useMemo(() => {
    const p = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      p[i * 3] = (Math.random() - 0.5) * 40;
      p[i * 3 + 1] = (Math.random() - 0.5) * 40;
      p[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return p;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.03;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2000}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#3b82f6"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

const CyberCrystal = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.2;
    meshRef.current.rotation.y = t * 0.3;
    meshRef.current.position.y = Math.sin(t * 0.5) * 0.5;
  });

  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[2, 0]} />
        <meshPhysicalMaterial
          color="#1d4ed8"
          emissive="#60a5fa"
          emissiveIntensity={1.5}
          roughness={0}
          metalness={1}
          reflectivity={1}
          transmission={0.5}
          thickness={1}
          wireframe
        />
      </mesh>
      {/* Dynamic Rings */}
      {[1, 1.2, 1.4].map((scale, i) => (
        <mesh key={i} rotation={[Math.PI / (2 + i), Math.PI / (4 - i), 0]}>
          <torusGeometry args={[3 * scale, 0.015, 16, 120]} />
          <meshStandardMaterial color={i === 1 ? "#a855f7" : "#3b82f6"} emissive={i === 1 ? "#a855f7" : "#3b82f6"} emissiveIntensity={8} />
        </mesh>
      ))}
    </Float>
  );
};

const BackgroundScene = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#a855f7" />
        <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1.5} />
        <Suspense fallback={null}>
          <ParticleField />
          <group position={[8, 0, 0]}>
            <CyberCrystal />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
};

// --- Water Ripple Component (Enhanced) ---
const WaterRipple = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    let ripplePrev = new Float32Array(w * h);
    let rippleCurr = new Float32Array(w * h);
    let rippleNext = new Float32Array(w * h);

    const addRipple = (x: number, y: number, strength = 1.2) => {
      const radius = 50;
      const intensity = strength * 15;
      const ix = Math.floor(x);
      const iy = Math.floor(y);

      for (let i = Math.max(1, ix - radius); i < Math.min(w - 1, ix + radius); i++) {
        for (let j = Math.max(1, iy - radius); j < Math.min(h - 1, iy + radius); j++) {
          const dx = i - ix;
          const dy = j - iy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < radius) {
            const factor = (radius - dist) / radius;
            const idx = j * w + i;
            rippleCurr[idx] += Math.sin(dist * 0.2) * intensity * factor;
          }
        }
      }
    };

    const update = () => {
      for (let i = 1; i < w - 1; i++) {
        for (let j = 1; j < h - 1; j++) {
          const idx = j * w + i;
          const val = (
            ripplePrev[idx - 1] + 
            ripplePrev[idx + 1] + 
            ripplePrev[idx - w] + 
            ripplePrev[idx + w]
          ) / 2 - rippleNext[idx];
          
          rippleCurr[idx] = val * 0.98;
        }
      }
      
      const temp = ripplePrev;
      ripplePrev = rippleNext;
      rippleNext = rippleCurr;
      rippleCurr = temp;
    };

    const render = () => {
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      
      for (let i = 0; i < w * h; i++) {
        const val = ripplePrev[i];
        const absVal = Math.min(0.9, Math.abs(val) / 24);
        const idx = i * 4;
        
        if (absVal > 0.05) {
          const r = val > 0 ? 30 + absVal * 100 : 80 + absVal * 80;
          const g = val > 0 ? 100 + absVal * 130 : 150 + absVal * 105;
          const b = val > 0 ? 220 + absVal * 35 : 255;
          data[idx] = r;
          data[idx+1] = g;
          data[idx+2] = b;
          data[idx+3] = Math.floor(40 + absVal * 160);
        } else {
          data[idx+3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };

    let frameId: number;
    const animate = () => {
      update();
      render();
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => addRipple(e.clientX, e.clientY, 0.9);
    const handleClick = (e: MouseEvent) => addRipple(e.clientX, e.clientY, 3.0);
    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      ripplePrev = new Float32Array(w * h);
      rippleCurr = new Float32Array(w * h);
      rippleNext = new Float32Array(w * h);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1] mix-blend-screen" />;
};

// --- Navbar ---
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] px-6 transition-all duration-500 ${scrolled ? 'pt-4' : 'pt-8'}`}>
      <div className={`max-w-7xl mx-auto rounded-full px-8 py-3 flex items-center justify-between transition-all duration-500 ${scrolled ? 'bg-black/60 backdrop-blur-3xl border border-white/10 shadow-2xl' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-linear-to-br from-hex-blue via-indigo-600 to-hex-purple rounded-2xl flex items-center justify-center text-white shadow-xl shadow-hex-blue/30 transform rotate-3 hover:rotate-0 transition-transform">
            <Shield size={22} fill="currentColor" fillOpacity={0.2} />
          </div>
          <span className="font-display font-bold text-2xl tracking-tighter">
            Prime <span className="text-hex-blue italic">HEX</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-10">
          {['Nexus', 'Cryo', 'Architecture', 'Protocol'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-all relative group">
              {item}
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-hex-blue transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <button className="hidden sm:block text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Client_ID</button>
          <button className="px-8 py-2.5 bg-white text-black hover:bg-hex-blue hover:text-white rounded-full text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
            System Core
          </button>
        </div>
      </div>
    </nav>
  );
};

// --- Liquid Cursor Component ---
const LiquidCursor = () => {
  const points = 12;
  const [positions, setPositions] = useState(Array(points).fill({ x: 0, y: 0 }));
  const requestRef = useRef<number>(null);
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      setPositions((prev) => {
        const next = [...prev];
        next[0] = {
          x: next[0].x + (targetRef.current.x - next[0].x) * 0.4,
          y: next[0].y + (targetRef.current.y - next[0].y) * 0.4,
        };

        for (let i = 1; i < points; i++) {
          next[i] = {
            x: next[i].x + (next[i - 1].x - next[i].x) * 0.35,
            y: next[i].y + (next[i - 1].y - next[i].y) * 0.35,
          };
        }
        return next;
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {positions.map((pos, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-blue-400 translate-[-50%, -50%]"
          style={{
            left: pos.x,
            top: pos.y,
            width: `${24 - i * 1.5}px`,
            height: `${24 - i * 1.5}px`,
            opacity: (points - i) / points * 0.4,
            filter: `blur(${i * 1.5}px)`,
          }}
        />
      ))}
      <div 
        className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_#fff] translate-[-50%, -50%]"
        style={{ left: positions[0].x, top: positions[0].y }}
      />
    </div>
  );
};

// --- App Root ---
export default function App() {
  const [view, setView] = useState<'home' | 'portal'>('home');
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const rotateRange = useTransform(scrollYProgress, [0, 1], [0, 15]);
  const opacityRange = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="relative selection:bg-blue-500/20 bg-hex-dark text-white overflow-hidden min-h-screen">
      <div className="scanline" />
      <BackgroundScene />
      <WaterRipple />
      <LiquidCursor />
      <Navbar />

      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -100, filter: 'blur(20px)' }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center px-6 cyber-grid pt-20">
              <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 relative z-10">
                <div className="max-w-2xl">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-lg glass-dark border-blue-500/30 mb-12"
                  >
                    <Terminal size={14} className="text-blue-500" />
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.25em]">CORE_SYSTEM_PRIME_v8</span>
                  </motion.div>

                  <motion.h1 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-8xl md:text-[11rem] font-bold leading-[0.75] tracking-tighter mb-10 glitch select-none"
                    data-text="PRIME"
                  >
                    PRIME <br />
                    <span className="gradient-text italic font-black">HEX.</span>
                  </motion.h1>

                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl text-gray-500 max-w-lg mb-16 font-medium leading-tight"
                  >
                    High-performance liquid intelligence architecture for the next era of digital dominance.
                  </motion.p>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap items-center gap-8"
                  >
                    <button 
                      onClick={() => setView('portal')}
                      className="group relative px-12 py-6 overflow-hidden rounded-full transition-all hover:scale-110 active:scale-95"
                    >
                      <div className="absolute inset-0 bg-white" />
                      <div className="absolute inset-x-0 bottom-0 h-0 bg-blue-500 transition-all group-hover:h-full" />
                      <span className="relative z-10 text-black group-hover:text-white font-black uppercase text-sm tracking-[0.4em]">Start</span>
                    </button>
                    
                    <button className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 hover:text-blue-400 transition-colors">
                      Core Protocol 
                    </button>
                  </motion.div>
                </div>
              </div>

              {/* Navigation Guide */}
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-20"
              >
                <div className="w-px h-12 bg-linear-to-b from-white to-transparent" />
                <span className="text-[10px] font-black uppercase tracking-widest">Scroll To Explore Architecture</span>
              </motion.div>
            </section>

            {/* Feature Bento Section */}
            <section id="nexus" className="py-40 px-6 relative z-10">
              <div className="max-w-7xl mx-auto">
                <div className="bento-grid">
                  <BentoItem 
                    className="md:col-span-2 md:row-span-2" 
                    title="Liquid Sync" 
                    desc="Sub-millisecond synchronization across distributed edge nodes for zero-lag interaction."
                    icon={<Cpu className="text-blue-500" />}
                    img="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2600&auto=format&fit=crop"
                  />
                  <BentoItem 
                    className="md:col-span-2" 
                    title="Hex Topology" 
                    desc="Patented hexagonal data routing minimizes latency by 42% compared to standard architectures."
                    icon={<Layers className="text-purple-500" />}
                  />
                  <BentoItem 
                    title="Pulse" 
                    desc="Real-time biological monitoring of system health."
                    icon={<Activity className="text-cyan-500" />}
                    small
                  />
                  <BentoItem 
                    title="Global" 
                    desc="Universal accessibility across 140+ countries."
                    icon={<Globe className="text-emerald-500" />}
                    small
                  />
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <PortalView onBack={() => setView('home')} />
        )}
      </AnimatePresence>

      <footer className="py-20 px-6 border-t border-white/5 bg-hex-dark relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <Shield className="text-blue-500" size={24} />
            <span className="font-display font-black text-2xl tracking-tighter">Prime <span className="text-blue-500">HEX</span></span>
          </div>
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">© 2025 Prime HEX Systems</p>
        </div>
      </footer>
    </div>
  );
}

// --- Portal View Component (Master Hover Effect) ---
const PortalView = ({ onBack }: { onBack: () => void }) => {
  return (
    <motion.div
      key="portal"
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen pt-32 pb-40 px-6 relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-6xl font-display font-black leading-none mb-3">COMMAND <span className="text-hex-blue">CENTER</span></h2>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-hex-blue font-mono text-[10px] uppercase tracking-[0.3em]">
                <div className="w-1.5 h-1.5 rounded-full bg-hex-blue animate-pulse" />
                Session: Active
              </span>
              <span className="h-4 w-px bg-white/10" />
              <span className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em]">Node ID: 0xPRIME_ALPHA_9</span>
            </div>
          </motion.div>
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onBack}
            className="px-8 py-4 glass rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-500 hover:text-white transition-all hover:scale-110 active:scale-95 group"
          >
            Terminal Exit <X className="inline-block ml-2 group-hover:rotate-90 transition-transform" size={14} />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          {/* Dashboard Left Section */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* System Visualizer */}
            <div className="relative glass-dark rounded-[3rem] border border-white/5 h-[500px] overflow-hidden group">
              <div className="absolute inset-0 cyber-grid opacity-10" />
              <div className="absolute inset-0 bg-linear-to-b from-hex-blue/5 to-transparent" />
              
              <div className="relative h-full p-12 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-mono text-hex-blue tracking-widest mb-1 uppercase">Visualizer_Mode</div>
                    <div className="text-2xl font-black font-display uppercase tracking-tight">Prime Architecture Nodes</div>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-hex-blue/20 border border-hex-blue/40" />
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-12">
                   <div className="relative w-full h-full flex items-center justify-center">
                     {/* Orbiting Elements */}
                     <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[400px] h-[400px] border border-dashed border-hex-blue/10 rounded-full"
                     />
                     <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[300px] h-[300px] border border-dashed border-indigo-500/20 rounded-full"
                     />
                     
                     <div className="relative z-10 w-48 h-48 flex items-center justify-center">
                        <div className="absolute inset-0 bg-hex-blue/20 blur-3xl animate-pulse" />
                        <div className="w-full h-full glass border-hex-blue/30 rounded-3xl flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                          <Cpu size={64} className="text-hex-blue drop-shadow-[0_0_15px_rgba(0,242,255,0.5)]" />
                        </div>
                     </div>

                     {/* Stat Badges */}
                     <div className="absolute top-10 right-10 bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                        <Activity className="text-hex-blue" />
                        <div>
                          <div className="text-[8px] font-mono text-gray-500 uppercase">Latency</div>
                          <div className="text-sm font-bold">0.42ms</div>
                        </div>
                     </div>
                   </div>
                </div>

                <div className="grid grid-cols-4 gap-8 pt-8 border-t border-white/5">
                  {[
                    { label: 'Uptime', value: '99.98%', color: 'text-hex-blue' },
                    { label: 'Throughput', value: '1.2TB/s', color: 'text-indigo-400' },
                    { label: 'Encryption', value: 'AES_512', color: 'text-purple-400' },
                    { label: 'Security', value: 'Lvl 10', color: 'text-emerald-400' }
                  ].map((s, i) => (
                    <div key={i}>
                      <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">{s.label}</div>
                      <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sub Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass p-8 rounded-[2.5rem] hex-card">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Fingerprint className="text-hex-blue" size={20} />
                      <h3 className="text-xs font-black uppercase tracking-[0.3em]">Neural Protocol</h3>
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">ID_VERIFIED</span>
                  </div>
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${60 + i * 15}%` }}
                          transition={{ duration: 2, delay: i * 0.2 }}
                          className="h-full bg-linear-to-r from-hex-blue to-indigo-600"
                        />
                      </div>
                    ))}
                    <p className="text-[10px] text-gray-500 font-medium">Neural synaptic interface stable at 98.4% efficiency.</p>
                  </div>
              </div>

              <div className="glass p-8 rounded-[2.5rem] hex-card">
                <div className="flex items-center gap-3 mb-8">
                  <Target className="text-purple-500" size={20} />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em]">Resource Flow</h3>
                </div>
                <div className="h-16 flex items-end gap-1.5">
                  {[...Array(12)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: `${20 + Math.random() * 80}%` }}
                      transition={{ duration: 0.5 + Math.random(), repeat: Infinity, repeatType: 'reverse' }}
                      className="flex-1 bg-purple-500/20 rounded-t-lg border-x border-purple-500/10"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chatbot Section - Right side on large screens */}
          <div className="lg:col-span-4 h-[750px] lg:h-auto flex flex-col">
            <ChatBot onBack={onBack} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- ChatBot Component ---
const ChatBot = ({ onBack }: { onBack: () => void }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    const history = messages.map(m => ({ 
      role: m.role, 
      parts: [{ text: m.text }] 
    }));

    const response = await getChatResponse(userMessage, history);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsTyping(false);
  };

  const quickCommands = [
    { label: "/status", icon: <Activity size={10} /> },
    { label: "/secure", icon: <Shield size={10} /> },
    { label: "/optimize", icon: <Zap size={10} /> }
  ];

  return (
    <div className="flex flex-col h-full glass-dark rounded-[3.5rem] border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(0,242,255,0.07)] relative group/chat">
      {/* Shining Background Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-hex-blue/10 blur-[100px] pointer-events-none opacity-50 group-hover/chat:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-hex-purple/10 blur-[100px] pointer-events-none opacity-50" />

      {/* Header */}
      <div className="p-8 border-b border-white/5 bg-white/[0.03] backdrop-blur-md flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group/btn"
          >
            <ArrowLeft size={18} className="text-gray-400 group-hover/btn:text-white transition-colors" />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-hex-blue/20 border border-hex-blue/40 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent animate-[shine_3s_infinite]" />
            <Terminal size={18} className="text-hex-blue" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              Prime HEX AI
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1 h-1 rounded-full bg-hex-blue"
                  />
                ))}
              </div>
            </div>
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,153,1)]" />
              Sync: Active
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Load</span>
            <span className="text-[10px] font-bold text-hex-blue">LOW</span>
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="p-2 glass rounded-xl cursor-help"
          >
            <Sparkles size={14} className="text-purple-400" />
          </motion.div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide scroll-smooth relative z-10"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60 px-10">
            <div className="relative mb-8">
               <Cpu size={56} className="text-hex-blue animate-pulse" />
               <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border border-dashed border-hex-blue/20 rounded-full"
               />
            </div>
            <h4 className="text-lg font-display font-bold text-white mb-2 uppercase tracking-wide">System Initialized</h4>
            <p className="text-xs font-medium leading-relaxed text-gray-500 max-w-[240px]">
               Direct neural uplink active. Awaiting your next security directive or infrastructure query.
            </p>
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div 
              key={i}
              layout
              initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group/msg relative`}
            >
              <div className={`max-w-[88%] rounded-[2rem] p-6 relative shadow-2xl transition-all hover:shadow-hex-blue/10 overflow-hidden ${
                m.role === 'user' 
                  ? 'bg-hex-blue text-black font-bold rounded-tr-none' 
                  : 'bg-white/[0.04] border border-white/10 text-gray-200 font-medium rounded-tl-none backdrop-blur-xl'
              }`}>
                {/* Background Scanline for Model messages */}
                {m.role === 'model' && (
                  <motion.div 
                    initial={{ top: '-100%' }}
                    animate={{ top: '200%' }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-x-0 h-1 bg-hex-blue/10 blur-sm pointer-events-none"
                  />
                )}

                <div className={`text-[9px] font-mono flex items-center justify-between mb-3 ${m.role === 'user' ? 'text-black/80' : 'text-hex-blue'}`}>
                  <span className="flex items-center gap-2 uppercase tracking-[0.25em]">
                    {m.role === 'user' ? <Fingerprint size={10} /> : <Terminal size={10} />}
                    {m.role === 'user' ? 'AUTH_USER' : 'PRIME_CORE'}
                  </span>
                  
                  {m.role === 'model' && (
                    <div className="flex items-center gap-1.5">
                       <motion.div 
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-[8px] font-bold text-hex-purple"
                       >
                         ENCRYPTED_LINK
                       </motion.div>
                       <Star size={10} className="text-purple-400 animate-pulse" />
                    </div>
                  )}
                </div>

                <p className={`text-sm leading-relaxed whitespace-pre-wrap selection:bg-white/20 ${m.role === 'model' ? 'text-shimmer' : ''}`}>
                  {m.text}
                </p>
                
                {/* Deco Bits for Model bubble */}
                {m.role === 'model' && (
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between pointer-events-none">
                    <div className="flex gap-1.5">
                       {[...Array(4)].map((_, j) => (
                         <motion.div 
                           key={j}
                           animate={{ opacity: [0.2, 0.8, 0.2] }}
                           transition={{ duration: 0.5, repeat: Infinity, delay: j * 0.1 }}
                           className="w-1 h-3 bg-hex-blue/20 rounded-full"
                         />
                       ))}
                    </div>
                    <span className="text-[7px] font-mono text-gray-700 tracking-[0.2em]">0x{Math.floor(Math.random() * 9999).toString(16).toUpperCase()}</span>
                  </div>
                )}
                
                {/* Reactions/Status */}
                <div className={`absolute -bottom-3 ${m.role === 'user' ? 'right-6' : 'left-6'} opacity-0 group-hover/msg:opacity-100 transition-all translate-y-2 group-hover/msg:translate-y-0 flex gap-2 z-20`}>
                   <div className="bg-black/90 border border-white/10 rounded-full px-3 py-1 flex items-center gap-2 backdrop-blur-md shadow-lg">
                     <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 uppercase tracking-tighter">
                        <ShieldCheck size={10} /> Validated
                     </span>
                     <span className="w-1 h-1 rounded-full bg-white/20" />
                     <span className="text-[9px] font-mono text-gray-500 uppercase">9.8ms</span>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
           <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
           >
             <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] rounded-tl-none flex items-center gap-2 shadow-inner">
               <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 rounded-full bg-hex-blue" />
               <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-indigo-500" />
               <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-hex-purple" />
             </div>
           </motion.div>
        )}
      </div>

      {/* Prompt UI Section */}
      <div className="p-8 bg-black/40 backdrop-blur-3xl border-t border-white/10 relative z-10 shadow-[0_-20px_40px_rgba(0,0,0,0.3)]">
        {/* Quick Command Chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
           {quickCommands.map((cmd) => (
             <button
               key={cmd.label}
               onClick={() => setInput(cmd.label)}
               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-mono text-gray-400 hover:bg-hex-blue/10 hover:border-hex-blue/30 hover:text-hex-blue transition-all whitespace-nowrap active:scale-95"
             >
               {cmd.icon}
               {cmd.label}
             </button>
           ))}
        </div>

        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute -inset-0.5 bg-linear-to-r from-hex-blue to-hex-purple rounded-[1.5rem] opacity-0 group-focus-within:opacity-30 blur-md transition-opacity duration-500" />
          <div className="relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter neural command..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] py-6 pl-8 pr-20 text-sm font-medium focus:outline-hidden focus:border-hex-blue/40 focus:bg-white/[0.06] transition-all placeholder:text-gray-600 shadow-inner"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-hex-blue text-black flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,242,255,0.3)]"
            >
              <Send size={20} className="ml-1" />
            </button>
          </div>
        </form>
        
        <div className="mt-5 flex items-center justify-between text-[8px] font-mono text-gray-600 uppercase tracking-[0.4em]">
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-1.5"><Command size={10} /> Neural_Gate: OPEN </span>
             <span className="h-2 w-px bg-white/10" />
             <span>Entropy: 0.12</span>
          </div>
          <span className="text-hex-blue animate-pulse">Ready</span>
        </div>
      </div>
    </div>
  );
};

// --- Dynamic Subcomponents ---

const BentoItem = ({ className, title, desc, icon, img, small }: { className?: string, title: string, desc: string, icon: ReactNode, img?: string, small?: boolean }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`bento-item group relative overflow-hidden ${className}`}
  >
    {img && (
      <div className="absolute inset-0 z-0 scale-110 group-hover:scale-100 transition-transform duration-700">
        <img src={img} alt="" className="w-full h-full object-cover opacity-20 grayscale transition-all group-hover:grayscale-0 group-hover:opacity-40" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-linear-to-t from-[#030305] to-transparent opacity-80" />
      </div>
    )}
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-xl glass border-white/10 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 ${small ? 'w-10 h-10 mb-4' : ''}`}>
        {icon}
      </div>
      <h3 className={`${small ? 'text-lg' : 'text-2xl'} font-bold mb-3 tracking-tight`}>{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">{desc}</p>
    </div>
  </motion.div>
);
