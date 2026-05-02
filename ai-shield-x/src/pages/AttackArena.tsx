import React from 'react';
import { Zap, Play, Square, Settings, Wifi, Database, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

export const AttackArena = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 italic">
            <Zap className="text-yellow-500 fill-yellow-500/20" /> Attack Arena
          </h1>
          <p className="text-slate-500 font-medium tracking-tight uppercase text-xs font-bold">Simulate stress tests and defensive maneuvers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 aspect-video relative flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
             <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <Zap size={200} className="text-yellow-500" />
             </div>
             <div className="z-10 text-center space-y-6">
                <div className="flex items-center justify-center gap-4">
                   <button className="p-6 rounded-full bg-yellow-500 text-black hover:scale-105 transition-transform shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                      <Play size={40} fill="black" />
                   </button>
                </div>
                <div>
                   <p className="text-white font-black text-xl uppercase italic tracking-widest">Initialization Ready</p>
                   <p className="text-slate-500 text-sm font-bold uppercase mt-1">Select simulation parameters to begin</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
             <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-3 text-center">
                <Wifi size={24} className="text-indigo-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase">Network Load</span>
                <span className="text-xl font-black text-white">0.0 Gb/s</span>
             </div>
             <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-3 text-center">
                <Database size={24} className="text-emerald-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase">I/O Pressure</span>
                <span className="text-xl font-black text-white">LOW</span>
             </div>
             <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-3 text-center">
                <Cpu size={24} className="text-orange-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase">CPU Stress</span>
                <span className="text-xl font-black text-white">2%</span>
             </div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-2 mb-4">
             <Settings className="text-slate-500" size={18} />
             <h2 className="text-sm font-bold text-white uppercase tracking-widest">Arena Config</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-3">Attack Vector</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50">
                <option>Multi-Vector DDoS</option>
                <option>Prompt Injection Wave</option>
                <option>Model Hijack Simulation</option>
                <option>Zero-Day Extraction</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-3">Intensity Level</label>
              <input type="range" className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
              <div className="flex justify-between mt-2 text-[8px] font-black text-slate-600 uppercase">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
                <span>Critical</span>
              </div>
            </div>

            <div className="space-y-3 pt-6">
               <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                  <span className="text-xs text-slate-400">Auto-Remediate</span>
                  <div className="w-8 h-4 bg-yellow-500 rounded-full relative">
                     <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                  </div>
               </div>
               <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                  <span className="text-xs text-slate-400">Log Full Trace</span>
                  <div className="w-8 h-4 bg-slate-700 rounded-full relative">
                     <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                  </div>
               </div>
            </div>

            <button className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-widest hover:border-yellow-500/50 hover:text-yellow-500 transition-all">
               Emergency Shutdown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
