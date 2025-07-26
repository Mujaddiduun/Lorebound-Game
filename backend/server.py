from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
from pymongo import MongoClient
import uuid
from datetime import datetime, timedelta
import json
import random
from typing import Optional, Dict, Any

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

class LoreNFT(BaseModel):
    nft_id: str
    name: str
    description: str
    image_url: str
    lore_text: str
    rarity: str = "common"  # common, rare, legendary
    unlocked_by_mission: str
    created_at: Optional[datetime] = None

class SquadQuest(BaseModel):
    squad_id: str
    quest_id: str
    required_players: int = 3
    current_players: List[str] = []
    xp_pool: int = 0
    status: str = "recruiting"  # recruiting, active, completed
    created_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class TimeGatedEvent(BaseModel):
    event_id: str
    name: str
    description: str
    start_time: datetime
    end_time: datetime
    rewards: Dict[str, int] = {}
    participants: List[str] = []
    is_active: bool = True
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

def generate_procedural_quest(player_traits: Dict[str, int], completed_missions: List[str]) -> Dict[str, Any]:
    """Generate a procedural quest based on player traits and history"""
    quest_templates = [
        {
            "base_id": "proc_ancient_artifact",
            "name": "Seek the {artifact_type}",
            "description": "Your {dominant_trait} nature calls you to find the legendary {artifact_type}",
            "xp_base": 30,
            "trait_requirements": {"any": 2}
        },
        {
            "base_id": "proc_shadow_trial",
            "name": "Trial of {trial_type}",
            "description": "Face the shadow trial that tests your {dominant_trait} abilities",
            "xp_base": 25,
            "trait_requirements": {"any": 3}
        },
        {
            "base_id": "proc_elemental_challenge",
            "name": "Elemental {element} Challenge",
            "description": "Master the power of {element} using your {dominant_trait} skills",
            "xp_base": 35,
            "trait_requirements": {"specific": 5}
        }
    ]
    
    # Determine dominant trait
    dominant_trait = max(player_traits.items(), key=lambda x: x[1])[0] if player_traits else "explorer"
    
    # Select appropriate template
    available_templates = []
    for template in quest_templates:
        if template["trait_requirements"]["any"] <= sum(player_traits.values()):
            available_templates.append(template)
    
    if not available_templates:
        available_templates = [quest_templates[0]]  # Fallback
    
    selected_template = random.choice(available_templates)
    
    # Generate unique quest
    artifacts = ["Crystal of Echoes", "Tome of Shadows", "Blade of Elements", "Crown of Wisdom"]
    trials = ["Courage", "Wisdom", "Strength", "Cunning"]
    elements = ["Fire", "Water", "Earth", "Air", "Shadow", "Light"]
    
    quest_id = f"{selected_template['base_id']}_{random.randint(1000, 9999)}"
    
    # Customize based on template
    if "artifact" in selected_template["base_id"]:
        artifact = random.choice(artifacts)
        name = selected_template["name"].format(artifact_type=artifact)
        description = selected_template["description"].format(dominant_trait=dominant_trait, artifact_type=artifact)
    elif "trial" in selected_template["base_id"]:
        trial = random.choice(trials)
        name = selected_template["name"].format(trial_type=trial)
        description = selected_template["description"].format(dominant_trait=dominant_trait, trial_type=trial)
    else:
        element = random.choice(elements)
        name = selected_template["name"].format(element=element)
        description = selected_template["description"].format(dominant_trait=dominant_trait, element=element)
    
    # Calculate rewards based on player progression
    xp_multiplier = 1 + (sum(player_traits.values()) * 0.1)
    xp_reward = int(selected_template["xp_base"] * xp_multiplier)
    
    return {
        "mission_id": quest_id,
        "name": name,
        "description": description,
        "zone": "procedural_realm",
        "xp_reward": xp_reward,
        "trait_rewards": {dominant_trait: 1},
        "requirements": {"total_traits": template["trait_requirements"]["any"]},
        "is_active": True,
        "is_procedural": True,
        "expires_at": datetime.now() + timedelta(hours=24)
    }

def get_lore_nft_for_mission(mission_id: str) -> Optional[Dict[str, Any]]:
    """Get lore NFT data for completed mission"""
    lore_nfts = {
        "forest_discovery": {
            "nft_id": f"lore_forest_{random.randint(1000, 9999)}",
            "name": "Echo of the Ancient Grove",
            "description": "A mystical echo captured from the heart of the ancient forest",
            "image_url": "https://images.pexels.com/photos/1496373/pexels-photo-1496373.jpeg",
            "lore_text": "In the depths of the Forest of Echoes, where time moves differently, you discovered the whispers of ancient druids. Their voices still linger in this ethereal fragment.",
            "rarity": "common"
        },
        "ancient_runes": {
            "nft_id": f"lore_runes_{random.randint(1000, 9999)}",
            "name": "Scroll of Forgotten Knowledge",
            "description": "Ancient wisdom preserved in mystical runes",
            "image_url": "https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg",
            "lore_text": "These runes speak of a civilization that mastered the art of binding knowledge to stone. Each symbol pulses with accumulated wisdom of millennia.",
            "rarity": "rare"
        },
        "forest_guardian": {
            "nft_id": f"lore_guardian_{random.randint(1000, 9999)}",
            "name": "Guardian's Blessing",
            "description": "A blessing bestowed by the ancient forest guardian",
            "image_url": "https://images.pexels.com/photos/1438761/pexels-photo-1438761.jpeg",
            "lore_text": "The Forest Guardian, ancient beyond measure, recognized your courage. This blessing carries the protective essence of the primordial woods.",
            "rarity": "legendary"
        }
    }
    
    return lore_nfts.get(mission_id)
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

@app.get("/api/missions/procedural/{wallet_address}")
async def get_procedural_missions(wallet_address: str):
    """Generate procedural missions for player"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    profile = db.players.find_one({"wallet_address": wallet_address})
    if not profile:
        raise HTTPException(status_code=404, detail="Player profile not found")
    
    # Check if player has existing procedural missions
    existing_procedural = db.procedural_missions.find_one({
        "wallet_address": wallet_address,
        "expires_at": {"$gt": datetime.now()}
    })
    
    if existing_procedural:
        return {"procedural_mission": existing_procedural}
    
    # Generate new procedural mission
    traits = profile.get("traits", {})
    completed_missions = profile.get("completed_missions", [])
    
    if sum(traits.values()) < 2:  # Need at least 2 trait points
        return {"procedural_mission": None, "message": "Complete more missions to unlock procedural quests"}
    
    procedural_mission = generate_procedural_quest(traits, completed_missions)
    
    # Store in database
    mission_doc = {
        "wallet_address": wallet_address,
        "mission_data": procedural_mission,
        "created_at": datetime.now(),
        "expires_at": procedural_mission["expires_at"]
    }
    
    db.procedural_missions.insert_one(mission_doc)
    
    return {"procedural_mission": procedural_mission}
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
@app.get("/api/lore-nfts/{wallet_address}")
async def get_player_lore_nfts(wallet_address: str):
    """Get all lore NFTs owned by player"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    nfts = list(db.lore_nfts.find({"wallet_address": wallet_address}))
    
    # Convert ObjectId to string
    for nft in nfts:
        nft["_id"] = str(nft["_id"])
    
    return {"lore_nfts": nfts}

@app.post("/api/squad-quests/create")
async def create_squad_quest(squad_data: dict):
    """Create a new squad quest"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    squad_quest = {
        "squad_id": f"squad_{random.randint(10000, 99999)}",
        "quest_id": "squad_ancient_temple",
        "name": "Raid the Ancient Temple",
        "description": "Team up with other explorers to uncover the secrets of the Ancient Temple",
        "required_players": squad_data.get("required_players", 3),
        "current_players": [squad_data.get("creator_wallet")],
        "xp_pool": 150,  # Shared among participants
        "trait_rewards": {"teamwork": 2},
        "status": "recruiting",
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(hours=48)
    }
    
    result = db.squad_quests.insert_one(squad_quest)
    squad_quest["_id"] = str(result.inserted_id)
    
    return {"squad_quest": squad_quest}

@app.get("/api/squad-quests/available")
async def get_available_squad_quests():
    """Get all available squad quests"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    squad_quests = list(db.squad_quests.find({
        "status": "recruiting",
        "expires_at": {"$gt": datetime.now()}
    }))
    
    for quest in squad_quests:
        quest["_id"] = str(quest["_id"])
    
    return {"squad_quests": squad_quests}

@app.post("/api/squad-quests/join")
async def join_squad_quest(join_data: dict):
    """Join an existing squad quest"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    squad_id = join_data.get("squad_id")
    wallet_address = join_data.get("wallet_address")
    
    squad_quest = db.squad_quests.find_one({"squad_id": squad_id})
    if not squad_quest:
        raise HTTPException(status_code=404, detail="Squad quest not found")
    
    if wallet_address in squad_quest["current_players"]:
        raise HTTPException(status_code=400, detail="Already joined this squad quest")
    
    if len(squad_quest["current_players"]) >= squad_quest["required_players"]:
        raise HTTPException(status_code=400, detail="Squad quest is full")
    
    # Add player to squad
    updated_players = squad_quest["current_players"] + [wallet_address]
    new_status = "active" if len(updated_players) >= squad_quest["required_players"] else "recruiting"
    
    db.squad_quests.update_one(
        {"squad_id": squad_id},
        {
            "$set": {
                "current_players": updated_players,
                "status": new_status
            }
        }
    )
    
    return {"success": True, "squad_status": new_status, "players_joined": len(updated_players)}

@app.get("/api/events/active")
async def get_active_events():
    """Get currently active time-gated events"""
    current_time = datetime.now()
    
    # Sample time-gated events
    events = [
        {
            "event_id": "lunar_eclipse_2024",
            "name": "Lunar Eclipse Ritual",
            "description": "During the lunar eclipse, ancient magic flows stronger. Complete missions for double XP!",
            "start_time": current_time - timedelta(hours=1),
            "end_time": current_time + timedelta(hours=23),
            "rewards": {"xp_multiplier": 2.0, "special_trait": "lunar_blessed"},
            "is_active": True,
            "participants": []
        },
        {
            "event_id": "shadow_convergence",
            "name": "Shadow Convergence",
            "description": "The shadows grow restless. Face them for unique rewards.",
            "start_time": current_time + timedelta(hours=12),
            "end_time": current_time + timedelta(hours=36),
            "rewards": {"special_mission": "shadow_realm_access", "trait_bonus": {"trickster": 3}},
            "is_active": False,
            "participants": []
        }
    ]
    
    # Filter active events
    active_events = [
        event for event in events 
        if event["start_time"] <= current_time <= event["end_time"]
    ]
    
    return {"active_events": active_events, "upcoming_events": [e for e in events if not e["is_active"]]}

@app.post("/api/events/participate")
async def participate_in_event(participation_data: dict):
    """Participate in a time-gated event"""
    wallet_address = participation_data.get("wallet_address")
    event_id = participation_data.get("event_id")
    
    # For now, just return success - in a real implementation, you'd track participation
    return {
        "success": True,
        "message": f"Successfully joined event {event_id}",
        "active_bonuses": ["2x XP multiplier active"]
    }
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