
import React, { useState, useEffect } from 'react';
import { Trophy, Star, Sparkles, Gift, Award, Target } from 'lucide-react';
import { honeycombService } from '../services/HoneycombService';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGame } from '../contexts/GameContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'progression' | 'exploration' | 'social' | 'mastery' | 'legendary';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: string;
    value: number | string;
    current?: number;
  }[];
  rewards: {
    xp?: number;
    trait?: string;
    nft?: boolean;
    title?: string;
  };
  unlocked: boolean;
  progress: number; // 0-1
  unlockedAt?: number;
}

/**
 * AchievementSystem Component
 * 
 * Manages and displays player achievements with gamified progression tracking.
 * Features include:
 * - Real-time progress tracking
 * - NFT minting for rare achievements
 * - Social sharing integration
 * - Categorized achievement display
 * - Progress visualization
 */
export function AchievementSystem() {
  const { state } = useGame();
  const { publicKey } = useWallet();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showNFTModal, setShowNFTModal] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Define comprehensive achievement system
  const achievementDefinitions: Achievement[] = [
    // Progression Achievements
    {
      id: 'first_steps',
      name: 'First Steps',
      description: 'Complete your first quest in the mystical world',
      category: 'progression',
      rarity: 'common',
      requirements: [{ type: 'quests_completed', value: 1, current: 0 }],
      rewards: { xp: 50, title: 'Novice Adventurer' },
      unlocked: false,
      progress: 0
    },
    {
      id: 'seasoned_explorer',
      name: 'Seasoned Explorer',
      description: 'Complete 10 quests across different zones',
      category: 'exploration',
      rarity: 'uncommon',
      requirements: [{ type: 'quests_completed', value: 10, current: 0 }],
      rewards: { xp: 200, trait: 'veteran_explorer' },
      unlocked: false,
      progress: 0
    },
    {
      id: 'trait_master',
      name: 'Trait Master',
      description: 'Acquire 5 unique character traits',
      category: 'mastery',
      rarity: 'rare',
      requirements: [{ type: 'unique_traits', value: 5, current: 0 }],
      rewards: { xp: 300, trait: 'trait_master', nft: true },
      unlocked: false,
      progress: 0
    },
    {
      id: 'crystal_harmony',
      name: 'Crystal Harmony Master',
      description: 'Unlock the Crystal Singer trait and complete 5 crystal-related quests',
      category: 'mastery',
      rarity: 'epic',
      requirements: [
        { type: 'has_trait', value: 'crystal_singer', current: 0 },
        { type: 'crystal_quests_completed', value: 5, current: 0 }
      ],
      rewards: { xp: 500, trait: 'crystal_master', nft: true, title: 'Resonance Guardian' },
      unlocked: false,
      progress: 0
    },
    {
      id: 'peak_conqueror_legend',
      name: 'Mountain Legend',
      description: 'Conquer all Shadow Peaks challenges with perfect scores',
      category: 'legendary',
      rarity: 'legendary',
      requirements: [
        { type: 'has_trait', value: 'peak_conqueror', current: 0 },
        { type: 'perfect_peak_quests', value: 3, current: 0 }
      ],
      rewards: { xp: 1000, trait: 'mountain_legend', nft: true, title: 'Apex Conqueror' },
      unlocked: false,
      progress: 0
    },
    // Social Achievements
    {
      id: 'guild_founder',
      name: 'Guild Founder',
      description: 'Create a guild with at least 5 members',
      category: 'social',
      rarity: 'uncommon',
      requirements: [{ type: 'guild_members', value: 5, current: 0 }],
      rewards: { xp: 150, trait: 'leader', title: 'Guild Master' },
      unlocked: false,
      progress: 0
    },
    {
      id: 'community_champion',
      name: 'Community Champion',
      description: 'Help 20 other players complete quests',
      category: 'social',
      rarity: 'rare',
      requirements: [{ type: 'players_helped', value: 20, current: 0 }],
      rewards: { xp: 400, trait: 'mentor', nft: true },
      unlocked: false,
      progress: 0
    },
    // Exploration Achievements
    {
      id: 'zone_master',
      name: 'Realm Master',
      description: 'Unlock and explore all four mystical zones',
      category: 'exploration',
      rarity: 'epic',
      requirements: [{ type: 'zones_unlocked', value: 4, current: 0 }],
      rewards: { xp: 750, trait: 'realm_master', nft: true, title: 'Dimensional Traveler' },
      unlocked: false,
      progress: 0
    }
  ];

  useEffect(() => {
    if (publicKey && state.player) {
      updateAchievementProgress();
    }
  }, [state.player, publicKey]);

  /**
   * Calculate and update achievement progress based on current player state
   * This function runs whenever player data changes to ensure real-time updates
   */
  const updateAchievementProgress = () => {
    const player = state.player;
    if (!player) return;

    const updatedAchievements = achievementDefinitions.map(achievement => {
      let progress = 0;
      let isUnlocked = false;
      let allRequirementsMet = true;

      // Calculate progress for each requirement
      achievement.requirements.forEach(requirement => {
        let currentValue = 0;
        
        switch (requirement.type) {
          case 'quests_completed':
            currentValue = player.completedQuests.length;
            break;
          case 'unique_traits':
            currentValue = player.traits.length;
            break;
          case 'zones_unlocked':
            currentValue = player.unlockedZones.length;
            break;
          case 'has_trait':
            currentValue = player.traits.some(t => t.id === requirement.value) ? 1 : 0;
            break;
          case 'crystal_quests_completed':
            currentValue = player.completedQuests.filter(q => 
              q.includes('crystal') || q.includes('resonance')
            ).length;
            break;
          case 'perfect_peak_quests':
            // Mock perfect completion tracking
            currentValue = player.completedQuests.filter(q => 
              q.includes('peak') || q.includes('shadow')
            ).length;
            break;
        }

        requirement.current = currentValue;
        
        const requirementProgress = Math.min(1, currentValue / (requirement.value as number));
        progress = Math.min(progress + requirementProgress / achievement.requirements.length, 1);
        
        if (currentValue < (requirement.value as number)) {
          allRequirementsMet = false;
        }
      });

      isUnlocked = allRequirementsMet && progress >= 1;

      return {
        ...achievement,
        progress,
        unlocked: isUnlocked
      };
    });

    setAchievements(updatedAchievements);

    // Check for newly unlocked achievements
    const newlyUnlocked = updatedAchievements.filter(a => 
      a.unlocked && !achievements.find(existing => existing.id === a.id && existing.unlocked)
    );

    newlyUnlocked.forEach(achievement => {
      handleAchievementUnlock(achievement);
    });
  };

  /**
   * Handle achievement unlock with rewards and notifications
   */
  const handleAchievementUnlock = async (achievement: Achievement) => {
    if (!publicKey) return;

    setIsLoading(true);
    
    try {
      // Award achievement through Honeycomb
      await honeycombService.checkAndAwardAchievements(
        publicKey.toString(), 
        'achievement_unlock'
      );

      // Mint NFT for special achievements
      if (achievement.rewards.nft) {
        await mintAchievementNFT(achievement);
      }

      // Add XP rewards
      if (achievement.rewards.xp) {
        await honeycombService.addExperience(publicKey.toString(), achievement.rewards.xp);
      }

      // Show achievement notification
      showAchievementNotification(achievement);
      
    } catch (error) {
      console.error('Error handling achievement unlock:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mint commemorative NFT for rare achievements
   */
  const mintAchievementNFT = async (achievement: Achievement) => {
    if (!publicKey) return;

    try {
      const metadata = {
        questTitle: achievement.name,
        zoneName: 'Achievement Realm',
        playerLevel: state.player?.level || 1,
        rarity: achievement.rarity,
        description: achievement.description,
        category: achievement.category
      };

      const result = await honeycombService.mintLoreNFT(
        publicKey.toString(),
        achievement.id,
        metadata
      );

      console.log('🎨 Achievement NFT minted:', result);
      setShowNFTModal(achievement);
      
    } catch (error) {
      console.error('Error minting achievement NFT:', error);
    }
  };

  /**
   * Display achievement unlock notification
   */
  const showAchievementNotification = (achievement: Achievement) => {
    // Create floating notification
    const notification = document.createElement('div');
    notification.className = `
      fixed top-20 right-4 z-50 p-4 bg-gradient-to-r from-yellow-500 to-orange-500 
      text-white rounded-lg shadow-2xl transform translate-x-full transition-transform duration-500
      max-w-sm
    `;
    
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="text-2xl">🏆</div>
        <div>
          <h4 class="font-bold">${achievement.name}</h4>
          <p class="text-sm opacity-90">${achievement.description}</p>
          <div class="text-xs mt-1">
            +${achievement.rewards.xp || 0} XP
            ${achievement.rewards.nft ? ' • NFT Reward!' : ''}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 500);
    }, 5000);

    // Confetti effect for rare achievements
    if (achievement.rarity === 'epic' || achievement.rarity === 'legendary') {
      createConfettiEffect();
    }
  };

  /**
   * Create confetti animation for special achievements
   */
  const createConfettiEffect = () => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'fixed pointer-events-none z-50';
      confetti.style.cssText = `
        width: 10px; height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        top: -10px;
        opacity: 1;
        transform: rotate(${Math.random() * 360}deg);
        transition: all 3s ease-out;
      `;
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.style.top = '110vh';
        confetti.style.opacity = '0';
        confetti.style.transform += ` rotate(${360 + Math.random() * 360}deg)`;
      }, 100);
      
      setTimeout(() => confetti.remove(), 3000);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-400 border-gray-400',
      uncommon: 'text-green-400 border-green-400',
      rare: 'text-blue-400 border-blue-400',
      epic: 'text-purple-400 border-purple-400',
      legendary: 'text-yellow-400 border-yellow-400'
    };
    return colors[rarity] || colors.common;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      progression: <Target className="w-4 h-4" />,
      exploration: <Star className="w-4 h-4" />,
      social: <Gift className="w-4 h-4" />,
      mastery: <Award className="w-4 h-4" />,
      legendary: <Sparkles className="w-4 h-4" />
    };
    return icons[category] || icons.progression;
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const stats = {
    unlocked: achievements.filter(a => a.unlocked).length,
    total: achievements.length,
    nftsEarned: achievements.filter(a => a.unlocked && a.rewards.nft).length
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
          Achievements
        </h2>
        <div className="text-sm text-gray-300">
          {stats.unlocked}/{stats.total} • {stats.nftsEarned} NFTs
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['all', 'progression', 'exploration', 'social', 'mastery', 'legendary'].map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              selectedCategory === category
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Achievement List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAchievements.map(achievement => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border-l-4 transition-all duration-300 ${
              achievement.unlocked
                ? `bg-gradient-to-r from-green-900/30 to-transparent ${getRarityColor(achievement.rarity)}`
                : 'bg-white/5 border-l-gray-600'
            } ${achievement.unlocked ? 'shadow-lg' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {getCategoryIcon(achievement.category)}
                  <h3 className={`font-semibold ${
                    achievement.unlocked ? 'text-white' : 'text-gray-400'
                  }`}>
                    {achievement.name}
                    {achievement.unlocked && (
                      <span className="ml-2 text-lg">✅</span>
                    )}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded border ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </span>
                </div>
                
                <p className={`text-sm mb-2 ${
                  achievement.unlocked ? 'text-gray-200' : 'text-gray-500'
                }`}>
                  {achievement.description}
                </p>

                {/* Progress Bar */}
                {!achievement.unlocked && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(achievement.progress * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${achievement.progress * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Requirements */}
                <div className="text-xs text-gray-400">
                  {achievement.requirements.map((req, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{req.type.replace('_', ' ')}</span>
                      <span>{req.current || 0}/{req.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right">
                {achievement.rewards.nft && (
                  <div className="text-xs text-purple-400 mb-1">NFT Reward</div>
                )}
                {achievement.rewards.xp && (
                  <div className="text-xs text-yellow-400">+{achievement.rewards.xp} XP</div>
                )}
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NFT Modal */}
      {showNFTModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500 rounded-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold text-white mb-2">NFT Minted!</h3>
              <p className="text-purple-200 mb-4">
                Congratulations! You've earned a rare <strong>{showNFTModal.name}</strong> NFT
                for your exceptional achievement.
              </p>
              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-300">{showNFTModal.description}</p>
              </div>
              <button
                onClick={() => setShowNFTModal(null)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
            <p>Processing achievement...</p>
          </div>
        </div>
      )}
    </div>
  );
}
