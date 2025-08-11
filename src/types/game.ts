export interface Player {
  id: string;
  wallet: string;
  level: number;
  xp: number;
  traits: PlayerTrait[];
  completedQuests: string[];
  currentZone: string;
  unlockedZones: string[];
}

export interface PlayerTrait {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  acquiredAt: Date;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  zone: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  requiredTraits?: string[];
  requiredLevel?: number;
  isCompleted: boolean;
  isActive: boolean;
  storyChoices?: StoryChoice[];
}

export interface QuestObjective {
  id: string;
  description: string;
  isCompleted: boolean;
  progress: number;
  maxProgress: number;
}

export interface QuestReward {
  type: 'xp' | 'trait' | 'zone_unlock' | 'nft';
  value: string | number;
  description: string;
}

export interface StoryChoice {
  id: string;
  text: string;
  consequences: {
    traits?: string[];
    xp?: number;
    unlockQuests?: string[];
  };
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  isUnlocked: boolean;
  requiredTraits?: string[];
  requiredLevel?: number;
  quests: string[];
  lore: string;
  coordinates: { x: number; y: number };
  color: string;
}

export interface GameState {
  player: Player | null;
  currentQuest: Quest | null;
  availableQuests: Quest[];
  zones: Zone[];
  isLoading: boolean;
  showQuestModal: boolean;
  showProfileModal: boolean;
  showStoryModal: boolean;
  currentStoryChoice: StoryChoice | null;
}
export interface Player {
  wallet: string;
  xp: number;
  level: number;
  currentZone: string;
  traits: PlayerTrait[];
  completedQuests: string[];
  unlockedZones: string[];
  storyChoices: StoryChoice[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  rewards: QuestReward[];
  zoneId?: string;
  requiredLevel?: number;
  requiredTraits?: string[];
  storyChoices?: StoryChoice[];
}

export interface QuestReward {
  type: 'xp' | 'trait' | 'zone_unlock' | 'nft';
  value: string | number;
  description?: string;
}

export interface PlayerTrait {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  assignedAt: number;
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  isUnlocked: boolean;
  x: number;
  y: number;
  color: string;
}

export interface StoryChoice {
  id: string;
  text: string;
  description: string;
  consequences: {
    xp?: number;
    traits?: string[];
    unlockZones?: string[];
  };
}

export interface GameState {
  player: Player | null;
  currentQuest: Quest | null;
  availableQuests: Quest[];
  zones: Zone[];
  isLoading: boolean;
  showQuestModal: boolean;
  showProfileModal: boolean;
  showStoryModal: boolean;
  currentStoryChoice: StoryChoice | null;
}
