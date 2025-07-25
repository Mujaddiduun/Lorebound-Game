#!/usr/bin/env python3
"""
Lorebound Game Backend API Tests
Tests all backend endpoints for the Lorebound on-chain explorer game
"""

import requests
import json
import time
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://34fd99f9-5fd5-40e4-8eeb-84efe18b8224.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Test data - realistic game data
TEST_WALLET_1 = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"  # Realistic Solana wallet address
TEST_WALLET_2 = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"  # Second test wallet
TEST_USERNAME_1 = "EchoSeeker"
TEST_USERNAME_2 = "RuneMaster"

class LoreboundBackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
        
    def test_health_check(self):
        """Test API health endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/health")
            success = response.status_code == 200 and "status" in response.json()
            details = f"Status: {response.status_code}, Response: {response.json()}"
            self.log_test("API Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("API Health Check", False, f"Exception: {str(e)}")
            return False
            
    def test_root_endpoint(self):
        """Test root endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/../")  # This will return HTML from frontend
            # Since root returns HTML, we just check if it's accessible
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Content-Type: {response.headers.get('content-type', 'unknown')}"
            self.log_test("Root Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_create_player_profile(self):
        """Test player profile creation"""
        try:
            # Test creating first player profile
            profile_data = {
                "wallet_address": TEST_WALLET_1,
                "username": TEST_USERNAME_1
            }
            
            response = self.session.post(f"{API_BASE}/players/profile", json=profile_data)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = (
                    data.get("wallet_address") == TEST_WALLET_1 and
                    data.get("username") == TEST_USERNAME_1 and
                    data.get("level") == 1 and
                    data.get("xp") == 0 and
                    "profile_id" in data
                )
                details = f"Profile created: {data.get('username')}, Level: {data.get('level')}, XP: {data.get('xp')}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("Create Player Profile", success, details)
            return success
        except Exception as e:
            self.log_test("Create Player Profile", False, f"Exception: {str(e)}")
            return False
    
    def test_get_player_profile(self):
        """Test retrieving player profile"""
        try:
            response = self.session.get(f"{API_BASE}/players/{TEST_WALLET_1}")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = (
                    data.get("wallet_address") == TEST_WALLET_1 and
                    data.get("username") == TEST_USERNAME_1 and
                    "level" in data and
                    "xp" in data
                )
                details = f"Retrieved profile: {data.get('username')}, Level: {data.get('level')}, XP: {data.get('xp')}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("Get Player Profile", success, details)
            return success
        except Exception as e:
            self.log_test("Get Player Profile", False, f"Exception: {str(e)}")
            return False
    
    def test_get_available_missions(self):
        """Test retrieving available missions"""
        try:
            response = self.session.get(f"{API_BASE}/missions")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                missions = data.get("missions", [])
                success = (
                    len(missions) >= 3 and
                    any(m.get("mission_id") == "forest_discovery" for m in missions) and
                    any(m.get("mission_id") == "ancient_runes" for m in missions) and
                    any(m.get("mission_id") == "forest_guardian" for m in missions)
                )
                details = f"Found {len(missions)} missions: {[m.get('name') for m in missions]}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("Get Available Missions", success, details)
            return success
        except Exception as e:
            self.log_test("Get Available Missions", False, f"Exception: {str(e)}")
            return False
    
    def test_get_zone_missions(self):
        """Test retrieving missions for specific zone"""
        try:
            response = self.session.get(f"{API_BASE}/missions/forest_echoes")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = (
                    data.get("zone") == "forest_echoes" and
                    len(data.get("missions", [])) >= 3
                )
                details = f"Zone: {data.get('zone')}, Missions: {len(data.get('missions', []))}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("Get Zone Missions", success, details)
            return success
        except Exception as e:
            self.log_test("Get Zone Missions", False, f"Exception: {str(e)}")
            return False
    
    def test_complete_mission(self):
        """Test mission completion workflow"""
        try:
            # Complete forest_discovery mission
            completion_data = {
                "wallet_address": TEST_WALLET_1,
                "mission_id": "forest_discovery",
                "transaction_signature": "test_signature_123"
            }
            
            response = self.session.post(f"{API_BASE}/missions/complete", json=completion_data)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = (
                    data.get("success") == True and
                    data.get("xp_gained") == 15 and
                    data.get("new_xp") == 15 and
                    "explorer" in data.get("traits_gained", {})
                )
                details = f"Mission: {data.get('mission_completed')}, XP gained: {data.get('xp_gained')}, Traits: {data.get('traits_gained')}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("Complete Mission", success, details)
            return success
        except Exception as e:
            self.log_test("Complete Mission", False, f"Exception: {str(e)}")
            return False
    
    def test_complete_second_mission(self):
        """Test completing another mission for XP accumulation"""
        try:
            # Complete ancient_runes mission
            completion_data = {
                "wallet_address": TEST_WALLET_1,
                "mission_id": "ancient_runes",
                "transaction_signature": "test_signature_456"
            }
            
            response = self.session.post(f"{API_BASE}/missions/complete", json=completion_data)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = (
                    data.get("success") == True and
                    data.get("xp_gained") == 20 and
                    data.get("new_xp") == 35 and  # 15 + 20
                    "scholar" in data.get("traits_gained", {})
                )
                details = f"Mission: {data.get('mission_completed')}, Total XP: {data.get('new_xp')}, New traits: {data.get('traits_gained')}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("Complete Second Mission", success, details)
            return success
        except Exception as e:
            self.log_test("Complete Second Mission", False, f"Exception: {str(e)}")
            return False
    
    def test_level_progression(self):
        """Test level calculation after XP gain"""
        try:
            # Get updated profile to check level progression
            response = self.session.get(f"{API_BASE}/players/{TEST_WALLET_1}")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                # With 35 XP, player should still be level 1 (needs 150 XP for level 2)
                success = (
                    data.get("xp") == 35 and
                    data.get("level") == 1 and
                    len(data.get("completed_missions", [])) == 2 and
                    "explorer" in data.get("traits", {}) and
                    "scholar" in data.get("traits", {})
                )
                details = f"XP: {data.get('xp')}, Level: {data.get('level')}, Completed missions: {len(data.get('completed_missions', []))}, Traits: {list(data.get('traits', {}).keys())}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("Level Progression", success, details)
            return success
        except Exception as e:
            self.log_test("Level Progression", False, f"Exception: {str(e)}")
            return False
    
    def test_game_state(self):
        """Test game state endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/game-state/{TEST_WALLET_1}")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = (
                    data.get("wallet_address") == TEST_WALLET_1 and
                    data.get("current_zone") == "forest_echoes" and
                    data.get("xp") == 35 and
                    data.get("level") == 1 and
                    data.get("completed_missions_count") == 2 and
                    len(data.get("available_missions", [])) == 1  # Only forest_guardian left
                )
                details = f"Zone: {data.get('current_zone')}, XP: {data.get('xp')}, Available missions: {len(data.get('available_missions', []))}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("Game State", success, details)
            return success
        except Exception as e:
            self.log_test("Game State", False, f"Exception: {str(e)}")
            return False
    
    def test_level_requirement_check(self):
        """Test mission level requirements"""
        try:
            # Try to complete forest_guardian mission (requires level 2, but player is level 1)
            completion_data = {
                "wallet_address": TEST_WALLET_1,
                "mission_id": "forest_guardian",
                "transaction_signature": "test_signature_789"
            }
            
            response = self.session.post(f"{API_BASE}/missions/complete", json=completion_data)
            # Should fail with 400 status due to level requirement
            success = response.status_code == 400 and "requirement not met" in response.json().get("detail", "").lower()
            details = f"Status: {response.status_code}, Response: {response.json()}"
            
            self.log_test("Level Requirement Check", success, details)
            return success
        except Exception as e:
            self.log_test("Level Requirement Check", False, f"Exception: {str(e)}")
            return False
    
    def test_duplicate_mission_prevention(self):
        """Test prevention of duplicate mission completion"""
        try:
            # Try to complete forest_discovery again
            completion_data = {
                "wallet_address": TEST_WALLET_1,
                "mission_id": "forest_discovery",
                "transaction_signature": "test_signature_duplicate"
            }
            
            response = self.session.post(f"{API_BASE}/missions/complete", json=completion_data)
            # Should fail with 400 status due to already completed
            success = response.status_code == 400 and "already completed" in response.json().get("detail", "").lower()
            details = f"Status: {response.status_code}, Response: {response.json()}"
            
            self.log_test("Duplicate Mission Prevention", success, details)
            return success
        except Exception as e:
            self.log_test("Duplicate Mission Prevention", False, f"Exception: {str(e)}")
            return False
    
    def test_get_zones(self):
        """Test getting available zones"""
        try:
            response = self.session.get(f"{API_BASE}/zones")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                zones = data.get("zones", [])
                success = (
                    len(zones) >= 3 and
                    any(z.get("zone_id") == "forest_echoes" for z in zones) and
                    any(z.get("zone_id") == "crystal_caverns" for z in zones) and
                    any(z.get("zone_id") == "sky_citadel" for z in zones)
                )
                details = f"Found {len(zones)} zones: {[z.get('name') for z in zones]}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("Get Zones", success, details)
            return success
        except Exception as e:
            self.log_test("Get Zones", False, f"Exception: {str(e)}")
            return False
    
    def test_nonexistent_player(self):
        """Test handling of nonexistent player"""
        try:
            fake_wallet = "FakeWalletAddressThatDoesNotExist123456789"
            response = self.session.get(f"{API_BASE}/players/{fake_wallet}")
            success = response.status_code == 404
            details = f"Status: {response.status_code}, Response: {response.json()}"
            
            self.log_test("Nonexistent Player Handling", success, details)
            return success
        except Exception as e:
            self.log_test("Nonexistent Player Handling", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🎮 Starting Lorebound Backend API Tests")
        print("=" * 50)
        
        # Test basic connectivity
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False
            
        self.test_root_endpoint()
        
        # Test player management
        self.test_create_player_profile()
        self.test_get_player_profile()
        
        # Test mission system
        self.test_get_available_missions()
        self.test_get_zone_missions()
        self.test_complete_mission()
        self.test_complete_second_mission()
        
        # Test game progression
        self.test_level_progression()
        self.test_game_state()
        
        # Test validation and edge cases
        self.test_level_requirement_check()
        self.test_duplicate_mission_prevention()
        self.test_nonexistent_player()
        
        # Test zones
        self.test_get_zones()
        
        # Summary
        print("\n" + "=" * 50)
        print("🎮 Test Summary")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Tests passed: {passed}/{total}")
        print(f"Success rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("🎉 All tests passed! Backend is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Check details above.")
            failed_tests = [r["test"] for r in self.test_results if not r["success"]]
            print(f"Failed tests: {', '.join(failed_tests)}")
            return False

if __name__ == "__main__":
    tester = LoreboundBackendTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)