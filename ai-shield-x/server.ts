/**
 * AI SHIELD X - Backend Service
 * Implements real-time threat detection and simulation logic.
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import path from 'path';

const PORT = 3000;

// Types
interface Stats {
  total_attacks_blocked: number;
  active_threats: number;
  safe_prompts: number;
  attack_distribution: Record<string, number>;
  threat_level: string;
  risk_score: number;
}

interface Threat {
  id: string;
  time: string;
  type: string;
  detail: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  source_ip: string;
  country: string;
  lat: number;
  lng: number;
  target: {
    name: string;
    lat: number;
    lng: number;
  };
}

// Initial State
class DashboardState {
  stats: Stats = {
    total_attacks_blocked: 125430,
    active_threats: 14,
    safe_prompts: 890212,
    attack_distribution: {
      CRITICAL: 12,
      HIGH: 28,
      MEDIUM: 35,
      LOW: 15,
      INFO: 10
    },
    threat_level: 'NORMAL',
    risk_score: 24
  };

  live_threats: Threat[] = [];
  attack_history: any[] = [];
  honeypot_events: any[] = [];
  real_ip_pool: any[] = [];
  geo_cache: Map<string, any> = new Map();

  constructor() {
    this.fetchRealThreatData();
    this.generateInitialThreats();
    // Refresh real data every 10 minutes
    setInterval(() => this.fetchRealThreatData(), 10 * 60 * 1000);
  }

  async fetchRealThreatData() {
    try {
      console.log('Fetching live threat intelligence from DShield...');
      const response = await fetch('https://isc.sans.edu/api/sources/topattackingips/20?json');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          this.real_ip_pool = data;
          console.log(`Successfully loaded ${data.length} real threat sources.`);
        }
      }
    } catch (err) {
      console.error('Failed to fetch real threat data:', err);
    }
  }

  async getGeoIP(ip: string) {
    if (this.geo_cache.has(ip)) return this.geo_cache.get(ip);
    try {
      const resp = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,lat,lon`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.status === 'success') {
          this.geo_cache.set(ip, data);
          return data;
        }
      }
    } catch (e) {
      // Fallback
    }
    return null;
  }

  generateInitialThreats() {
    for (let i = 0; i < 10; i++) {
      this.addLiveThreat();
    }
  }

  updateStats() {
    this.stats.total_attacks_blocked += Math.floor(Math.random() * 5);
    this.stats.safe_prompts += Math.floor(Math.random() * 20);
    
    // Recalculate distribution
    const dist = this.stats.attack_distribution;
    dist.CRITICAL = Math.max(5, Math.min(40, dist.CRITICAL + (Math.random() - 0.5) * 5));
    dist.HIGH = Math.max(10, Math.min(50, dist.HIGH + (Math.random() - 0.5) * 5));
    // Normalize (roughly)
    const sum = dist.CRITICAL + dist.HIGH + dist.MEDIUM + dist.LOW + dist.INFO;
    Object.keys(dist).forEach(key => dist[key] = Math.round((dist[key] / sum) * 100));

    // Determine threat level
    const crit = dist.CRITICAL;
    const high = dist.HIGH;
    if (crit > 35) {
      this.stats.threat_level = 'APOCALYPSE';
      this.stats.risk_score = Math.floor(crit + 40 + Math.random() * 20);
    } else if (crit > 20 || high > 45) {
      this.stats.threat_level = 'CRITICAL';
      this.stats.risk_score = Math.floor(crit + high + 20 + Math.random() * 10);
    } else if (crit > 10 || high > 25) {
      this.stats.threat_level = 'ELEVATED';
      this.stats.risk_score = Math.floor(40 + Math.random() * 30);
    } else {
      this.stats.threat_level = 'NOMINAL';
      this.stats.risk_score = Math.floor(5 + Math.random() * 30);
    }
  }

  async addLiveThreat() {
    const attackTypes = [
      'SQL Injection', 'Cross-Site Scripting (XSS)', 'DDoS Flood',
      'Brute Force Attack', 'Malware Delivery', 'Zero-Day Exploit',
      'Man-in-the-Middle', 'Phishing Campaign', 'Botnet Scavenging',
      'Port Scanning', 'Ransomware Beacon', 'Directory Traversal'
    ];
    const severities: Threat['severity'][] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
    const targets = [
      { name: 'US-EAST-1 (Virginia)', lat: 38.13, lng: -78.45 },
      { name: 'EU-WEST-1 (Ireland)', lat: 53.34, lng: -6.26 },
      { name: 'AP-NORTHEAST-1 (Tokyo)', lat: 35.68, lng: 139.76 },
      { name: 'SA-EAST-1 (São Paulo)', lat: -23.55, lng: -46.63 },
      { name: 'AF-SOUTH-1 (Cape Town)', lat: -33.92, lng: 18.42 },
      { name: 'Mumbai Data Hub', lat: 19.07, lng: 72.87 }
    ];

    let source_ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    let country = 'Unknown';
    let lat = (Math.random() - 0.5) * 120;
    let lng = (Math.random() - 0.5) * 360;

    // Use real data if available
    if (this.real_ip_pool.length > 0) {
      const entry = this.real_ip_pool[Math.floor(Math.random() * this.real_ip_pool.length)];
      source_ip = entry.ip;
      const geo = await this.getGeoIP(source_ip);
      if (geo) {
        country = geo.country;
        lat = geo.lat;
        lng = geo.lon;
      }
    }

    const target = targets[Math.floor(Math.random() * targets.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];

    const threat: Threat = {
      id: uuidv4(),
      time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
      detail: `Real-time activity detected from ${country} (${source_ip})`,
      severity,
      source_ip,
      country,
      lat,
      lng,
      target
    };

    this.live_threats.unshift(threat);
    if (this.live_threats.length > 50) this.live_threats.pop();

    this.attack_history.unshift({
      timestamp: Date.now(),
      type: threat.type,
      severity: threat.severity,
      blocked: Math.random() > 0.05
    });
    if (this.attack_history.length > 100) this.attack_history.pop();

    return threat;
  }
}

const state = new DashboardState();
const clients = new Set<WebSocket>();

function broadcast(data: any) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  app.use(express.json());

  // WebSocket
  const wss = new WebSocketServer({ server });
  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.send(JSON.stringify({
      type: 'init',
      data: {
        stats: state.stats,
        threats: state.live_threats,
        history: state.attack_history
      }
    }));

    ws.on('close', () => clients.delete(ws));
  });

  // Simulation Loop
  setInterval(async () => {
    state.updateStats();
    let newThreat = null;
    if (Math.random() < 0.8) {
      newThreat = await state.addLiveThreat();
    }
    broadcast({
      type: 'update',
      stats: state.stats,
      all_threats: state.live_threats,
      new_threat: newThreat
    });
  }, 1500);

  // REST API
  app.get('/api/stats', (req, res) => res.json(state.stats));
  app.get('/api/live-threats', (req, res) => res.json({ threats: state.live_threats }));
  app.get('/api/attack-history', (req, res) => res.json({ history: state.attack_history }));
  
  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`AI SHIELD X server running on http://localhost:${PORT}`);
  });
}

startServer();
