
import { HiveControl } from '@honeycomb-protocol/hive-control';
import { Connection, PublicKey } from '@solana/web3.js';
import { Player, Quest, PlayerTrait, StoryChoice } from '../types/game';
import { gameData } from '../data/gameData';

/**
 * HoneycombService - Core blockchain integration for Lorebound
 * 
 * This service acts as the primary interface between the game and Honeycomb Protocol,
 * managing all on-chain operations including:
 * - Player profile creation and management
 * - Quest/mission tracking and completion
 * - Character trait assignment and evolution
 * - XP progression and level advancement
 * - Community features and social interactions
 * - Achievement system and NFT rewards
 * 
 * @author Lorebound Team
 * @version 1.0.0
 */
class HoneycombService {
  private hiveControl: HiveControl | null = null;
  private connection: Connection;
  private initialized: boolean = false;

  /**
   * Initialize the Honeycomb service with Solana Devnet connection
   * Using Devnet allows for safe testing without mainnet costs
   */
  constructor() {
    // Use Solana Devnet for testing - free transactions and safe environment
    this.connection = new Connection('https://api.devnet.solana.com');
  }

  async initialize(wallet: any) {
    try {
      // Initialize with comprehensive Honeycomb features
      this.hiveControl = new HiveControl(this.connection, wallet, {
        cluster: 'devnet',
        rpcUrl: 'https://api.devnet.solana.com',
        commitment: 'confirmed'
      });
      
      // Initialize game-specific Honeycomb resources
      await this.initializeGameResources();
      
      this.initialized = true;
      console.log('🍯 Honeycomb Protocol initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Honeycomb:', error);
      this.initialized = false;
      return false;
    }
  }

  private async initializeGameResources() {
    if (!this.hiveControl) return;
    
    try {
      // Create mission templates for each quest type
      const missionTemplates = [
        {
          id: 'exploration_mission',
          name: 'Exploration Quest',
          rewardStructure: { xp: 50, traits: ['explorer'] }
        },
        {
          id: 'knowledge_mission', 
          name: 'Knowledge Quest',
          rewardStructure: { xp: 75, traits: ['scholar'] }
        },
        {
          id: 'combat_mission',
          name: 'Combat Quest', 
          rewardStructure: { xp: 100, traits: ['fighter'] }
        }
      ];

      for (const template of missionTemplates) {
        await this.hiveControl.createMissionTemplate(template);
      }

      // Initialize trait definitions
      await this.initializeTraitSystem();
      
    } catch (error) {
      console.log('Game resources initialization skipped for demo');
    }
  }

  private async initializeTraitSystem() {
    if (!this.hiveControl) return;
    
    const traitDefinitions = [
      { id: 'explorer', name: 'Explorer', rarity: 'common', effects: ['zone_unlock'] },
      { id: 'scholar', name: 'Scholar', rarity: 'uncommon', effects: ['knowledge_bonus'] },
      { id: 'fighter', name: 'Fighter', rarity: 'uncommon', effects: ['combat_bonus'] },
      { id: 'trickster', name: 'Trickster', rarity: 'rare', effects: ['hidden_paths'] },
      { id: 'crystal_singer', name: 'Crystal Singer', rarity: 'epic', effects: ['crystal_harmony'] },
      { id: 'peak_conqueror', name: 'Peak Conqueror', rarity: 'legendary', effects: ['mountain_mastery'] }
    ];

    for (const trait of traitDefinitions) {
      try {
        await this.hiveControl.createTraitDefinition(trait);
      } catch (error) {
        console.log(`Trait ${trait.id} already exists or demo mode`);
      }
    }
  }

  async getOrCreatePlayer(walletAddress: string): Promise<Player> {
    try {
      let player = await this.getPlayer(walletAddress);
      if (!player) {
        player = await this.createPlayer(walletAddress);
      }
      return player;
    } catch (error) {
      console.error('Error getting or creating player:', error);
      return this.createDefaultPlayer(walletAddress);
    }
  }

  private createDefaultPlayer(walletAddress: string): Player {
    return {
      wallet: walletAddress,
      xp: 0,
      level: 1,
      currentZone: 'forest_echoes',
      traits: [],
      completedQuests: [],
      unlockedZones: ['forest_echoes'],
      storyChoices: []
    };
  }

  async createPlayer(walletAddress: string): Promise<Player> {
    if (!this.initialized) {
      console.warn('Honeycomb not initialized, creating mock player');
      return this.createDefaultPlayer(walletAddress);
    }
    
    try {
      const playerData: Player = {
        wallet: walletAddress,
        xp: 0,
        level: 1,
        currentZone: 'forest_echoes',
        traits: [],
        completedQuests: [],
        unlockedZones: ['forest_echoes'],
        storyChoices: []
      };
      
      // Store player data using Honeycomb
      if (this.hiveControl) {
        await this.hiveControl.createProfile({
          wallet: new PublicKey(walletAddress),
          ...playerData
        });
      }
      
      return playerData;
    } catch (error) {
      console.error('Error creating player:', error);
      return this.createDefaultPlayer(walletAddress);
    }
  }

  async getPlayer(walletAddress: string): Promise<Player | null> {
    if (!this.initialized) {
      console.warn('Honeycomb not initialized, returning null');
      return null;
    }
    
    try {
      if (!this.hiveControl) return null;
      
      const profile = await this.hiveControl.getProfile(new PublicKey(walletAddress));
      return profile as Player;
    } catch (error) {
      console.error('Error fetching player:', error);
      return null;
    }
  }

  async getAvailableQuests(player: Player): Promise<Quest[]> {
    const allQuests = gameData.quests;
    
    return allQuests.filter(quest => {
      // Check if quest is already completed
      if (player.completedQuests.includes(quest.id)) return false;
      
      // Check level requirement
      if (quest.requiredLevel && player.level < quest.requiredLevel) return false;
      
      // Check trait requirements
      if (quest.requiredTraits) {
        const playerTraitIds = player.traits.map(t => t.id);
        const hasRequiredTraits = quest.requiredTraits.every(traitId => 
          playerTraitIds.includes(traitId)
        );
        if (!hasRequiredTraits) return false;
      }
      
      // Check zone requirements
      if (quest.zoneId && !player.unlockedZones.includes(quest.zoneId)) return false;
      
      return true;
    });
  }

  async startQuest(questId: string, walletAddress: string): Promise<Quest> {
    try {
      const quest = gameData.quests.find(q => q.id === questId);
      if (!quest) throw new Error('Quest not found');

      if (this.hiveControl) {
        await this.hiveControl.createMission({
          id: questId,
          player: new PublicKey(walletAddress),
          status: 'active',
          objectives: quest.objectives || [],
          startTime: Date.now()
        });
      }
      
      return quest;
    } catch (error) {
      console.error('Error starting quest:', error);
      const quest = gameData.quests.find(q => q.id === questId);
      if (!quest) throw new Error('Quest not found');
      return quest;
    }
  }

  async completeQuest(questId: string, walletAddress: string, choices: StoryChoice[] = []): Promise<any[]> {
    try {
      // Mark mission as complete
      if (this.hiveControl) {
        await this.hiveControl.completeMission(questId, new PublicKey(walletAddress));
      }
      
      // Process rewards (XP, traits, etc.)
      const questData = this.getQuestData(questId);
      const rewards: any[] = [];
      
      if (questData) {
        // Add base quest rewards
        for (const reward of questData.rewards) {
          if (reward.type === 'xp') {
            await this.addExperience(walletAddress, reward.value);
            rewards.push(reward);
          } else if (reward.type === 'trait') {
            await this.assignTrait(walletAddress, reward.value);
            rewards.push(reward);
          }
        }
        
        // Process story choice consequences
        for (const choice of choices) {
          if (choice.consequences.xp) {
            await this.addExperience(walletAddress, choice.consequences.xp);
            rewards.push({ type: 'xp', value: choice.consequences.xp });
          }
          if (choice.consequences.traits) {
            for (const traitId of choice.consequences.traits) {
              await this.assignTrait(walletAddress, traitId);
              rewards.push({ type: 'trait', value: traitId });
            }
          }
        }
      }
      
      return rewards;
    } catch (error) {
      console.error('Error completing quest:', error);
      return [];
    }
  }

  async assignTrait(walletAddress: string, traitId: string) {
    if (!this.hiveControl) throw new Error('Honeycomb not initialized');
    
    try {
      const trait = {
        id: traitId,
        player: new PublicKey(walletAddress),
        assignedAt: Date.now()
      };
      
      await this.hiveControl.assignTrait(trait);
      return trait;
    } catch (error) {
      console.error('Error assigning trait:', error);
      throw error;
    }
  }

  async addExperience(walletAddress: string, xp: number) {
    if (!this.hiveControl) throw new Error('Honeycomb not initialized');
    
    try {
      // Get current player data
      const currentPlayer = await this.getPlayer(walletAddress);
      if (!currentPlayer) throw new Error('Player not found');

      const newXP = currentPlayer.xp + xp;
      const newLevel = this.calculateLevel(newXP);
      const leveledUp = newLevel > currentPlayer.level;

      // Add XP through Honeycomb
      await this.hiveControl.addExperience(new PublicKey(walletAddress), xp);

      // Handle level up rewards and unlocks
      if (leveledUp) {
        await this.handleLevelUp(walletAddress, newLevel, currentPlayer.level);
      }

      return {
        xpGained: xp,
        newXP,
        newLevel,
        leveledUp,
        levelUpRewards: leveledUp ? this.getLevelUpRewards(newLevel) : []
      };
    } catch (error) {
      console.error('Error adding experience:', error);
      throw error;
    }
  }

  private calculateLevel(xp: number): number {
    // Progressive XP curve: Level = floor(sqrt(XP/100))
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  private async handleLevelUp(walletAddress: string, newLevel: number, oldLevel: number) {
    const rewards = this.getLevelUpRewards(newLevel);
    
    for (const reward of rewards) {
      if (reward.type === 'trait') {
        await this.assignTrait(walletAddress, reward.value);
      } else if (reward.type === 'zone_unlock') {
        await this.unlockZone(walletAddress, reward.value);
      }
    }

    // Record level up achievement
    if (this.hiveControl) {
      await this.hiveControl.recordAchievement({
        player: new PublicKey(walletAddress),
        achievementId: `level_${newLevel}`,
        timestamp: Date.now(),
        metadata: { oldLevel, newLevel }
      });
    }
  }

  private getLevelUpRewards(level: number): Array<{type: string, value: string, description: string}> {
    const rewards = [];
    
    switch(level) {
      case 2:
        rewards.push({ type: 'zone_unlock', value: 'crystal_caverns', description: 'Crystal Caverns Unlocked!' });
        break;
      case 3:
        rewards.push({ type: 'trait', value: 'experienced_adventurer', description: 'Experienced Adventurer trait' });
        break;
      case 5:
        rewards.push({ type: 'zone_unlock', value: 'shadow_peaks', description: 'Shadow Peaks Unlocked!' });
        break;
      case 7:
        rewards.push({ type: 'trait', value: 'master_explorer', description: 'Master Explorer trait' });
        break;
      case 10:
        rewards.push({ type: 'zone_unlock', value: 'ethereal_gardens', description: 'Ethereal Gardens Unlocked!' });
        rewards.push({ type: 'trait', value: 'legend', description: 'Legend trait' });
        break;
    }
    
    return rewards;
  }

  private async unlockZone(walletAddress: string, zoneId: string) {
    if (this.hiveControl) {
      await this.hiveControl.unlockContent({
        player: new PublicKey(walletAddress),
        contentType: 'zone',
        contentId: zoneId,
        timestamp: Date.now()
      });
    }
  }

  async getPlayerTraits(walletAddress: string) {
    if (!this.hiveControl) throw new Error('Honeycomb not initialized');
    
    try {
      const traits = await this.hiveControl.getPlayerTraits(new PublicKey(walletAddress));
      return traits;
    } catch (error) {
      console.error('Error fetching traits:', error);
      return [];
    }
  }

  async getMissionStatus(questId: string, walletAddress: string) {
    if (!this.hiveControl) throw new Error('Honeycomb not initialized');
    
    try {
      const mission = await this.hiveControl.getMission(questId, new PublicKey(walletAddress));
      return mission;
    } catch (error) {
      console.error('Error fetching mission status:', error);
      return null;
    }
  }

  // Community and Social Features
  async getGlobalLeaderboard(limit: number = 10) {
    try {
      if (this.hiveControl) {
        const leaderboard = await this.hiveControl.getLeaderboard({
          sortBy: 'xp',
          limit,
          timeframe: 'all_time'
        });
        return leaderboard;
      }
      
      // Mock leaderboard for demo
      return [
        { wallet: 'Player1...abc', xp: 2500, level: 8, traits: ['explorer', 'scholar', 'crystal_singer'] },
        { wallet: 'Player2...def', xp: 2100, level: 7, traits: ['fighter', 'peak_conqueror'] },
        { wallet: 'Player3...ghi', xp: 1800, level: 6, traits: ['trickster', 'scholar'] }
      ];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  async getPlayerRank(walletAddress: string) {
    try {
      if (this.hiveControl) {
        return await this.hiveControl.getPlayerRank(new PublicKey(walletAddress));
      }
      return Math.floor(Math.random() * 100) + 1; // Mock rank
    } catch (error) {
      console.error('Error fetching player rank:', error);
      return null;
    }
  }

  async getZoneCompletionStats(zoneId: string) {
    try {
      if (this.hiveControl) {
        return await this.hiveControl.getZoneStats(zoneId);
      }
      
      // Mock stats
      return {
        totalPlayers: 847,
        completionRate: 0.73,
        averageTime: '2.5 hours',
        popularChoices: {
          'peaceful_approach': 0.68,
          'aggressive_approach': 0.32
        }
      };
    } catch (error) {
      console.error('Error fetching zone stats:', error);
      return null;
    }
  }

  // Guild/Team Features
  async createGuild(guildName: string, creatorWallet: string) {
    try {
      if (this.hiveControl) {
        return await this.hiveControl.createGuild({
          name: guildName,
          creator: new PublicKey(creatorWallet),
          type: 'exploration',
          maxMembers: 20
        });
      }
    } catch (error) {
      console.error('Error creating guild:', error);
      throw error;
    }
  }

  async joinGuild(guildId: string, playerWallet: string) {
    try {
      if (this.hiveControl) {
        return await this.hiveControl.joinGuild({
          guildId,
          player: new PublicKey(playerWallet)
        });
      }
    } catch (error) {
      console.error('Error joining guild:', error);
      throw error;
    }
  }

  // Achievement System
  async checkAndAwardAchievements(walletAddress: string, action: string) {
    const achievements = this.getAvailableAchievements(action);
    const awarded = [];

    for (const achievement of achievements) {
      const meetsRequirements = await this.checkAchievementRequirements(
        walletAddress, 
        achievement
      );
      
      if (meetsRequirements) {
        await this.awardAchievement(walletAddress, achievement);
        awarded.push(achievement);
      }
    }

    return awarded;
  }

  private getAvailableAchievements(action: string) {
    const achievements = {
      quest_complete: [
        {
          id: 'first_quest',
          name: 'First Steps',
          description: 'Complete your first quest',
          requirements: { questsCompleted: 1 },
          rewards: { xp: 25, title: 'Novice Adventurer' }
        },
        {
          id: 'quest_master',
          name: 'Quest Master',
          description: 'Complete 10 quests',
          requirements: { questsCompleted: 10 },
          rewards: { xp: 200, trait: 'quest_master' }
        }
      ],
      trait_acquired: [
        {
          id: 'trait_collector',
          name: 'Trait Collector',
          description: 'Acquire 5 different traits',
          requirements: { uniqueTraits: 5 },
          rewards: { xp: 150, trait: 'versatile' }
        }
      ]
    };

    return achievements[action] || [];
  }

  private async checkAchievementRequirements(walletAddress: string, achievement: any) {
    const player = await this.getPlayer(walletAddress);
    if (!player) return false;

    const { requirements } = achievement;
    
    if (requirements.questsCompleted && player.completedQuests.length < requirements.questsCompleted) {
      return false;
    }
    
    if (requirements.uniqueTraits && player.traits.length < requirements.uniqueTraits) {
      return false;
    }

    return true;
  }

  private async awardAchievement(walletAddress: string, achievement: any) {
    if (this.hiveControl) {
      await this.hiveControl.awardAchievement({
        player: new PublicKey(walletAddress),
        achievementId: achievement.id,
        rewards: achievement.rewards,
        timestamp: Date.now()
      });
    }
  }

  // Helper method to get quest data from local definitions
  private getQuestData(questId: string) {
    return gameData.quests.find(quest => quest.id === questId) || null;
  }

  async recordStoryChoice(questId: string, choice: StoryChoice, walletAddress: string): Promise<void> {
    try {
      if (this.hiveControl) {
        await this.hiveControl.recordChoice({
          questId,
          choiceId: choice.id,
          player: new PublicKey(walletAddress),
          timestamp: Date.now()
        });
      }
      console.log('Story choice recorded:', choice.id);
    } catch (error) {
      console.error('Error recording story choice:', error);
    }
  }

  // NFT minting for lore collectibles using Metaplex
  async mintLoreNFT(walletAddress: string, questId: string, metadata: any) {
    if (!this.hiveControl) throw new Error('Honeycomb not initialized');
    
    try {
      // Create NFT metadata following Metaplex standards
      const nftMetadata = {
        name: `${metadata.questTitle} - Lore Fragment`,
        symbol: 'LORE',
        description: `A permanent record of completing ${metadata.questTitle} in the mystical world of Lorebound.`,
        image: `https://api.lorebound.game/nft/${questId}.png`, // Your hosted NFT images
        attributes: [
          {
            trait_type: 'Quest',
            value: metadata.questTitle
          },
          {
            trait_type: 'Zone',
            value: metadata.zoneName
          },
          {
            trait_type: 'Completion Date',
            value: new Date().toISOString()
          },
          {
            trait_type: 'Player Level',
            value: metadata.playerLevel?.toString() || '1'
          },
          {
            trait_type: 'Rarity',
            value: metadata.rarity || 'Common'
          }
        ],
        properties: {
          category: 'image',
          files: [
            {
              uri: `https://api.lorebound.game/nft/${questId}.png`,
              type: 'image/png'
            }
          ]
        }
      };

      // Upload metadata to IPFS or Arweave
      const metadataUri = await this.uploadMetadata(nftMetadata);
      
      // Use Metaplex SDK to mint NFT
      const mintResult = await this.mintWithMetaplex(
        new PublicKey(walletAddress),
        metadataUri,
        nftMetadata.name,
        nftMetadata.symbol
      );

      // Record NFT mint in Honeycomb for quest completion tracking
      await this.hiveControl.recordNFTMint({
        questId,
        player: new PublicKey(walletAddress),
        mintAddress: mintResult.mintAddress,
        metadataUri,
        timestamp: Date.now()
      });

      console.log(`Minted Lore NFT for quest ${questId}:`, mintResult.mintAddress.toString());
      return {
        mintAddress: mintResult.mintAddress,
        metadataUri,
        transactionSignature: mintResult.signature
      };
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  private async uploadMetadata(metadata: any): Promise<string> {
    // Implementation for IPFS/Arweave upload
    // For demo purposes, return a mock URI
    return `https://gateway.pinata.cloud/ipfs/${Date.now()}.json`;
  }

  private async mintWithMetaplex(
    recipient: PublicKey,
    metadataUri: string,
    name: string,
    symbol: string
  ) {
    // Mock Metaplex minting for demo
    // In production, use actual Metaplex SDK
    return {
      mintAddress: new PublicKey('11111111111111111111111111111111'), // Mock address
      signature: 'mock_signature_' + Date.now()
    };
  }

  // Helper method to get quest data from local definitions
  private getQuestData(questId: string) {
    return gameData.quests.find(quest => quest.id === questId) || null;
  }

  async recordStoryChoice(questId: string, choice: StoryChoice, walletAddress: string): Promise<void> {
    try {
      if (this.hiveControl) {
        await this.hiveControl.recordChoice({
          questId,
          choiceId: choice.id,
          player: new PublicKey(walletAddress),
          timestamp: Date.now()
        });
      }
      console.log('Story choice recorded:', choice.id);
    } catch (error) {
      console.error('Error recording story choice:', error);
    }
  }
}

const honeycombService = new HoneycombService();

export { HoneycombService, honeycombService };
