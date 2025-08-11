import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GameState, Player, Quest, Zone, StoryChoice } from '../types/game';
import { honeycombService } from '../services/HoneycombService';
import { gameData } from '../data/gameData';
import { useWallet } from '@solana/wallet-adapter-react';

interface GameContextType {
  state: GameState;
  startQuest: (questId: string) => Promise<void>;
  completeQuest: (questId: string, choices?: StoryChoice[]) => Promise<void>;
  selectZone: (zoneId: string) => void;
  showQuestModal: (show: boolean) => void;
  showProfileModal: (show: boolean) => void;
  showStoryModal: (show: boolean, choice?: StoryChoice) => void;
  makeStoryChoice: (choice: StoryChoice) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PLAYER'; payload: Player }
  | { type: 'SET_CURRENT_QUEST'; payload: Quest | null }
  | { type: 'SET_AVAILABLE_QUESTS'; payload: Quest[] }
  | { type: 'UPDATE_ZONES'; payload: Zone[] }
  | { type: 'SHOW_QUEST_MODAL'; payload: boolean }
  | { type: 'SHOW_PROFILE_MODAL'; payload: boolean }
  | { type: 'SHOW_STORY_MODAL'; payload: { show: boolean; choice?: StoryChoice } }
  | { type: 'COMPLETE_QUEST'; payload: { questId: string; rewards: any[] } };

const initialState: GameState = {
  player: null,
  currentQuest: null,
  availableQuests: [],
  zones: gameData.zones,
  isLoading: false,
  showQuestModal: false,
  showProfileModal: false,
  showStoryModal: false,
  currentStoryChoice: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_PLAYER':
      return { ...state, player: action.payload };
    case 'SET_CURRENT_QUEST':
      return { ...state, currentQuest: action.payload };
    case 'SET_AVAILABLE_QUESTS':
      return { ...state, availableQuests: action.payload };
    case 'UPDATE_ZONES':
      return { ...state, zones: action.payload };
    case 'SHOW_QUEST_MODAL':
      return { ...state, showQuestModal: action.payload };
    case 'SHOW_PROFILE_MODAL':
      return { ...state, showProfileModal: action.payload };
    case 'SHOW_STORY_MODAL':
      return {
        ...state,
        showStoryModal: action.payload.show,
        currentStoryChoice: action.payload.choice || null
      };
    case 'COMPLETE_QUEST':
      if (!state.player) return state;

      const updatedPlayer = {
        ...state.player,
        completedQuests: [...state.player.completedQuests, action.payload.questId],
        xp: state.player.xp + (action.payload.rewards.find(r => r.type === 'xp')?.value || 0),
      };

      return {
        ...state,
        player: updatedPlayer,
        currentQuest: null,
        availableQuests: state.availableQuests.filter(q => q.id !== action.payload.questId),
      };
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { wallet, connected } = useWallet();

  useEffect(() => {
    if (connected && wallet) {
      initializePlayer();
    }
  }, [connected, wallet]);

  const initializePlayer = async () => {
    if (!wallet?.publicKey) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Initialize Honeycomb service first
      await honeycombService.initialize(wallet);
      
      // Initialize player with Honeycomb Protocol
      const playerData = await honeycombService.getOrCreatePlayer(wallet.publicKey.toString());
      dispatch({ type: 'SET_PLAYER', payload: playerData });

      // Load available quests
      const quests = await honeycombService.getAvailableQuests(playerData);
      dispatch({ type: 'SET_AVAILABLE_QUESTS', payload: quests });

      // Update zones based on player progress
      const updatedZones = gameData.zones.map(zone => ({
        ...zone,
        isUnlocked: playerData.unlockedZones.includes(zone.id)
      }));
      dispatch({ type: 'UPDATE_ZONES', payload: updatedZones });

    } catch (error) {
      console.error('Failed to initialize player:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const startQuest = async (questId: string) => {
    if (!state.player) {
      console.error('No player found when trying to start quest');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const quest = await honeycombService.startQuest(questId, state.player.wallet);
      dispatch({ type: 'SET_CURRENT_QUEST', payload: quest });
      dispatch({ type: 'SHOW_QUEST_MODAL', payload: true });
    } catch (error) {
      console.error('Failed to start quest:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const completeQuest = async (questId: string, choices?: StoryChoice[]) => {
    if (!state.player) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const rewards = await honeycombService.completeQuest(questId, state.player.wallet, choices);
      dispatch({ type: 'COMPLETE_QUEST', payload: { questId, rewards } });

      // Refresh player data
      const updatedPlayer = await honeycombService.getOrCreatePlayer(state.player.wallet);
      dispatch({ type: 'SET_PLAYER', payload: updatedPlayer });

    } catch (error) {
      console.error('Failed to complete quest:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const selectZone = (zoneId: string) => {
    if (!state.player) return;

    const zone = state.zones.find(z => z.id === zoneId);
    if (zone && zone.isUnlocked) {
      const updatedPlayer = { ...state.player, currentZone: zoneId };
      dispatch({ type: 'SET_PLAYER', payload: updatedPlayer });
    }
  };

  const showQuestModal = (show: boolean) => {
    dispatch({ type: 'SHOW_QUEST_MODAL', payload: show });
  };

  const showProfileModal = (show: boolean) => {
    dispatch({ type: 'SHOW_PROFILE_MODAL', payload: show });
  };

  const showStoryModal = (show: boolean, choice?: StoryChoice) => {
    dispatch({ type: 'SHOW_STORY_MODAL', payload: { show, choice } });
  };

  const makeStoryChoice = async (choice: StoryChoice) => {
    if (!state.player || !state.currentQuest) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await honeycombService.recordStoryChoice(state.currentQuest.id, choice, state.player.wallet);
      dispatch({ type: 'SHOW_STORY_MODAL', payload: { show: false } });
    } catch (error) {
      console.error('Failed to record story choice:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <GameContext.Provider value={{
      state,
      startQuest,
      completeQuest,
      selectZone,
      showQuestModal,
      showProfileModal,
      showStoryModal,
      makeStoryChoice,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}