# api_routes.py - API Route Definitions
from fastapi import APIRouter
from data_models import DashboardState

# Global state will be set by main.py
state = None

def set_global_state(global_state):
    global state
    state = global_state

router = APIRouter()

@router.get("/api/stats")
async def get_stats():
    """Get all dashboard statistics"""
    from main import state
    if state is None:
        return {"error": "System initializing"}
    return {
        "total_attacks_blocked": state.total_attacks_blocked,
        "active_threats": state.active_threats,
        "safe_prompts": state.safe_prompts,
        "attack_distribution": state.attack_distribution,
        "threat_level": state.threat_level,
        "risk_score": state.risk_score
    }

@router.get("/api/live-threats")
async def get_live_threats():
    """Get recent live threat feed"""
    from main import state
    if state is None:
        return {"threats": []}
    return {"threats": state.live_threats}

@router.get("/api/attack-origins")
async def get_attack_origins():
    """Get top attack origins (worldwide)"""
    origins = [
        {"country": "United States", "percentage": 28, "color": "#ff4d4d"},
        {"country": "China", "percentage": 21, "color": "#ff9900"},
        {"country": "Russia", "percentage": 15, "color": "#ffcc00"},
        {"country": "Germany", "percentage": 9, "color": "#44ff44"},
        {"country": "India", "percentage": 8, "color": "#44aaff"},
        {"country": "United Kingdom", "percentage": 7, "color": "#aa44ff"},
        {"country": "France", "percentage": 5, "color": "#ff44aa"},
        {"country": "Others", "percentage": 7, "color": "#888888"}
    ]
    return {"origins": origins}