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