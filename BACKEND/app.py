# app.py - Prime HEX Edition - Ultra Premium AI Defense System
import random
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from typing import List, Dict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from pathlib import Path
import uvicorn

Path("templates").mkdir(exist_ok=True)

# --- Attack Intelligence Data ---
ATTACK_TYPES = [
    "PRIME_BREACH_ATTEMPT", "HEX_INJECTION", "LIQUID_OVERFLOW",
    "CRYPTO_JACKING", "NEXUS_CORRUPTION", "PROTOCOL_VIOLATION",
    "ARCHITECTURE_HIJACK", "CLIENT_ID_SPOOF", "SYSTEM_CORE_EXPLOIT"
]

ATTACK_DETAILS = {
    "PRIME_BREACH_ATTEMPT": "Core system infiltration detected",
    "HEX_INJECTION": "Malicious hex code injection",
    "LIQUID_OVERFLOW": "Buffer overflow in liquid intelligence",
    "CRYPTO_JACKING": "Cryptographic key extraction attempt",
    "NEXUS_CORRUPTION": "Network nexus poisoning",
    "PROTOCOL_VIOLATION": "Custom protocol breach",
    "ARCHITECTURE_HIJACK": "System architecture takeover",
    "CLIENT_ID_SPOOF": "Identity fabrication attack",
    "SYSTEM_CORE_EXPLOIT": "Core kernel exploitation"
}

class PrimeHexState:
    def __init__(self):
        self.total_attacks_blocked = 9999
        self.active_threats = 47
        self.safe_prompts = 28456
        self.attack_distribution = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}
        self.live_threats: List[Dict] = []
        self.threat_level = "NOMINAL"
        self.risk_score = 8
        self.attack_history = []
        self.honeypot_events = []
        self.hex_matrix = [[random.randint(0, 255) for _ in range(16)] for _ in range(16)]
        
    def update_matrix(self):
        for i in range(16):
            for j in range(16):
                self.hex_matrix[i][j] = (self.hex_matrix[i][j] + random.randint(-5, 5)) % 256
                
    def update_with_random_data(self):
        change_blocked = random.randint(-15, 45)
        change_active = random.randint(-8, 25)
        change_safe = random.randint(-20, 50)
        
        self.total_attacks_blocked = max(0, self.total_attacks_blocked + change_blocked)
        self.active_threats = max(0, self.active_threats + change_active)
        self.safe_prompts = max(0, self.safe_prompts + change_safe)
        
        self.attack_distribution = {
            "CRITICAL": random.randint(5, 40),
            "HIGH": random.randint(10, 35),
            "MEDIUM": random.randint(8, 25),
            "LOW": random.randint(10, 30),
            "INFO": random.randint(1, 15)
        }
        total = sum(self.attack_distribution.values())
        if total > 0:
            for k in self.attack_distribution:
                self.attack_distribution[k] = int(self.attack_distribution[k] / total * 100)
        
        crit = self.attack_distribution.get("CRITICAL", 0)
        high = self.attack_distribution.get("HIGH", 0)
        if crit > 35:
            self.threat_level = "APOCALYPSE"
            self.risk_score = min(100, crit + random.randint(20, 40))
        elif crit > 20 or high > 45:
            self.threat_level = "CRITICAL"
            self.risk_score = min(100, crit + high + random.randint(10, 30))
        elif crit > 10 or high > 25:
            self.threat_level = "ELEVATED"
            self.risk_score = random.randint(40, 70)
        else:
            self.threat_level = "NOMINAL"
            self.risk_score = random.randint(5, 35)
            
        self.update_matrix()
            
    def add_live_threat(self):
        attack_type = random.choice(ATTACK_TYPES)
        detail = ATTACK_DETAILS.get(attack_type, "Unknown threat pattern")
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        severity = random.choice(["CRITICAL", "HIGH", "MEDIUM", "LOW"])
        new_threat = {
            "id": len(self.live_threats) + 1,
            "time": timestamp,
            "type": attack_type,
            "detail": detail,
            "severity": severity,
            "source": f"0x{random.randint(1000, 9999):04X}",
            "hex_code": f"{random.randint(0, 255):02X}{random.randint(0, 255):02X}{random.randint(0, 255):02X}{random.randint(0, 255):02X}"
        }
        self.live_threats.insert(0, new_threat)
        if len(self.live_threats) > 30:
            self.live_threats.pop()
        
        self.attack_history.insert(0, {
            "timestamp": datetime.now().isoformat(),
            "type": attack_type,
            "severity": severity,
            "status": "NEUTRALIZED"
        })
        if len(self.attack_history) > 100:
            self.attack_history.pop()
        return new_threat

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

state = None
manager = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global state, manager
    print("█" * 60)
    print("╔════════════════════════════════════════════════════════════╗")
    print("║     PRIME HEX v8 - LIQUID INTELLIGENCE SYSTEM ONLINE      ║")
    print("║          AI SHIELD X - ACTIVE DEFENSE PROTOCOL            ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print("█" * 60)
    
    state = PrimeHexState()
    manager = ConnectionManager()
    
    for _ in range(12):
        state.add_live_threat()
    state.update_with_random_data()
    
    async def data_updater():
        while True:
            await asyncio.sleep(2.5)
            if state and manager:
                state.update_with_random_data()
                if random.random() < 0.75:
                    state.add_live_threat()
                await manager.broadcast({
                    "type": "update",
                    "stats": {
                        "total_attacks_blocked": state.total_attacks_blocked,
                        "active_threats": state.active_threats,
                        "safe_prompts": state.safe_prompts,
                        "attack_distribution": state.attack_distribution,
                        "threat_level": state.threat_level,
                        "risk_score": state.risk_score
                    },
                    "all_threats": state.live_threats[:12],
                    "hex_matrix": state.hex_matrix
                })
    
    task = asyncio.create_task(data_updater())
    yield
    task.cancel()

app = FastAPI(title="PRIME HEX - AI Shield X", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
templates = Jinja2Templates(directory="templates")

# API Endpoints
@app.get("/api/stats")
async def get_stats():
    if not state: return {"error": "Initializing"}
    return {
        "total_attacks_blocked": state.total_attacks_blocked,
        "active_threats": state.active_threats,
        "safe_prompts": state.safe_prompts,
        "attack_distribution": state.attack_distribution,
        "threat_level": state.threat_level,
        "risk_score": state.risk_score
    }

@app.get("/api/live-threats")
async def get_live_threats():
    return {"threats": state.live_threats if state else []}

@app.get("/api/hex-matrix")
async def get_hex_matrix():
    return {"matrix": state.hex_matrix if state else []}

@app.get("/api/attack-origins")
async def get_attack_origins():
    return {"origins": [
        {"node": "NEXUS-01", "percentage": 32, "attacks": 14520, "hex": "0x4A3F"},
        {"node": "NEXUS-07", "percentage": 24, "attacks": 10890, "hex": "0x2B8E"},
        {"node": "NEXUS-13", "percentage": 18, "attacks": 8167, "hex": "0x7C2D"},
        {"node": "NEXUS-22", "percentage": 11, "attacks": 4990, "hex": "0x1F6A"},
        {"node": "NEXUS-45", "percentage": 8, "attacks": 3630, "hex": "0x9D4C"},
        {"node": "NEXUS-89", "percentage": 4, "attacks": 1815, "hex": "0x3E1B"},
        {"node": "UNKNOWN", "percentage": 3, "attacks": 1361, "hex": "0xFFFF"}
    ]}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await websocket.send_json({
            "type": "init",
            "data": {
                "stats": await get_stats(),
                "threats": await get_live_threats(),
                "origins": await get_attack_origins()
            }
        })
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Routes
@app.get("/")
async def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/threat-monitor")
async def threat_monitor(request: Request):
    return templates.TemplateResponse("threat_monitor.html", {"request": request})

@app.get("/attack-arena")
async def attack_arena(request: Request):
    return templates.TemplateResponse("attack_arena.html", {"request": request})

@app.get("/prompt-sandbox")
async def prompt_sandbox(request: Request):
    return templates.TemplateResponse("prompt_sandbox.html", {"request": request})

@app.get("/analytics")
async def analytics(request: Request):
    return templates.TemplateResponse("analytics.html", {"request": request})

@app.get("/attack-replay")
async def attack_replay(request: Request):
    return templates.TemplateResponse("attack_replay.html", {"request": request})

@app.get("/api-gateway")
async def api_gateway(request: Request):
    return templates.TemplateResponse("api_gateway.html", {"request": request})

@app.get("/honeypot")
async def honeypot(request: Request):
    return templates.TemplateResponse("honeypot.html", {"request": request})

if __name__ == "__main__":
    print("\n" + "═" * 60)
    print("  🔷 PRIME HEX v8 | LIQUID INTELLIGENCE ACTIVE")
    print("  🛡️  AI Shield X Defense Protocol | Status: ONLINE")
    print("  🌐 Access: http://localhost:8000")
    print("═" * 60 + "\n")
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)