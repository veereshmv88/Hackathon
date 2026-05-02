import React from 'react';
import { Activity, ShieldCheck, AlertTriangle, MessageSquare, ChevronRight, TrendingUp, Zap, LucideIcon } from 'lucide-react';
import { Globe3D } from '../components/Globe3D';
import { useShieldStore } from '../store/useShieldStore';
import { cn, SEVERITIES } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

const StatCard: React.FC<{ title: string; value: string | number; icon: LucideIcon; trend?: string; color: string }> = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
    <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full", color)} />
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl border", `border-${color}/20 bg-${color}/10 text-${color}`)}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-lg flex items-center gap-1">
          <TrendingUp size={12} /> {trend}
        </span>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-sm text-slate-500 uppercase tracking-widest font-bold">{title}</h3>
      <p className="text-3xl font-black text-white tabular-nums">{value}</p>
    </div>
  </div>
);

const TacticalMiniGame = () => {
  const [targets, setTargets] = useState<{ id: string; x: number; y: number }[]>([]);
  const interceptThreat = useShieldStore(state => state.interceptThreat);
  const score = useShieldStore(state => state.tactical_score);

  useEffect(() => {
    const spawnTarget = () => {
      const id = Math.random().toString(36).substr(2, 9);
      const x = (Math.random() - 0.5) * 70;
      const y = (Math.random() - 0.5) * 70;
      
      setTargets(prev => [...prev, { id, x, y }]);
      
      setTimeout(() => {
        setTargets(prev => prev.filter(t => t.id !== id));
      }, 2500);
    };

    const interval = setInterval(() => {
      if (targets.length < 6) spawnTarget();
    }, 1000);

    return () => clearInterval(interval);
  }, [targets.length]);

  const handleIntercept = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    interceptThreat(id);
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-auto">
       <AnimatePresence>
          {targets.map((target) => (
             <motion.button
                key={target.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                whileHover={{ scale: 1.4 }}
                whileTap={{ scale: 0.8 }}
                onClick={(e) => handleIntercept(target.id, e)}
                style={{ 
                   position: 'absolute',
                   left: `${50 + target.x}%`,
                   top: `${50 + target.y}%`,
                   transform: 'translate(-50%, -50%)'
                }}
                className="w-10 h-10 flex items-center justify-center group z-20 cursor-crosshair"
             >
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl group-hover:bg-red-400/40" />
                <div className="relative z-10 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_15px_#ef4444] border border-white/20" />
                <div className="absolute inset-0 border border-red-500/30 rounded-full animate-ping" />
             </motion.button>
          ))}
       </AnimatePresence>

       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-1 opacity-50">Current Shield Level</p>
          <p className="text-3xl font-black text-white tabular-nums tracking-tighter">
             {score.toLocaleString().padStart(6, '0')}
          </p>
       </div>
    </div>
  );
};

export const Dashboard = () => {
  const { stats, threats } = useShieldStore();
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    // We need to track the parent container scroll since Dashboard is nested in the Layout's scrollable div
    const scrollContainer = document.querySelector('.custom-scrollbar');
    if (!scrollContainer) return;

    const handleScroll = () => {
      const opacity = Math.max(0, 1 - (scrollContainer.scrollTop / 600));
      setScrollOpacity(opacity);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative overflow-x-hidden">
      {/* LOCAL BACKGROUND GLOBE */}
      <motion.div 
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: scrollOpacity }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="fixed inset-0 z-0 pointer-events-auto"
      >
        <Globe3D />
      </motion.div>

      <div className="relative z-10 space-y-12 pb-20">
        {/* IMMERSIVE HERO SPACER */}
      <section className="h-[120vh] flex flex-col items-center justify-end pb-12 pointer-events-none perspective-1000 bg-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 150, rotateX: 10, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          viewport={{ margin: "-100px" }}
          whileHover={{ scale: 1.02, rotateX: -2, transition: { duration: 0.4 } }}
          transition={{ 
            duration: 1.8, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="text-center space-y-8 cursor-default pointer-events-auto"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-xl"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Guardian Protocol v8.2</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
              className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase"
            >
              GLOBAL THREAT<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 animate-gradient-x">INTELLIGENCE</span>
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="max-w-xl mx-auto"
            >
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto mb-6" />
              <p className="text-slate-400 font-medium text-base md:text-lg leading-relaxed px-4">
                Advanced neural monitoring of adversarial vectors and malware distribution nodes across the global mesh network.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 1 }}
            className="flex flex-col items-center gap-2 pt-8"
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deploy Data Mesh</span>
            <div className="w-px h-12 bg-gradient-to-b from-indigo-500 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* Overview Block (Transparent-ish to show globe as it fades) */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-20"
      >
        <StatCard 
          title="Internet Threats Blocked" 
          value={stats ? stats.total_attacks_blocked.toLocaleString() : '---'} 
          icon={ShieldCheck} 
          trend="+LIVE" 
          color="indigo-500" 
        />
        <StatCard 
          title="Active Geo-Threats" 
          value={stats ? stats.active_threats : '---'} 
          icon={AlertTriangle} 
          trend="Real-time" 
          color="orange-500" 
        />
        <StatCard 
          title="Secure Packets" 
          value={stats ? stats.safe_prompts.toLocaleString() : '---'} 
          icon={MessageSquare} 
          trend="99.9%" 
          color="cyan-500" 
        />
        <StatCard 
          title="Global Risk Index" 
          value={`${stats?.risk_score || 0}%`} 
          icon={TrendingUp} 
          color="purple-500" 
        />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Intelligence Panel */}
        <div className="xl:col-span-2 bg-black/20 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative min-h-[400px] flex flex-col group hover:border-indigo-500/30 transition-all duration-500">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Cyber Threat Intelligence</h2>
              <p className="text-sm text-slate-500">Live monitoring of global malware vectors and adversary nodes</p>
            </div>
            
            {/* GAME HUD & ROTATION CONTROLS */}
            <div className="flex flex-wrap items-center gap-4">
               {/* Rotation Control */}
               <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-4 group/rotation">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Rotation</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="0.5" 
                    step="0.01" 
                    value={useShieldStore(state => state.rotation_speed)}
                    onChange={(e) => useShieldStore.getState().setRotationSpeed(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-indigo-500/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
               </div>

               <div className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-3 animate-bounce">
                  <Zap className="text-orange-500" size={16} />
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
                    Action Required: Intercept Threats
                  </span>
               </div>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                   <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">Top Attack Vector</p>
                   <p className="text-xl font-bold text-white">{threats[0]?.type || 'Analyzing...'}</p>
                   <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[65%]" />
                   </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                   <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest mb-1">Most Targeted Region</p>
                   <p className="text-xl font-bold text-white">US-EAST-1</p>
                   <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-[42%]" />
                   </div>
                </div>
             </div>

             {/* TACTICAL ATTACK ARENA GAME */}
             <div className="relative p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/20 overflow-hidden group/arena">
                <div className="absolute top-4 left-4 z-10">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Tactical Arena</p>
                </div>
                
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Neural Link: ACTIVE</span>
                </div>

                <div className="relative w-full h-full flex flex-col items-center justify-center min-h-[220px]">
                   {/* Background Radar Grid */}
                   <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.2)_0%,transparent_70%)]" />
                      <div className="w-full h-full border border-indigo-500/20 rounded-full scale-150 animate-[spin_10s_linear_infinite]" />
                      <div className="w-full h-full border border-indigo-500/10 rounded-full scale-110 animate-[spin_15s_linear_infinite_reverse]" />
                   </div>

                   <TacticalMiniGame />
                </div>
             </div>
          </div>

          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">SAT_LINK: UP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">DSHIELD_SYNC: OK</span>
              </div>
            </div>
            <p className="text-[10px] font-mono text-indigo-400/60">SESSION_ID: AI_SHIELD_{Math.random().toString(36).substring(7).toUpperCase()}</p>
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col hover:border-red-500/30 transition-all duration-500">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Live Entry Log</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Real-time packet capture</p>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-mono text-red-500 animate-pulse">RECORDING</span>
               <div className="w-2 h-2 rounded-full bg-red-500" />
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
            {threats.length === 0 && (
              <div className="h-40 flex flex-col items-center justify-center text-slate-600">
                <ShieldCheck className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Listening for events...</p>
              </div>
            )}
            {threats.map((threat) => (
              <div key={threat.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-all group cursor-default">
                <div className="flex justify-between items-start mb-2">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border", SEVERITIES[threat.severity])}>
                    {threat.severity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{threat.time}</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{threat.type}</h4>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-mono text-slate-400 break-all">{threat.detail}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono text-indigo-400/70 p-1 bg-indigo-500/5 rounded">{threat.source_ip}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{threat.country}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white hover:bg-white/10 tracking-widest uppercase transition-all active:scale-95">
            TERMINATE ALL SESSIONS
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
