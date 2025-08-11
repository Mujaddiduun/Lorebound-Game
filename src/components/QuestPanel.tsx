import React from 'react';
import { X, Target, Gift, Clock, CheckCircle } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

export function QuestPanel() {
  const { state, showQuestModal, completeQuest, showStoryModal } = useGame();

  if (!state.showQuestModal || !state.currentQuest) return null;

  const handleCompleteQuest = async () => {
    if (!state.currentQuest) return;
    
    // Show story choices if available
    if (state.currentQuest.storyChoices && state.currentQuest.storyChoices.length > 0) {
      showStoryModal(true, state.currentQuest.storyChoices[0]);
    } else {
      await completeQuest(state.currentQuest.id);
      showQuestModal(false);
    }
  };

  const allObjectivesComplete = state.currentQuest.objectives.every(obj => obj.isCompleted);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 max-w-2xl w-full border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-400" />
            {state.currentQuest.title}
          </h2>
          <button
            onClick={() => showQuestModal(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
            <p className="text-gray-300">{state.currentQuest.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Objectives
            </h3>
            <div className="space-y-2">
              {state.currentQuest.objectives.map((objective) => (
                <div
                  key={objective.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    objective.isCompleted ? 'bg-emerald-900/30' : 'bg-slate-800/50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    objective.isCompleted 
                      ? 'bg-emerald-500 border-emerald-500' 
                      : 'border-gray-400'
                  }`}>
                    {objective.isCompleted && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`flex-1 ${
                    objective.isCompleted ? 'text-emerald-300' : 'text-gray-300'
                  }`}>
                    {objective.description}
                  </span>
                  {objective.maxProgress > 1 && (
                    <span className="text-sm text-gray-400">
                      {objective.progress}/{objective.maxProgress}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-400" />
              Rewards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {state.currentQuest.rewards.map((reward, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    {reward.type === 'xp' && '⚡'}
                    {reward.type === 'trait' && '🏆'}
                    {reward.type === 'zone_unlock' && '🗺️'}
                    {reward.type === 'nft' && '💎'}
                  </div>
                  <span className="text-gray-300 text-sm">{reward.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => showQuestModal(false)}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCompleteQuest}
              disabled={!allObjectivesComplete}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
            >
              {allObjectivesComplete ? 'Complete Quest' : 'In Progress...'}
            </button>
          </div>
        </div>
      </div>

      {/* Story Choice Modal */}
      {state.showStoryModal && state.currentStoryChoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-6 max-w-lg w-full border border-purple-500/30 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Choose Your Path</h3>
            <p className="text-purple-200 mb-6">Your choice will shape your character's destiny:</p>
            
            <div className="space-y-3">
              {state.currentQuest?.storyChoices?.map((choice) => (
                <button
                  key={choice.id}
                  onClick={async () => {
                    await completeQuest(state.currentQuest!.id, [choice]);
                    showQuestModal(false);
                    showStoryModal(false);
                  }}
                  className="w-full p-4 text-left bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
                >
                  <div className="text-white font-medium mb-2">{choice.text}</div>
                  <div className="text-sm text-purple-300">
                    {choice.consequences.xp && `+${choice.consequences.xp} XP`}
                    {choice.consequences.traits && ` • Gain: ${choice.consequences.traits.join(', ')}`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}