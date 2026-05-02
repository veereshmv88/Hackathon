import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { ThreatMonitor } from './pages/ThreatMonitor';
import { PromptSandbox } from './pages/PromptSandbox';
import { Analytics } from './pages/Analytics';
import { AttackArena } from './pages/AttackArena';
import { AttackReplay, ApiGateway, Honeypot } from './pages/OtherPages';
import { useShieldStore } from './store/useShieldStore';

export default function App() {
  const connect = useShieldStore((state) => state.connect);
  const disconnect = useShieldStore((state) => state.disconnect);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/threats" element={<ThreatMonitor />} />
        <Route path="/arena" element={<AttackArena />} />
        <Route path="/sandbox" element={<PromptSandbox />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/replay" element={<AttackReplay />} />
        <Route path="/api" element={<ApiGateway />} />
        <Route path="/honeypot" element={<Honeypot />} />
      </Routes>
    </DashboardLayout>
  );
}
