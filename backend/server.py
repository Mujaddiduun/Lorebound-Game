from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
from pymongo import MongoClient
import uuid
from datetime import datetime, timedelta
import json

# Initialize FastAPI app
app = FastAPI(title="Lorebound API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
try:
    client = MongoClient(MONGO_URL)
    db = client.lorebound
    print(f"Connected to MongoDB at {MONGO_URL}")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    db = None

# Pydantic models
class PlayerProfile(BaseModel):
    wallet_address: str
    username: Optional[str] = None
    level: int = 1
    xp: int = 0
    traits: Dict[str, int] = {}
    completed_missions: List[str] = []
    current_zone: str = "forest_echoes"
    created_at: Optional[datetime] = None

class Mission(BaseModel):
    mission_id: str
    name: str
    description: str
    zone: str
    xp_reward: int = 10
    trait_rewards: Dict[str, int] = {}
    requirements: Dict[str, int] = {}
    is_active: bool = True
    created_at: Optional[datetime] = None

class MissionCompletion(BaseModel):
    wallet_address: str
    mission_id: str
    transaction_signature: Optional[str] = None

class GameState(BaseModel):
    wallet_address: str
    current_zone: str
    available_missions: List[str] = []
    zone_progress: Dict[str, int] = {}

# Helper functions
def get_xp_for_level(level: int) -> int:
    """Calculate XP required for a given level"""
    return level * 100 + (level - 1) * 50

def calculate_level_from_xp(xp: int) -> int:
    """Calculate level based on current XP"""
    level = 1
    while get_xp_for_level(level + 1) <= xp:
        level += 1
    return level

# API Routes
@app.get("/")
async def root():
    return {"message": "Lorebound API is running", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/api/players/profile")
async def create_or_get_profile(profile_data: dict):
    """Create or retrieve player profile"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    wallet_address = profile_data.get("wallet_address")
    if not wallet_address:
        raise HTTPException(status_code=400, detail="Wallet address required")
    
    # Check if profile exists
    existing_profile = db.players.find_one({"wallet_address": wallet_address})
    
    if existing_profile:
        # Convert MongoDB ObjectId to string for JSON serialization
        existing_profile["_id"] = str(existing_profile["_id"])
        return existing_profile
    
    # Create new profile
    new_profile = PlayerProfile(
        wallet_address=wallet_address,
        username=profile_data.get("username", f"Player_{wallet_address[:8]}"),
        created_at=datetime.now()
    )
    
    profile_dict = new_profile.dict()
    profile_dict["profile_id"] = str(uuid.uuid4())
    
    result = db.players.insert_one(profile_dict)
    profile_dict["_id"] = str(result.inserted_id)
    
    return profile_dict

@app.get("/api/players/{wallet_address}")
async def get_player_profile(wallet_address: str):
    """Get player profile by wallet address"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    profile = db.players.find_one({"wallet_address": wallet_address})
    if not profile:
        raise HTTPException(status_code=404, detail="Player profile not found")
    
    profile["_id"] = str(profile["_id"])
    return profile

@app.get("/api/missions")
async def get_available_missions():
    """Get all available missions"""
    # Default missions for the game
    default_missions = [
        {
            "mission_id": "forest_discovery",
            "name": "Discover the Hidden Grove",
            "description": "Explore the mystical forest and uncover ancient secrets",
            "zone": "forest_echoes",
            "xp_reward": 15,
            "trait_rewards": {"explorer": 1},
            "requirements": {},
            "is_active": True
        },
        {
            "mission_id": "ancient_runes",
            "name": "Decipher Ancient Runes",
            "description": "Use your wisdom to decode mysterious stone inscriptions",
            "zone": "forest_echoes",
            "xp_reward": 20,
            "trait_rewards": {"scholar": 1},
            "requirements": {},
            "is_active": True
        },
        {
            "mission_id": "forest_guardian",
            "name": "Face the Forest Guardian",
            "description": "Test your courage against the ancient protector",
            "zone": "forest_echoes",
            "xp_reward": 25,
            "trait_rewards": {"fighter": 1},
            "requirements": {"level": 2},
            "is_active": True
        }
    ]
    
    return {"missions": default_missions}

@app.get("/api/missions/{zone}")
async def get_zone_missions(zone: str):
    """Get missions for a specific zone"""
    all_missions = await get_available_missions()
    zone_missions = [m for m in all_missions["missions"] if m["zone"] == zone]
    return {"zone": zone, "missions": zone_missions}

@app.post("/api/missions/complete")
async def complete_mission(completion: MissionCompletion):
    """Complete a mission and award XP/traits"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    # Get player profile
    profile = db.players.find_one({"wallet_address": completion.wallet_address})
    if not profile:
        raise HTTPException(status_code=404, detail="Player profile not found")
    
    # Check if mission already completed
    if completion.mission_id in profile.get("completed_missions", []):
        raise HTTPException(status_code=400, detail="Mission already completed")
    
    # Get mission details
    all_missions = await get_available_missions()
    mission = next((m for m in all_missions["missions"] if m["mission_id"] == completion.mission_id), None)
    
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    # Check requirements
    current_level = calculate_level_from_xp(profile.get("xp", 0))
    if mission.get("requirements", {}).get("level", 0) > current_level:
        raise HTTPException(status_code=400, detail="Level requirement not met")
    
    # Update player profile
    new_xp = profile.get("xp", 0) + mission["xp_reward"]
    new_level = calculate_level_from_xp(new_xp)
    
    # Update traits
    current_traits = profile.get("traits", {})
    for trait, amount in mission.get("trait_rewards", {}).items():
        current_traits[trait] = current_traits.get(trait, 0) + amount
    
    # Update completed missions
    completed_missions = profile.get("completed_missions", [])
    completed_missions.append(completion.mission_id)
    
    # Update in database
    db.players.update_one(
        {"wallet_address": completion.wallet_address},
        {
            "$set": {
                "xp": new_xp,
                "level": new_level,
                "traits": current_traits,
                "completed_missions": completed_missions,
                "last_mission_completed": datetime.now()
            }
        }
    )
    
    return {
        "success": True,
        "mission_completed": mission["name"],
        "xp_gained": mission["xp_reward"],
        "new_xp": new_xp,
        "new_level": new_level,
        "traits_gained": mission.get("trait_rewards", {}),
        "current_traits": current_traits
    }

@app.get("/api/game-state/{wallet_address}")
async def get_game_state(wallet_address: str):
    """Get current game state for player"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    profile = db.players.find_one({"wallet_address": wallet_address})
    if not profile:
        raise HTTPException(status_code=404, detail="Player profile not found")
    
    # Get available missions for current zone
    current_zone = profile.get("current_zone", "forest_echoes")
    zone_missions_response = await get_zone_missions(current_zone)
    
    # Filter out completed missions
    completed_missions = profile.get("completed_missions", [])
    available_missions = [
        m for m in zone_missions_response["missions"] 
        if m["mission_id"] not in completed_missions
    ]
    
    return {
        "wallet_address": wallet_address,
        "current_zone": current_zone,
        "level": profile.get("level", 1),
        "xp": profile.get("xp", 0),
        "traits": profile.get("traits", {}),
        "available_missions": available_missions,
        "completed_missions_count": len(completed_missions)
    }

@app.post("/api/honeycomb/project")
async def create_honeycomb_project():
    """Create a Honeycomb project (placeholder for frontend implementation)"""
    return {
        "message": "Honeycomb project creation should be handled on frontend with wallet",
        "instructions": "Use @honeycomb-protocol/edge-client to create project with wallet signing"
    }

@app.get("/api/zones")
async def get_available_zones():
    """Get all available game zones"""
    zones = [
        {
            "zone_id": "forest_echoes",
            "name": "Forest of Echoes",
            "description": "A mystical woodland where ancient spirits whisper secrets",
            "level_requirement": 1,
            "unlocked": True
        },
        {
            "zone_id": "crystal_caverns",
            "name": "Crystal Caverns",
            "description": "Deep underground halls filled with magical crystals",
            "level_requirement": 3,
            "unlocked": False
        },
        {
            "zone_id": "sky_citadel",
            "name": "Sky Citadel",
            "description": "Floating fortress of the ancient mages",
            "level_requirement": 5,
            "unlocked": False
        }
    ]
    
    return {"zones": zones}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)