import React from 'react';
import { X, User, Star, Trophy, Zap, Crown } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

export function PlayerProfile() {
  const { state, showProfileModal } = useGame();

  if (!state.showProfileModal || !state.player) return null;

  const getTraitRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 bg-gray-800/50';
      case 'rare': return 'text-blue-400 bg-blue-900/30';
      case 'epic': return 'text-purple-400 bg-purple-900/30';
      case 'legendary': return 'text-yellow-400 bg-yellow-900/30';
      default: return 'text-gray-400 bg-gray-800/50';
    }
  };

  const getXPProgress = () => {
    const currentLevelXP = (state.player!.level - 1) * 100;
    const nextLevelXP = state.player!.level * 100;
    const progress = ((state.player!.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 max-w-2xl w-full border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-400" />
            Player Profile
          </h2>
          <button
            onClick={() => showProfileModal(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Player Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-lg p-4 border border-indigo-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-300">Level</span>
              </div>
              <div className="text-2xl font-bold text-white">{state.player.level}</div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-900/50 to-green-900/50 rounded-lg p-4 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-gray-300">Experience</span>
              </div>
              <div className="text-2xl font-bold text-white">{state.player.xp}</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 rounded-lg p-4 border border-orange-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-gray-300">Quests</span>
              </div>
              <div className="text-2xl font-bold text-white">{state.player.completedQuests.length}</div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Progress to Level {state.player.level + 1}</span>
              <span className="text-sm text-gray-400">
                {state.player.xp}/{state.player.level * 100} XP
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getXPProgress()}%` }}
              />
            </div>
          </div>

          {/* Traits */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Character Traits ({state.player.traits.length})
            </h3>
            {state.player.traits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {state.player.traits.map((trait) => (
                  <div
                    key={trait.id}
                    className={`p-4 rounded-lg border ${getTraitRarityColor(trait.rarity)}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{trait.icon}</span>
                      <div>
                        <h4 className="font-semibold text-white">{trait.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getTraitRarityColor(trait.rarity)}`}>
                          {trait.rarity}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{trait.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Acquired: {new Date(trait.acquiredAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No traits acquired yet</p>
                <p className="text-sm">Complete quests to earn character traits!</p>
              </div>
            )}
          </div>

          {/* Completed Quests */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-400" />
              Completed Quests ({state.player.completedQuests.length})
            </h3>
            {state.player.completedQuests.length > 0 ? (
              <div className="space-y-2">
                {state.player.completedQuests.map((questId) => (
                  <div
                    key={questId}
                    className="flex items-center gap-3 p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/30"
                  >
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-emerald-300 font-medium">{questId.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No quests completed yet</p>
                <p className="text-sm">Start your adventure to earn achievements!</p>
              </div>
            )}
          </div>

          {/* Unlocked Zones */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Unlocked Zones ({state.player.unlockedZones.length})</h3>
            <div className="flex flex-wrap gap-2">
              {state.player.unlockedZones.map((zoneId) => {
                const zone = state.zones.find(z => z.id === zoneId);
                return zone ? (
                  <span
                    key={zoneId}
                    className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm border border-indigo-500/30"
                  >
                    {zone.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={() => showProfileModal(false)}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}