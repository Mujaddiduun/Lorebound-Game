import { Player, Quest, StoryChoice, QuestReward } from '../types/game';
import { gameData } from '../data/gameData';

// Mock Honeycomb Protocol integration
// In production, this would use the actual Honeycomb SDK
export class HoneycombService {
  private static readonly STORAGE_KEY = 'lorebound_player_data';

  static async getOrCreatePlayer(walletAddress: string): Promise<Player> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const stored = localStorage.getItem(this.STORAGE_KEY);
    const allPlayers = stored ? JSON.parse(stored) : {};

    if (allPlayers[walletAddress]) {
      return allPlayers[walletAddress];
    }

    // Create new player
    const newPlayer: Player = {
      id: `player_${Date.now()}`,
      wallet: walletAddress,
      level: 1,
      xp: 0,
      traits: [],
      completedQuests: [],
      currentZone: 'forest_echoes',
      unlockedZones: ['forest_echoes'],
    };

    allPlayers[walletAddress] = newPlayer;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allPlayers));

    return newPlayer;
  }

  static async getAvailableQuests(player: Player): Promise<Quest[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return gameData.quests.filter(quest => {
      // Filter out completed quests
      if (player.completedQuests.includes(quest.id)) return false;

      // Check zone unlock
      if (!player.unlockedZones.includes(quest.zone)) return false;

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

      return true;
    });
  }

  static async startQuest(questId: string, walletAddress: string): Promise<Quest> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const quest = gameData.quests.find(q => q.id === questId);
    if (!quest) throw new Error('Quest not found');

    return {
      ...quest,
      isActive: true,
      objectives: quest.objectives.map(obj => ({ ...obj, progress: 0 }))
    };
  }

  static async completeQuest(
    questId: string, 
    walletAddress: string, 
    choices?: StoryChoice[]
  ): Promise<QuestReward[]> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const quest = gameData.quests.find(q => q.id === questId);
    if (!quest) throw new Error('Quest not found');

    // Update player data
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const allPlayers = stored ? JSON.parse(stored) : {};
    const player = allPlayers[walletAddress];

    if (player) {
      // Add XP
      const xpReward = quest.rewards.find(r => r.type === 'xp');
      if (xpReward) {
        player.xp += xpReward.value;
        player.level = Math.floor(player.xp / 100) + 1;
      }

      // Add traits
      const traitRewards = quest.rewards.filter(r => r.type === 'trait');
      traitRewards.forEach(reward => {
        const traitData = gameData.traits.find(t => t.id === reward.value);
        if (traitData && !player.traits.find(t => t.id === traitData.id)) {
          player.traits.push({
            ...traitData,
            acquiredAt: new Date()
          });
        }
      });

      // Unlock zones
      const zoneRewards = quest.rewards.filter(r => r.type === 'zone_unlock');
      zoneRewards.forEach(reward => {
        if (!player.unlockedZones.includes(reward.value)) {
          player.unlockedZones.push(reward.value as string);
        }
      });

      // Add to completed quests
      if (!player.completedQuests.includes(questId)) {
        player.completedQuests.push(questId);
      }

      // Process story choices
      if (choices) {
        choices.forEach(choice => {
          if (choice.consequences.traits) {
            choice.consequences.traits.forEach(traitId => {
              const traitData = gameData.traits.find(t => t.id === traitId);
              if (traitData && !player.traits.find(t => t.id === traitData.id)) {
                player.traits.push({
                  ...traitData,
                  acquiredAt: new Date()
                });
              }
            });
          }
          if (choice.consequences.xp) {
            player.xp += choice.consequences.xp;
            player.level = Math.floor(player.xp / 100) + 1;
          }
        });
      }

      allPlayers[walletAddress] = player;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allPlayers));
    }

    return quest.rewards;
  }

  static async recordStoryChoice(
    questId: string, 
    choice: StoryChoice, 
    walletAddress: string
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In production, this would record the choice on-chain via Honeycomb
    console.log('Story choice recorded:', { questId, choice, walletAddress });
  }

  static async mintLoreNFT(questId: string, walletAddress: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock NFT minting - in production would use Metaplex
    const mockNftId = `nft_${questId}_${Date.now()}`;
    console.log('Lore NFT minted:', mockNftId);
    
    return mockNftId;
  }
}