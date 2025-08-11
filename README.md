# Lorebound - 2D Story-Driven Exploration Game

A mystical adventure game that deeply integrates with Honeycomb Protocol to create permanent, on-chain character progression and story choices.

##  Game Overview

Lorebound is a 2D exploration game where players journey through interconnected mystical realms, making choices that permanently shape their character through blockchain-stored traits and progression. Each decision creates unique story paths, making every playthrough a distinct adventure.

### Core Features

- **Zone-Based Exploration**: Navigate through mystical realms including the Forest of Echoes, Crystal Caverns, Shadow Peaks, and Ethereal Gardens
- **Character Trait Evolution**: Permanent character development through story choices and quest completion
- **Branching Narratives**: Multiple story paths with consequences that affect available content
- **Quest System**: Dynamic mission tracking with XP rewards and trait assignments
- **Lore NFTs**: Optional collectible NFTs for major story achievements
- **Responsive Design**: Optimized for both desktop and mobile gameplay

## 🔧 Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type-safe component development
- **Tailwind CSS** for responsive, utility-first styling
- **Lucide React** for consistent iconography
- **HTML5 Canvas** for interactive 2D world map rendering

### Blockchain Integration
- **Honeycomb Protocol** for on-chain game state management
- **Solana Web3.js** for blockchain interactions
- **Wallet Adapter** for seamless wallet connectivity
- **Devnet Deployment** for testing and development

### Game Systems
- **Mission Tracking**: Quest objectives and completion status stored on-chain
- **Trait Assignment**: Character traits permanently recorded via Honeycomb
- **XP Progression**: Experience points and level advancement tracked on-chain
- **Story Choices**: Decision consequences stored for narrative continuity

##  Getting Started

### Prerequisites
- Node.js 18+ and npm
- Solana wallet (Phantom, Solflare, etc.)
- Solana Devnet SOL for transactions

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lorebound
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Connect your wallet**
   - Open the game in your browser
   - Click "Connect Wallet" and select your Solana wallet
   - Ensure you're connected to Solana Devnet

##  Gameplay Guide

### Starting Your Adventure
1. **Connect Wallet**: Link your Solana wallet to create your on-chain identity
2. **Explore the World Map**: Click on unlocked zones to travel and discover new areas
3. **Accept Quests**: Start missions available in your current zone
4. **Make Choices**: Story decisions permanently affect your character traits
5. **Progress & Unlock**: Gain XP, earn traits, and unlock new zones through quest completion

### Character Progression
- **Experience Points**: Earned through quest completion, stored on-chain
- **Levels**: Automatic advancement based on XP thresholds
- **Traits**: Permanent character attributes that affect available content
- **Zone Unlocks**: New areas become accessible based on traits and level

### Quest System
- **Objectives**: Multi-step missions with clear progress tracking
- **Story Choices**: Branching dialogue with permanent consequences
- **Rewards**: XP, traits, zone unlocks, and optional NFT collectibles
- **Replayability**: Different trait combinations unlock unique quest paths

##  Honeycomb Protocol Integration

### Mission Management
```typescript
// Create and track missions via Honeycomb
await HoneycombService.startQuest(questId, walletAddress);
await HoneycombService.completeQuest(questId, walletAddress, choices);
```

### Trait Assignment
```typescript
// Assign permanent character traits
await HoneycombService.assignTrait(playerId, traitId, metadata);
```

### Progression Tracking
```typescript
// Update player XP and level
await HoneycombService.addExperience(playerId, xpAmount);
```

##  Design Philosophy

### Visual Aesthetics
- **Mystical Fantasy Theme**: Deep purples, emerald greens, and golden accents
- **Glassmorphism Effects**: Subtle transparency and backdrop blur for modern UI
- **Particle Systems**: Ambient animations for immersive atmosphere
- **Responsive Layout**: Seamless experience across all device sizes

### User Experience
- **Progressive Disclosure**: Game mechanics revealed contextually
- **Clear Visual Hierarchy**: Important information prominently displayed
- **Smooth Animations**: Polished transitions and micro-interactions
- **Accessibility**: High contrast ratios and readable typography

##  Game Zones

### Forest of Echoes (Starting Zone)
- Ancient woods where whispers of the past linger
- **Quests**: Whispers in the Woods, The Scholar's Path
- **Unlocks**: Crystal Caverns (via Scholar trait)

### Crystal Caverns
- Luminescent caves with magical crystals
- **Requirements**: Explorer trait
- **Quests**: Songs of the Crystal, Deep Mysteries

### Shadow Peaks
- Treacherous mountains in perpetual twilight
- **Requirements**: Level 3, Fighter + Scholar traits
- **Rewards**: Peak Conqueror trait, Shadow Peak Lore NFT

### Ethereal Gardens
- Mystical realm where reality bends
- **Requirements**: Trickster + Scholar traits
- **Features**: Dream-based gameplay mechanics

##  Character Traits

### Common Traits
- **Explorer**: Unlocks exploration-based content
- **Scholar**: Enables knowledge-based quest paths
- **Fighter**: Opens combat-oriented storylines

### Rare & Epic Traits
- **Peaceful Soul**: Harmony-focused character development
- **Crystal Singer**: Magical resonance abilities
- **Peak Conqueror**: Mountain climbing achievements

##  Quest Examples

### "Whispers in the Woods"
- **Zone**: Forest of Echoes
- **Objectives**: Find whisper source, commune with forest spirit
- **Rewards**: +50 XP, Explorer trait
- **Story Choice**: Peaceful vs. Aggressive approach to spirits

### "Songs of the Crystal"
- **Zone**: Crystal Caverns
- **Requirements**: Explorer trait
- **Objectives**: Find resonance frequency, achieve crystal harmony
- **Rewards**: +100 XP, Crystal Singer trait

##  Blockchain Features

### On-Chain Data Storage
- Player profiles and progression
- Quest completion status
- Character trait assignments
- Story choice consequences

### NFT Integration
- Lore collectibles for major achievements
- Unique artwork for each story milestone
- IPFS metadata storage
- Metaplex integration for minting

##  Development Roadmap

### Phase 1: Core MVP ✅
- Basic game mechanics and UI
- Wallet integration and mock Honeycomb service
- Quest system and character progression
- Responsive design implementation

### Phase 2: Honeycomb Integration
- Real Honeycomb Protocol implementation
- On-chain mission and trait management
- Solana Devnet deployment
- Testing and optimization

### Phase 3: Enhanced Features
- NFT minting for lore collectibles
- Advanced quest branching
- Multiplayer elements
- Mobile app development

### Phase 4: Community Features
- Guild systems
- Leaderboards
- Community-generated content
- Mainnet deployment

## Contributing

We welcome contributions to Lorebound! Please see our contributing guidelines for:
- Code style and standards
- Pull request process
- Issue reporting
- Feature suggestions

##  License

This project is licensed under the MIT License - see the LICENSE file for details.

##  Acknowledgments

- **Honeycomb Protocol** for on-chain game infrastructure
- **Solana Foundation** for blockchain platform
- **React Team** for the frontend framework
- **Tailwind CSS** for styling utilities
- **Lucide** for beautiful icons

---

**Ready to begin your legend?** Connect your wallet and step into the mystical world of Lorebound!  