import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Map, User, Scroll, Loader } from 'lucide-react';
import { GameCanvas } from './GameCanvas';
import { QuestPanel } from './QuestPanel';
import { PlayerProfile } from './PlayerProfile';
import { WalletButton } from './WalletButton';
import ZoneModal from './ZoneModal';
import { Zone } from '../types/game';

export function GameInterface() {
  const { state, selectZone, showQuestModal, showProfileModal } = useGame();
  const [isProfileModalOpen, showProfileModalState] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

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

  const currentZone = state.zones.find(z => z.id === state.player?.currentZone);

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone);
    selectZone(zone.id); // Assuming selectZone is meant to be called here
  };

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
              onClick={() => showProfileModalState(true)}
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
                    {currentZone?.name || 'Unknown'}
                  </span>
                </div>
              </div>
              <GameCanvas onZoneClick={handleZoneClick} />
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
      {isProfileModalOpen && (
        <PlayerProfile
          isOpen={isProfileModalOpen}
          onClose={() => showProfileModalState(false)}
        />
      )}

      {selectedZone && (
        <ZoneModal
          zone={selectedZone}
          isOpen={!!selectedZone}
          onClose={() => setSelectedZone(null)}
        />
      )}
    </div>
  );
}