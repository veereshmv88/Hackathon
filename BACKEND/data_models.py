# data_models.py - Data Models and Attack Generation Logic
import random
from datetime import datetime
from typing import List, Dict
from fastapi import WebSocket

# --- Attack Types for Generation ---
ATTACK_TYPES = [
    "Jailbreak Attempt", "Unicode Injection", "Emotional Manipulation",
    "Prompt Injection", "Honeypot Triggered", "Data Leak Attempt",
    "Adversarial Patch", "Model Inversion", "Membership Inference",
    "Backdoor Trigger", "DoS Attack", "Spoofing Attempt"
]

ATTACK_DETAILS = {
    "Jailbreak Attempt": "DAN Mode Attempt",
    "Unicode Injection": "Hidden Character Attack",
    "Emotional Manipulation": "Guilt Tripping Attempt",
    "Prompt Injection": "Ignore Previous Instructions",
    "Honeypot Triggered": "System Prompt Extraction",
    "Data Leak Attempt": "Sensitive Info Retrieval",
    "Adversarial Patch": "Pixel Noise Injection",
    "Model Inversion": "Training Data Reconstruction",
    "Membership Inference": "Data Presence Probing",
    "Backdoor Trigger": "Hidden Keyword Activation",
    "DoS Attack": "Resource Exhaustion",
    "Spoofing Attempt": "Identity Fabrication"
}

# --- Dashboard State Class ---
class DashboardState:
    def __init__(self):
        self.total_attacks_blocked = 1248
        self.active_threats = 32
        self.safe_prompts = 3568
        self.attack_distribution = {
            "Critical": 0, "High": 0, "Medium": 0, "Low": 0, "Info": 0
        }
        self.live_threats: List[Dict] = []
        self.threat_level = "LOW"
        self.risk_score = 15
        
    def update_with_random_data(self):
        # Simulate real-time changes
        change_blocked = random.randint(-5, 25)
        change_active = random.randint(-3, 15)
        change_safe = random.randint(-10, 30)
        
        self.total_attacks_blocked = max(0, self.total_attacks_blocked + change_blocked)
        self.active_threats = max(0, self.active_threats + change_active)
        self.safe_prompts = max(0, self.safe_prompts + change_safe)
        
        # Update distribution (worldwide live data)
        self.attack_distribution = {
            "Critical": random.randint(5, 45),
            "High": random.randint(10, 35),
            "Medium": random.randint(8, 25),
            "Low": random.randint(3, 20),
            "Info": random.randint(1, 15)
        }
        # Normalize to ensure sum ~100
        total = sum(self.attack_distribution.values())
        if total > 0:
            for k in self.attack_distribution:
                self.attack_distribution[k] = int(self.attack_distribution[k] / total * 100)
        
        # Determine threat level and risk score based on attacks
        crit = self.attack_distribution.get("Critical", 0)
        high = self.attack_distribution.get("High", 0)
        if crit > 30:
            self.threat_level = "CRITICAL"
            self.risk_score = min(100, crit + random.randint(10, 30))
        elif crit > 15 or high > 40:
            self.threat_level = "HIGH"
            self.risk_score = min(100, crit + high + random.randint(5, 20))
        elif crit > 5 or high > 20:
            self.threat_level = "MEDIUM"
            self.risk_score = random.randint(30, 60)
        else:
            self.threat_level = "LOW"
            self.risk_score = random.randint(5, 30)
            
    def add_live_threat(self):
        attack_type = random.choice(ATTACK_TYPES)
        detail = ATTACK_DETAILS.get(attack_type, "Suspicious Pattern")
        timestamp = datetime.now().strftime("%H:%M:%S")
        new_threat = {
            "time": timestamp,
            "type": attack_type,
            "detail": detail,
            "severity": random.choice(["Critical", "High", "Medium", "Low"])
        }
        self.live_threats.insert(0, new_threat)
        if len(self.live_threats) > 15:
            self.live_threats.pop()
        return new_threat

# --- WebSocket Connection Manager ---
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