#!/usr/bin/env python3
"""
Additional test to verify level progression system
"""

import requests
import json

BACKEND_URL = "https://34fd99f9-5fd5-40e4-8eeb-84efe18b8224.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Create a new test player for level progression test
TEST_WALLET_LEVEL = "LevelTestWallet123456789ABCDEF"

def test_level_progression():
    """Test that players level up correctly when reaching XP thresholds"""
    session = requests.Session()
    
    print("🎮 Testing Level Progression System")
    print("=" * 40)
    
    # Create new player
    profile_data = {
        "wallet_address": TEST_WALLET_LEVEL,
        "username": "LevelTester"
    }
    
    response = session.post(f"{API_BASE}/players/profile", json=profile_data)
    if response.status_code != 200:
        print("❌ Failed to create test player")
        return False
    
    print("✅ Created test player")
    
    # Complete multiple missions to accumulate XP
    missions = ["forest_discovery", "ancient_runes"]  # 15 + 20 = 35 XP
    
    for mission_id in missions:
        completion_data = {
            "wallet_address": TEST_WALLET_LEVEL,
            "mission_id": mission_id,
            "transaction_signature": f"test_sig_{mission_id}"
        }
        
        response = session.post(f"{API_BASE}/missions/complete", json=completion_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Completed {mission_id}: XP={data.get('new_xp')}, Level={data.get('new_level')}")
        else:
            print(f"❌ Failed to complete {mission_id}")
    
    # Check final player state
    response = session.get(f"{API_BASE}/players/{TEST_WALLET_LEVEL}")
    if response.status_code == 200:
        data = response.json()
        xp = data.get("xp", 0)
        level = data.get("level", 1)
        traits = data.get("traits", {})
        
        print(f"\n📊 Final Player State:")
        print(f"   XP: {xp}")
        print(f"   Level: {level}")
        print(f"   Traits: {traits}")
        
        # With 35 XP, player should still be level 1 (needs 150 XP for level 2)
        # Level 1: 0-149 XP, Level 2: 150-299 XP, etc.
        expected_level = 1
        if level == expected_level and xp == 35:
            print("✅ Level progression working correctly")
            return True
        else:
            print(f"❌ Level progression issue: Expected level {expected_level} with 35 XP, got level {level}")
            return False
    else:
        print("❌ Failed to retrieve final player state")
        return False

if __name__ == "__main__":
    success = test_level_progression()
    print(f"\n{'🎉 Level progression test PASSED' if success else '❌ Level progression test FAILED'}")