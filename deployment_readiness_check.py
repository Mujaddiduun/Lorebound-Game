#!/usr/bin/env python3
"""
Lorebound Deployment Readiness Check
Verifies the application is ready for production deployment
"""

import os
import json
import subprocess
import requests
from pathlib import Path

class DeploymentReadinessChecker:
    def __init__(self):
        self.project_root = Path("/home/project")
        self.frontend_path = self.project_root / "frontend"
        self.backend_path = self.project_root / "backend"
        
    def check_file_structure(self):
        """Check if all required files are present"""
        print("📁 Checking File Structure...")
        
        required_files = {
            "Frontend": [
                "frontend/package.json",
                "frontend/src/App.js",
                "frontend/src/index.js",
                "frontend/public/index.html"
            ],
            "Backend": [
                "backend/server.py",
                "backend/requirements.txt"
            ],
            "Configuration": [
                "README.md"
            ]
        }
        
        all_present = True
        for category, files in required_files.items():
            print(f"\n{category}:")
            for file_path in files:
                full_path = self.project_root / file_path
                exists = full_path.exists()
                status = "✅" if exists else "❌"
                print(f"  {status} {file_path}")
                if not exists:
                    all_present = False
        
        return all_present
    
    def check_dependencies(self):
        """Check if all dependencies are properly configured"""
        print("\n📦 Checking Dependencies...")
        
        # Check frontend dependencies
        package_json_path = self.frontend_path / "package.json"
        if package_json_path.exists():
            with open(package_json_path) as f:
                package_data = json.load(f)
            
            required_deps = [
                "@solana/wallet-adapter-react",
                "@solana/wallet-adapter-wallets",
                "@solana/web3.js",
                "@honeycomb-protocol/edge-client",
                "react",
                "lucide-react"
            ]
            
            dependencies = {**package_data.get("dependencies", {}), **package_data.get("devDependencies", {})}
            
            print("Frontend Dependencies:")
            all_deps_present = True
            for dep in required_deps:
                present = dep in dependencies
                status = "✅" if present else "❌"
                version = dependencies.get(dep, "Not found")
                print(f"  {status} {dep}: {version}")
                if not present:
                    all_deps_present = False
        else:
            print("❌ package.json not found")
            all_deps_present = False
        
        # Check backend dependencies
        requirements_path = self.backend_path / "requirements.txt"
        if requirements_path.exists():
            with open(requirements_path) as f:
                requirements = f.read().strip().split('\n')
            
            print("\nBackend Dependencies:")
            required_backend_deps = ["fastapi", "uvicorn", "pymongo", "python-multipart"]
            
            for dep in required_backend_deps:
                found = any(dep in req for req in requirements)
                status = "✅" if found else "❌"
                print(f"  {status} {dep}")
                if not found:
                    all_deps_present = False
        else:
            print("❌ requirements.txt not found")
            all_deps_present = False
        
        return all_deps_present
    
    def check_configuration(self):
        """Check configuration and environment setup"""
        print("\n⚙️  Checking Configuration...")
        
        config_checks = []
        
        # Check if frontend has proper build configuration
        package_json_path = self.frontend_path / "package.json"
        if package_json_path.exists():
            with open(package_json_path) as f:
                package_data = json.load(f)
            
            has_build_script = "build" in package_data.get("scripts", {})
            has_start_script = "start" in package_data.get("scripts", {})
            
            print(f"✅ Build script present: {has_build_script}")
            print(f"✅ Start script present: {has_start_script}")
            
            config_checks.extend([has_build_script, has_start_script])
        
        # Check backend configuration
        server_path = self.backend_path / "server.py"
        if server_path.exists():
            with open(server_path) as f:
                server_content = f.read()
            
            has_cors = "CORSMiddleware" in server_content
            has_mongo_config = "MONGO_URL" in server_content
            has_uvicorn = "uvicorn" in server_content
            
            print(f"✅ CORS configured: {has_cors}")
            print(f"✅ MongoDB configuration: {has_mongo_config}")
            print(f"✅ Uvicorn server setup: {has_uvicorn}")
            
            config_checks.extend([has_cors, has_mongo_config, has_uvicorn])
        
        return all(config_checks)
    
    def check_build_capability(self):
        """Test if the application can be built"""
        print("\n🔨 Testing Build Capability...")
        
        try:
            # Test frontend build
            os.chdir(self.frontend_path)
            result = subprocess.run(["npm", "run", "build"], 
                                  capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                print("✅ Frontend builds successfully")
                build_dir = self.frontend_path / "build"
                if build_dir.exists():
                    print("✅ Build directory created")
                    return True
                else:
                    print("❌ Build directory not found")
                    return False
            else:
                print(f"❌ Frontend build failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            print("❌ Build process timed out")
            return False
        except Exception as e:
            print(f"❌ Build test failed: {str(e)}")
            return False
    
    def check_game_completeness(self):
        """Check if the game has all required features"""
        print("\n🎮 Checking Game Completeness...")
        
        app_js_path = self.frontend_path / "src" / "App.js"
        if app_js_path.exists():
            with open(app_js_path) as f:
                app_content = f.read()
            
            game_features = {
                "Wallet Integration": "WalletProvider" in app_content and "useWallet" in app_content,
                "Honeycomb Integration": "honeycomb" in app_content.lower() and "edge-client" in app_content,
                "Mission System": "mission" in app_content.lower() and "complete" in app_content.lower(),
                "Trait System": "trait" in app_content.lower(),
                "XP System": "xp" in app_content.lower() and "level" in app_content.lower(),
                "Game UI": "GameInterface" in app_content or "game" in app_content.lower(),
                "Profile Management": "profile" in app_content.lower() and "player" in app_content.lower()
            }
            
            for feature, present in game_features.items():
                status = "✅" if present else "❌"
                print(f"  {status} {feature}")
            
            return all(game_features.values())
        else:
            print("❌ App.js not found")
            return False
    
    def generate_deployment_report(self):
        """Generate comprehensive deployment readiness report"""
        print("\n" + "=" * 60)
        print("🚀 LOREBOUND DEPLOYMENT READINESS REPORT")
        print("=" * 60)
        
        checks = {
            "File Structure": self.check_file_structure(),
            "Dependencies": self.check_dependencies(),
            "Configuration": self.check_configuration(),
            "Build Capability": self.check_build_capability(),
            "Game Completeness": self.check_game_completeness()
        }
        
        print(f"\n📊 READINESS SUMMARY:")
        passed_checks = 0
        for check_name, result in checks.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {status} {check_name}")
            if result:
                passed_checks += 1
        
        total_checks = len(checks)
        readiness_score = (passed_checks / total_checks) * 100
        
        print(f"\n🎯 OVERALL READINESS: {passed_checks}/{total_checks} ({readiness_score:.1f}%)")
        
        if readiness_score >= 80:
            print("\n🎉 LOREBOUND IS READY FOR DEPLOYMENT!")
            print("✅ All critical systems operational")
            print("✅ Build process functional")
            print("✅ Game features complete")
            print("\n📋 DEPLOYMENT RECOMMENDATIONS:")
            print("  • Deploy backend to cloud service (Railway, Heroku, etc.)")
            print("  • Deploy frontend to static hosting (Netlify, Vercel, etc.)")
            print("  • Configure environment variables for production")
            print("  • Set up MongoDB Atlas for production database")
            print("  • Test on Solana Devnet before mainnet")
        else:
            print("\n⚠️  LOREBOUND NEEDS ADDITIONAL WORK BEFORE DEPLOYMENT")
            failed_checks = [name for name, result in checks.items() if not result]
            print(f"Failed checks: {', '.join(failed_checks)}")
            print("\n🔧 RECOMMENDED ACTIONS:")
            if not checks["Dependencies"]:
                print("  • Install missing dependencies")
            if not checks["Configuration"]:
                print("  • Fix configuration issues")
            if not checks["Build Capability"]:
                print("  • Resolve build errors")
            if not checks["Game Completeness"]:
                print("  • Implement missing game features")
        
        return readiness_score >= 80

if __name__ == "__main__":
    checker = DeploymentReadinessChecker()
    ready = checker.generate_deployment_report()
    exit(0 if ready else 1)