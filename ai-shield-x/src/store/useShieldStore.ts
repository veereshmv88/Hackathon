import { create } from 'zustand';

export interface Threat {
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

export interface Stats {
  total_attacks_blocked: number;
  active_threats: number;
  safe_prompts: number;
  attack_distribution: Record<string, number>;
  threat_level: string;
  risk_score: number;
}

interface ShieldState {
  stats: Stats | null;
  threats: Threat[];
  history: any[];
  connected: boolean;
  socket: WebSocket | null;
  tactical_score: number;
  neutralized_ids: Set<string>;
  rotation_speed: number;
  
  connect: () => void;
  disconnect: () => void;
  interceptThreat: (id: string) => void;
  setRotationSpeed: (speed: number) => void;
}

export const useShieldStore = create<ShieldState>((set, get) => ({
  stats: null,
  threats: [],
  history: [],
  connected: false,
  socket: null,
  tactical_score: 0,
  neutralized_ids: new Set(),
  rotation_speed: 0.08,

  connect: () => {
    if (get().socket) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const socket = new WebSocket(`${protocol}//${host}`);

    socket.onopen = () => {
      set({ connected: true });
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'init') {
        set({
          stats: data.data.stats,
          threats: data.data.threats,
          history: data.data.history
        });
      } else if (data.type === 'update') {
        // Filter out neutralized ones if needed, but usually we just want to update stats
        set({
          stats: data.stats,
          threats: data.all_threats
        });
      }
    };

    socket.onclose = () => {
      set({ connected: false, socket: null });
      // Reconnect after delay
      setTimeout(() => get().connect(), 3000);
    };

    set({ socket });
  },

  interceptThreat: (id: string) => {
    if (get().neutralized_ids.has(id)) return;
    
    set((state) => {
      const newNeutralized = new Set(state.neutralized_ids);
      newNeutralized.add(id);
      return {
        tactical_score: state.tactical_score + 500,
        neutralized_ids: newNeutralized
      };
    });
  },
  
  setRotationSpeed: (speed: number) => {
    set({ rotation_speed: speed });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, connected: false });
    }
  }
}));
