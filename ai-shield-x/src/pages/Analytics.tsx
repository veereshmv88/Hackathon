import React from 'react';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingDown, 
  TrendingUp, 
  Zap,
  ShieldCheck,
  Timer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell as PieCell 
} from 'recharts';
import { useShieldStore } from '../store/useShieldStore';
import { cn } from '../lib/utils';

export const Analytics = () => {
  const { stats } = useShieldStore();

  const data = [
    { name: 'Mon', attacks: 4000, blocked: 3800 },
    { name: 'Tue', attacks: 3000, blocked: 2900 },
    { name: 'Wed', attacks: 2000, blocked: 1950 },
    { name: 'Thu', attacks: 2780, blocked: 2700 },
    { name: 'Fri', attacks: 1890, blocked: 1800 },
    { name: 'Sat', attacks: 2390, blocked: 2300 },
    { name: 'Sun', attacks: 3490, blocked: 3400 },
  ];

  const distributionData = stats ? Object.entries(stats.attack_distribution).map(([name, value]) => ({
    name,
    value
  })) : [];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#94a3b8'];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="text-indigo-500" /> Security Analytics
          </h1>
          <p className="text-slate-500 font-medium">Comprehensive breakdown of attack patterns and defense efficiency</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Bar Chart */}
        <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white tracking-tight">Attack Volume (7d)</h2>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Detected</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Blocked</div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', color: '#fff' }}
                />
                <Bar dataKey="attacks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="blocked" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie Chart */}
        <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Severity Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {distributionData.map((d, i) => (
                <div key={d.name} className="flex justify-between items-center group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-xs text-slate-400 group-hover:text-white transition-colors">{d.name}</span>
                  </div>
                  <span className="text-xs font-bold text-white font-mono">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of smaller stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-4">
           <div className="flex justify-between items-center">
             <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500">
                <ShieldCheck size={24} />
             </div>
             <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                <TrendingUp size={12} /> 99.9%
             </div>
           </div>
           <div>
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Defense Accuracy</h3>
             <p className="text-3xl font-black text-white mt-1">99.82%</p>
             <p className="text-xs text-slate-500 mt-2 leading-relaxed italic">Measured against known malicious patterns and zero-day simulations.</p>
           </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-4">
           <div className="flex justify-between items-center">
             <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-500">
                <Zap size={24} />
             </div>
             <div className="flex items-center gap-1 text-red-400 font-bold text-xs uppercase">
                <TrendingDown size={12} /> 14% Risk
             </div>
           </div>
           <div>
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">System Load</h3>
             <p className="text-3xl font-black text-white mt-1">42.5 GW/s</p>
             <p className="text-xs text-slate-500 mt-2 leading-relaxed italic uppercase">Shield integrity remains nominal under current stress parameters.</p>
           </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-4">
           <div className="flex justify-between items-center">
             <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-500">
                <Timer size={24} />
             </div>
             <div className="text-cyan-400 font-bold text-xs uppercase">
                Fastest Response
             </div>
           </div>
           <div>
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Response Latency</h3>
             <p className="text-3xl font-black text-white mt-1">1.2ms</p>
             <p className="text-xs text-slate-500 mt-2 leading-relaxed italic capitalize">Adaptive response triggers firing at sub-millisecond intervals.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
