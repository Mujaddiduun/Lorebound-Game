
import { HiveControl } from '@honeycomb-protocol/hive-control';
import { Connection, PublicKey } from '@solana/web3.js';
import { Player, Quest, PlayerTrait, StoryChoice } from '../types/game';
import { gameData } from '../data/gameData';

class HoneycombService {
  private hiveControl: HiveControl | null = null;
  private connection: Connection;
  private initialized: boolean = false;

  constructor() {
    // Use Solana Devnet for testing
    this.connection = new Connection('https://api.devnet.solana.com');
  }

  async initialize(wallet: any) {
    try {
      this.hiveControl = new HiveControl(this.connection, wallet);
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Honeycomb:', error);
      this.initialized = false;
      return false;
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
      await this.hiveControl.addExperience(new PublicKey(walletAddress), xp);
      return true;
    } catch (error) {
      console.error('Error adding experience:', error);
      throw error;
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

  // Optional: NFT minting for lore collectibles
  async mintLoreNFT(walletAddress: string, questId: string, metadata: any) {
    if (!this.hiveControl) throw new Error('Honeycomb not initialized');
    
    try {
      // Implement NFT minting logic here using Metaplex or custom contract
      console.log('Minting NFT for quest:', questId);
      return true;
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }
}

const honeycombService = new HoneycombService();

export { HoneycombService, honeycombService };
