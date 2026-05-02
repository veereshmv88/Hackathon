import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Filter, 
  Download, 
  Search,
  Globe,
  Lock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useShieldStore } from '../store/useShieldStore';
import { cn, SEVERITIES } from '../lib/utils';

export const ThreatMonitor = () => {
  const { threats } = useShieldStore();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredThreats = useMemo(() => {
    return threats.filter(t => {
      const matchesFilter = filter === 'ALL' || t.severity === filter;
      const matchesSearch = t.type.toLowerCase().includes(search.toLowerCase()) || 
                           t.country.toLowerCase().includes(search.toLowerCase()) ||
                           t.source_ip.includes(search);
      return matchesFilter && matchesSearch;
    });
  }, [threats, filter, search]);

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Activity className="text-indigo-500" /> Threat Monitoring
          </h1>
          <p className="text-slate-500 font-medium">Real-time surveillance of global AI infrastructure attack vectors</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors uppercase tracking-widest">
            <Download size={14} /> Export CSV
          </button>
          <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/20 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE FEED
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search by IP, Type, or Country..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all",
                filter === s ? "bg-indigo-500 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Threats Table */}
      <div className="flex-1 overflow-hidden bg-black/20 backdrop-blur-xl border border-white/5 rounded-3xl flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
               <tr className="border-b border-white/5 bg-white/[0.02]">
                 <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
                 <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vector Type</th>
                 <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Severity</th>
                 <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Source IP</th>
                 <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Origin</th>
                 <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Node</th>
                 <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
               {filteredThreats.map((threat) => (
                 <tr key={threat.id} className="hover:bg-white/[0.02] transition-colors group">
                   <td className="px-6 py-4">
                     <span className="text-xs font-mono text-slate-400">{threat.time}</span>
                   </td>
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                       <ShieldAlert className={cn("w-4 h-4", threat.severity === 'CRITICAL' ? 'text-red-500' : 'text-slate-500')} />
                       <span className="text-sm font-bold text-white uppercase italic tracking-tight">{threat.type}</span>
                     </div>
                   </td>
                   <td className="px-6 py-4">
                     <span className={cn("px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-widest", SEVERITIES[threat.severity])}>
                       {threat.severity}
                     </span>
                   </td>
                   <td className="px-6 py-4">
                     <span className="text-xs font-mono text-slate-400">{threat.source_ip}</span>
                   </td>
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                       <Globe size={14} className="text-slate-500" />
                       <span className="text-sm text-slate-300 font-medium">{threat.country}</span>
                     </div>
                   </td>
                   <td className="px-6 py-4">
                     <div className="flex flex-col">
                       <span className="text-xs text-white font-bold">{threat.target.name}</span>
                       <span className="text-[10px] text-slate-500 uppercase font-black uppercase italic tracking-widest">Data Hub X-1</span>
                     </div>
                   </td>
                   <td className="px-6 py-4 text-right">
                     <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                       <ExternalLink size={14} />
                     </button>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
          {filteredThreats.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
              <div className="p-4 rounded-full bg-white/5 border border-white/10 text-slate-500">
                <Lock size={32} />
              </div>
              <div>
                <p className="text-white font-bold">No threats detected matching criteria</p>
                <p className="text-sm text-slate-500">Try adjusting your filters or search query</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
