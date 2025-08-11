import React from 'react';
import { Map, User, Scroll, Zap, Crown, Target } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { GameCanvas } from './GameCanvas';
import { QuestPanel } from './QuestPanel';
import { PlayerProfile } from './PlayerProfile';

export function GameInterface() {
  const { state, startQuest, showProfileModal, showQuestModal } = useGame();

  if (!state.player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  const currentZone = state.zones.find(z => z.id === state.player?.currentZone);
  const availableQuestsInZone = state.availableQuests.filter(q => q.zone === state.player?.currentZone);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-white">Lorebound</h1>
            {currentZone && (
              <div className="flex items-center gap-2 text-gray-300">
                <Map className="w-4 h-4" />
                <span>{currentZone.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Player Stats */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium">Lv.{state.player.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-medium">{state.player.xp} XP</span>
              </div>
            </div>
            
            <button
              onClick={() => showProfileModal(true)}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg px-4 py-2 border border-white/20 transition-colors"
            >
              <User className="w-4 h-4 text-indigo-400" />
              <span className="text-white">Profile</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* World Map */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Map className="w-5 h-5 text-indigo-400" />
                World Map
              </h2>
              <GameCanvas />
            </div>

            {/* Current Zone Info */}
            {currentZone && (
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-3">{currentZone.name}</h2>
                <p className="text-gray-300 mb-4">{currentZone.description}</p>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">LORE</h3>
                  <p className="text-gray-300 text-sm italic">{currentZone.lore}</p>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Available Quests */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                Available Quests
              </h2>
              
              {availableQuestsInZone.length > 0 ? (
                <div className="space-y-3">
                  {availableQuestsInZone.map((quest) => (
                    <div
                      key={quest.id}
                      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-indigo-500/50 transition-colors cursor-pointer"
                      onClick={() => startQuest(quest.id)}
                    >
                      <h3 className="font-semibold text-white mb-2">{quest.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">{quest.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-emerald-400">
                            +{quest.rewards.find(r => r.type === 'xp')?.value || 0} XP
                          </span>
                        </div>
                        <button className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-full transition-colors">
                          Start Quest
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Scroll className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No quests available</p>
                  <p className="text-sm">Explore other zones or complete current objectives!</p>
                </div>
              )}
            </div>

            {/* Current Quest Progress */}
            {state.currentQuest && (
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-yellow-400" />
                  Active Quest
                </h2>
                
                <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                  <h3 className="font-semibold text-yellow-300 mb-2">{state.currentQuest.title}</h3>
                  <div className="space-y-2">
                    {state.currentQuest.objectives.map((objective) => (
                      <div key={objective.id} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          objective.isCompleted ? 'bg-emerald-500' : 'bg-gray-500'
                        }`} />
                        <span className={`text-sm ${
                          objective.isCompleted ? 'text-emerald-300' : 'text-gray-300'
                        }`}>
                          {objective.description}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => showQuestModal(true)}
                    className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            )}

            {/* Recent Traits */}
            {state.player.traits.length > 0 && (
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h2 className="text-lg font-bold text-white mb-4">Recent Traits</h2>
                <div className="space-y-2">
                  {state.player.traits.slice(-3).map((trait) => (
                    <div key={trait.id} className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
                      <span className="text-lg">{trait.icon}</span>
                      <div>
                        <div className="text-white text-sm font-medium">{trait.name}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          trait.rarity === 'legendary' ? 'bg-yellow-900/50 text-yellow-400' :
                          trait.rarity === 'epic' ? 'bg-purple-900/50 text-purple-400' :
                          trait.rarity === 'rare' ? 'bg-blue-900/50 text-blue-400' :
                          'bg-gray-800/50 text-gray-400'
                        }`}>
                          {trait.rarity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <QuestPanel />
      <PlayerProfile />
    </div>
  );
}
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { GameCanvas } from './GameCanvas';
import { QuestPanel } from './QuestPanel';
import { PlayerProfile } from './PlayerProfile';
import { WalletButton } from './WalletButton';
import { Map, User, Scroll, Loader } from 'lucide-react';

export function GameInterface() {
  const { state, selectZone, showQuestModal, showProfileModal } = useGame();

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Scroll className="w-8 h-8 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">Lorebound</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => showProfileModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-white">Profile</span>
            </button>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* World Map */}
          <div className="lg:col-span-2">
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Map className="w-5 h-5 mr-2" />
                  World Map
                </h2>
                <div className="text-sm text-gray-300">
                  Current Zone: <span className="text-amber-400">
                    {state.zones.find(z => z.id === state.player?.currentZone)?.name || 'Unknown'}
                  </span>
                </div>
              </div>
              <GameCanvas onZoneClick={selectZone} />
              <p className="text-gray-400 text-sm mt-4 text-center">
                Click on unlocked zones to travel and discover new quests
              </p>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Player Stats */}
            {state.player && (
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Character</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Level</span>
                    <span className="text-amber-400 font-bold">{state.player.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Experience</span>
                    <span className="text-emerald-400 font-bold">{state.player.xp} XP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Traits</span>
                    <span className="text-purple-400 font-bold">{state.player.traits.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Quests</span>
                    <span className="text-blue-400 font-bold">{state.player.completedQuests.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Available Quests */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Available Quests</h3>
              {state.availableQuests.length > 0 ? (
                <div className="space-y-3">
                  {state.availableQuests.slice(0, 3).map((quest) => (
                    <div key={quest.id} className="p-3 bg-white/5 rounded-lg">
                      <h4 className="text-white font-medium mb-1">{quest.title}</h4>
                      <p className="text-gray-400 text-sm mb-2">{quest.description}</p>
                      <button
                        onClick={() => showQuestModal(true)}
                        className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                      >
                        View Details →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No quests available in this zone.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <QuestPanel />
      <PlayerProfile />
    </div>
  );
}
