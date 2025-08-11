
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { X, MapPin, Users, Clock, Star } from 'lucide-react';
import { Zone } from '../types/game';

interface ZoneModalProps {
  zone: Zone;
  isOpen: boolean;
  onClose: () => void;
}

export default function ZoneModal({ zone, isOpen, onClose }: ZoneModalProps) {
  const { startQuest, state } = useGame();
  
  if (!isOpen) return null;

  const canEnterZone = zone.isUnlocked && 
    (!zone.requiredLevel || state.player.level >= zone.requiredLevel) &&
    (!zone.requiredTraits || zone.requiredTraits.every(trait => 
      state.player.traits.some(playerTrait => playerTrait.id === trait)
    ));

  const availableQuests = zone.quests?.filter(questId => 
    state.quests.find(quest => quest.id === questId && !quest.isCompleted)
  ) || [];

  const handleStartQuest = async (questId: string) => {
    if (canEnterZone) {
      await startQuest(questId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-white/20 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{zone.name}</h2>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Mystical Realm</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-300 leading-relaxed mb-4">{zone.description}</p>
            {zone.lore && (
              <div className="bg-black/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Ancient Lore</h4>
                <p className="text-gray-400 text-sm italic">{zone.lore}</p>
              </div>
            )}
          </div>

          {!canEnterZone && (
            <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 mb-4">
              <h4 className="text-red-300 font-medium mb-2">Requirements Not Met</h4>
              <div className="space-y-1 text-red-400 text-sm">
                {zone.requiredLevel && state.player.level < zone.requiredLevel && (
                  <p>• Requires level {zone.requiredLevel} (Current: {state.player.level})</p>
                )}
                {zone.requiredTraits && (
                  <p>• Requires traits: {zone.requiredTraits.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {canEnterZone && availableQuests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Available Quests:</h3>
              {availableQuests.map(questId => {
                const quest = state.quests.find(q => q.id === questId);
                if (!quest) return null;
                
                return (
                  <div key={quest.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-medium">{quest.title}</h4>
                      <span className="text-xs text-gray-400">
                        {quest.objectives.length} objectives
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{quest.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {quest.rewards.slice(0, 2).map((reward, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-600/20 border border-yellow-500/30 rounded text-yellow-300 text-xs"
                          >
                            <Star className="w-3 h-3" />
                            {reward.type === 'xp' ? `+${reward.value} XP` : reward.description}
                          </span>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => handleStartQuest(quest.id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-medium transition-colors"
                      >
                        Start Quest
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {canEnterZone && availableQuests.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No quests available in this zone</p>
              <p className="text-sm">Check back later for new adventures!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
