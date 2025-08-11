
import { HiveControl } from '@honeycomb-protocol/hive-control';
import { Connection, PublicKey } from '@solana/web3.js';

class HoneycombService {
  private hiveControl: HiveControl | null = null;
  private connection: Connection;

  constructor() {
    // Use Solana Devnet for testing
    this.connection = new Connection('https://api.devnet.solana.com');
  }

  async initialize(wallet: any) {
    try {
      this.hiveControl = new HiveControl(this.connection, wallet);
      return true;
    } catch (error) {
      console.error('Failed to initialize Honeycomb:', error);
      return false;
    }
  }

  async createPlayer(walletAddress: string) {
    if (!this.hiveControl) throw new Error('Honeycomb not initialized');
    
    try {
      // Create player profile on-chain
      const playerData = {
        wallet: new PublicKey(walletAddress),
        experience: 0,
        level: 1,
        currentZone: 'forest_echoes',
        traits: [],
        completedQuests: []
      };
      
      // Store player data using Honeycomb
      await this.hiveControl.createProfile(playerData);
      return playerData;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  }

  async getPlayer(walletAddress: string) {
    if (!this.hiveControl) throw new Error('Honeycomb not initialized');
    
    try {
      const profile = await this.hiveControl.getProfile(new PublicKey(walletAddress));
      return profile;
    } catch (error) {
      console.error('Error fetching player:', error);
      // Return default player if not found
      return this.createPlayer(walletAddress);
    }
  }

  async startQuest(questId: string, walletAddress: string) {
    if (!this.hiveControl) throw new Error('Honeycomb not initialized');
    
    try {
      const mission = await this.hiveControl.createMission({
        id: questId,
        player: new PublicKey(walletAddress),
        status: 'active',
        objectives: [],
        startTime: Date.now()
      });
      
      return mission;
    } catch (error) {
      console.error('Error starting quest:', error);
      throw error;
    }
  }

  async completeQuest(questId: string, walletAddress: string, choices: any[] = []) {
    if (!this.hiveControl) throw new Error('Honeycomb not initialized');
    
    try {
      // Mark mission as complete
      await this.hiveControl.completeMission(questId, new PublicKey(walletAddress));
      
      // Process rewards (XP, traits, etc.)
      const questData = this.getQuestData(questId);
      if (questData) {
        await this.addExperience(walletAddress, questData.rewards.find(r => r.type === 'xp')?.value || 0);
        
        // Add traits from quest rewards
        const traitRewards = questData.rewards.filter(r => r.type === 'trait');
        for (const trait of traitRewards) {
          await this.assignTrait(walletAddress, trait.value);
        }
        
        // Process story choice consequences
        for (const choice of choices) {
          if (choice.consequences.xp) {
            await this.addExperience(walletAddress, choice.consequences.xp);
          }
          if (choice.consequences.traits) {
            for (const traitId of choice.consequences.traits) {
              await this.assignTrait(walletAddress, traitId);
            }
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error completing quest:', error);
      throw error;
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
    // Import your quest data here or fetch from gameData
    // This is a placeholder - you'll need to import your actual quest definitions
    return null;
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

export const honeycombService = new HoneycombService();
