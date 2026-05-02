# main.py - Main FastAPI Application with Modern Lifespan
import random
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from typing import List, Dict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

# Import from other files
from data_models import DashboardState, ConnectionManager, ATTACK_TYPES, ATTACK_DETAILS
from api_routes import router
from html_template import get_html_template

# --- Global state and manager (will be initialized in lifespan) ---
state = None
manager = None

# --- Lifespan Context Manager (replaces @app.on_event) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize state and background tasks
    global state, manager
    print("🚀 AI Shield X API starting up...")
    
    state = DashboardState()
    manager = ConnectionManager()
    
    # Seed initial threats
    for _ in range(8):
        state.add_live_threat()
    state.update_with_random_data()
    
    # Start background data updater task
    async def data_updater():
        while True:
            await asyncio.sleep(3)  # Update every 3 seconds
            if state and manager:
                state.update_with_random_data()
                # Add a new threat occasionally (70% chance)
                if random.random() < 0.7:
                    state.add_live_threat()
                
                # Broadcast to all connected WebSocket clients
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
                    "new_threat": state.live_threats[0] if state.live_threats else None,
                    "all_threats": state.live_threats
                })
    
    # Run the background task
    task = asyncio.create_task(data_updater())
    
    yield  # The application runs here
    
    # Shutdown: Clean up resources
    print("🛑 AI Shield X API shutting down...")
    task.cancel()
    await task
    # Additional cleanup if needed
    state = None
    manager = None

# --- Create FastAPI app with lifespan ---
app = FastAPI(
    title="AI Shield X API",
    description="Backend for AI Defense Dashboard",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)

# --- WebSocket endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global state, manager
    if manager is None or state is None:
        await websocket.close(code=1011, reason="Server initializing")
        return
        
    await manager.connect(websocket)
    try:
        # Send initial data
        from api_routes import get_stats, get_live_threats, get_attack_origins
        await websocket.send_json({
            "type": "init",
            "data": {
                "stats": await get_stats(),
                "threats": await get_live_threats(),
                "origins": await get_attack_origins()
            }
        })
        # Keep connection alive
        while True:
            try:
                await websocket.receive_text()
            except:
                break
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- Serve Frontend HTML ---
@app.get("/")
async def serve_dashboard():
    return HTMLResponse(content=get_html_template())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)