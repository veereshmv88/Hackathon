import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Activity, 
  Zap, 
  Terminal, 
  BarChart3, 
  History, 
  Network, 
  Target,
  Menu,
  X,
  Bell,
  LucideIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useShieldStore } from '../../store/useShieldStore';

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: Shield },
  { name: 'Threat Monitor', path: '/threats', icon: Activity },
  { name: 'Attack Arena', path: '/arena', icon: Zap },
  { name: 'Prompt Sandbox', path: '/sandbox', icon: Terminal },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Attack Replay', path: '/replay', icon: History },
  { name: 'API Gateway', path: '/api', icon: Network },
  { name: 'Honeypot', path: '/honeypot', icon: Target },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { stats, tactical_score } = useShieldStore();

  const getThreatColor = (level: string = '') => {
    switch(level) {
      case 'APOCALYPSE': return 'text-red-500';
      case 'CRITICAL': return 'text-orange-500';
      case 'ELEVATED': return 'text-yellow-500';
      default: return 'text-emerald-500';
    }
  };

  const mainContentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex h-screen w-screen bg-[#010208] text-slate-200 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-black/40 backdrop-blur-2xl border-r border-white/5 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <Shield className="text-indigo-400 w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight text-white">AI SHIELD X</h1>
                <p className="text-[10px] uppercase tracking-widest text-indigo-400/70 font-semibold italic">Internet Intel v8.2</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                    isActive 
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "group-hover:text-white")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5 space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-black mb-1">Tactical Score</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-mono font-bold text-white tracking-widest">
                  {tactical_score.toLocaleString().padStart(6, '0')}
                </span>
                <Target className="text-indigo-500 animate-pulse" size={16} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Network Health</p>
              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-bold", getThreatColor(stats?.threat_level))}>
                  {stats?.threat_level || 'ANALYZING...'}
                </span>
                <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              </div>
              <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000", (stats?.risk_score || 0) < 40 ? 'bg-emerald-500' : 'bg-red-500')}
                  style={{ width: `${stats?.risk_score || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-md z-30">
          <button 
            className="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Internet Entry Points</span>
              <span className="text-sm font-bold text-white tabular-nums tracking-tighter">LIVE_FEED: ACTIVE</span>
            </div>
            <div className="h-8 w-px bg-white/10 hidden md:block" />
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-black" />
              </button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border border-white/10" />
            </div>
          </div>
        </header>

        {/* Page Area */}
        <div 
          ref={mainContentRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative"
        >
          {children}
        </div>
      </main>
    </div>
  );
};
