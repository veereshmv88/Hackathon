import React from 'react';
import { History, Network, Target, ChevronRight, Play } from 'lucide-react';
import { cn } from '../lib/utils';

export const AttackReplay = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 italic">
        <History className="text-orange-500" /> Attack Replay
      </h1>
      <p className="text-slate-500 font-medium uppercase text-xs font-bold mt-1">Review and analyze historical security incidents</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 group cursor-pointer hover:border-orange-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-mono text-slate-500 tracking-tighter uppercase">Incident #FR-920{i}</span>
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[8px] font-black uppercase">Critical</span>
          </div>
          <h3 className="text-white font-bold mb-2">Prompt Injection Variant {i}</h3>
          <p className="text-xs text-slate-500 mb-6">Attack originated from IP 192.168.1.{i} targetting Central Node v2.</p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-600 font-bold uppercase">Duration: 4.2s</span>
            <button className="flex items-center gap-2 text-orange-500 text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
              Replay <Play size={12} fill="currentColor" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ApiGateway = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 italic">
        <Network className="text-blue-500" /> API Gateway
      </h1>
      <p className="text-slate-500 font-medium uppercase text-xs font-bold mt-1">Manage external endpoints and authentication tokens</p>
    </div>
    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden">
      <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
        <div>
          <h2 className="text-white font-bold">Primary Gateway Endpoint</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">https://api.shieldx.prime/v1</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500" />
           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
        </div>
      </div>
      <div className="p-8 space-y-6">
        {[
          { method: 'GET', path: '/health', desc: 'System operational status' },
          { method: 'POST', path: '/analyze', desc: 'Secure prompt analysis engine' },
          { method: 'GET', path: '/threats', desc: 'Real-time threat feed aggregate' },
        ].map(api => (
          <div key={api.path} className="flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black w-14 text-center", 
                api.method === 'GET' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500')}>
                {api.method}
              </span>
              <div>
                <p className="text-sm font-mono text-white">{api.path}</p>
                <p className="text-xs text-slate-500">{api.desc}</p>
              </div>
            </div>
            <ChevronRight className="text-slate-700" size={16} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const Honeypot = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 italic">
        <Target className="text-red-500" /> Honeypot System
      </h1>
      <p className="text-slate-500 font-medium uppercase text-xs font-bold mt-1">Active deception decoys tracking malicious actors</p>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Decoy Performance</h2>
          <div className="aspect-[4/3] bg-white/2 rounded-2xl border border-white/5 relative flex items-center justify-center">
             <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <Target size={200} className="text-red-500" />
             </div>
             <div className="grid grid-cols-2 gap-8 z-10 w-full px-12">
                <div className="text-center">
                   <p className="text-4xl font-black text-white tracking-tighter">142</p>
                   <p className="text-[10px] text-slate-500 font-black uppercase mt-1">Entrapped IPs</p>
                </div>
                <div className="text-center">
                   <p className="text-4xl font-black text-white tracking-tighter">84%</p>
                   <p className="text-[10px] text-slate-500 font-black uppercase mt-1">Capture Rate</p>
                </div>
             </div>
          </div>
       </div>
       <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 space-y-6 flex flex-col">
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Decoy Log</h2>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4 rounded-xl bg-white/2 border border-white/5 flex justify-between items-center group">
                 <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                       <Target size={16} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-white uppercase">Decoy Alpha {i}</p>
                       <p className="text-[10px] font-mono text-slate-600">IP: 102.34.12.{i}</p>
                    </div>
                 </div>
                 <span className="text-[10px] text-slate-500 font-black uppercase italic group-hover:text-red-500 transition-colors">TRAPPED</span>
              </div>
            ))}
          </div>
       </div>
    </div>
  </div>
);
