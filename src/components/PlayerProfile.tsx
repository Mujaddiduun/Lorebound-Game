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
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { X, Star, Award, MapPin, Calendar } from 'lucide-react';

export function PlayerProfile() {
  const { state, showProfileModal } = useGame();

  if (!state.showProfileModal || !state.player) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-400/10';
      case 'rare': return 'border-blue-400 bg-blue-400/10';
      case 'epic': return 'border-purple-400 bg-purple-400/10';
      case 'legendary': return 'border-amber-400 bg-amber-400/10';
      default: return 'border-gray-400 bg-gray-400/10';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-amber-400';
      default: return 'text-gray-400';
    }
  };

  const getXpForNextLevel = (level: number) => {
    return level * 100; // Simple XP calculation
  };

  const getProgressToNextLevel = () => {
    const xpForNext = getXpForNextLevel(state.player!.level + 1);
    const xpForCurrent = getXpForNextLevel(state.player!.level);
    const progress = ((state.player!.xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Character Profile</h2>
          <button
            onClick={() => showProfileModal(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Character Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold text-white mb-4">Character Stats</h3>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Level</div>
                    <div className="text-2xl font-bold text-amber-400">{state.player.level}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Experience Points</div>
                    <div className="text-2xl font-bold text-emerald-400">{state.player.xp}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Completed Quests</div>
                    <div className="text-2xl font-bold text-blue-400">{state.player.completedQuests.length}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Unlocked Zones</div>
                    <div className="text-2xl font-bold text-purple-400">{state.player.unlockedZones.length}</div>
                  </div>
                </div>

                {/* XP Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progress to Level {state.player.level + 1}</span>
                    <span>{Math.round(getProgressToNextLevel())}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressToNextLevel()}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-4">Current Location</h3>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <MapPin className="w-5 h-5 text-amber-400 mr-2" />
                  <span className="text-white font-medium">
                    {state.zones.find(z => z.id === state.player?.currentZone)?.name || 'Unknown'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  {state.zones.find(z => z.id === state.player?.currentZone)?.description || 'No description available'}
                </p>
              </div>
            </div>
          </div>

          {/* Character Traits */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Character Traits ({state.player.traits.length})
            </h3>
            {state.player.traits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.player.traits.map((trait, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${getRarityColor(trait.rarity)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-medium">{trait.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRarityTextColor(trait.rarity)} bg-current/20`}>
                        {trait.rarity}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{trait.description}</p>
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      Earned: {new Date(trait.assignedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No traits earned yet. Complete quests to gain character traits!</p>
              </div>
            )}
          </div>

          {/* Quest History */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Quest History ({state.player.completedQuests.length})
            </h3>
            {state.player.completedQuests.length > 0 ? (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="space-y-3">
                  {state.player.completedQuests.map((questId, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                      <span className="text-white">{questId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span className="text-green-400 text-sm">✓ Completed</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <Star className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No quests completed yet. Start your adventure!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
