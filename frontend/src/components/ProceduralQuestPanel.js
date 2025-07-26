import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Zap, Star, RefreshCw } from 'lucide-react';

const ProceduralQuestPanel = ({ wallet, backendUrl, onNotification, onMissionComplete }) => {
  const [proceduralMission, setProceduralMission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      fetchProceduralMission();
    }
  }, [wallet.connected, wallet.publicKey]);

  useEffect(() => {
    if (proceduralMission?.expires_at) {
      const interval = setInterval(updateTimeRemaining, 1000);
      return () => clearInterval(interval);
    }
  }, [proceduralMission]);

  const fetchProceduralMission = async () => {
    if (!wallet.publicKey) return;
    
    setLoading(true);
    try {
      const walletAddress = wallet.publicKey.toString();
      const response = await fetch(`${backendUrl}/api/missions/procedural/${walletAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        setProceduralMission(data.procedural_mission);
        if (data.message) {
          onNotification(data.message);
        }
      }
    } catch (error) {
      console.error('Error fetching procedural mission:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTimeRemaining = () => {
    if (!proceduralMission?.expires_at) return;
    
    const now = new Date();
    const expiry = new Date(proceduralMission.expires_at);
    const diff = expiry - now;
    
    if (diff <= 0) {
      setTimeRemaining('Expired');
      setProceduralMission(null);
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
  };

  const completeProceduralMission = async () => {
    if (!wallet.publicKey || !proceduralMission) return;
    
    setLoading(true);
    try {
      const walletAddress = wallet.publicKey.toString();
      const response = await fetch(`${backendUrl}/api/missions/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          mission_id: proceduralMission.mission_id,
          transaction_signature: `procedural_${Date.now()}`
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        onNotification(`Procedural quest completed! +${result.xp_gained} XP gained!`);
        setProceduralMission(null);
        if (onMissionComplete) {
          onMissionComplete();
        }
      } else {
        const error = await response.json();
        onNotification(error.detail || 'Failed to complete procedural quest');
      }
    } catch (error) {
      console.error('Error completing procedural mission:', error);
      onNotification('Error completing procedural quest');
    } finally {
      setLoading(false);
    }
  };

  const getTraitIcon = (trait) => {
    const icons = {
      explorer: '🧭',
      scholar: '📚',
      fighter: '⚔️',
      trickster: '🎭'
    };
    return icons[trait] || '⭐';
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-purple-400" />
          Procedural Quest
        </h2>
        {!proceduralMission && (
          <button
            onClick={fetchProceduralMission}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Generate Quest</span>
          </button>
        )}
      </div>

      {loading && !proceduralMission ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      ) : proceduralMission ? (
        <div className="space-y-4">
          {/* Quest Header */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-semibold text-purple-400">{proceduralMission.name}</h3>
              <div className="flex items-center text-sm text-purple-300">
                <Clock className="w-4 h-4 mr-1" />
                {timeRemaining}
              </div>
            </div>
            <p className="text-gray-300">{proceduralMission.description}</p>
          </div>

          {/* Quest Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-600/20 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-1 text-blue-400" />
                Rewards
              </h4>
              <div className="space-y-1">
                <p className="text-sm text-gray-300">
                  XP: <span className="text-blue-400 font-semibold">{proceduralMission.xp_reward}</span>
                </p>
                {Object.entries(proceduralMission.trait_rewards || {}).map(([trait, value]) => (
                  <p key={trait} className="text-sm text-gray-300">
                    {getTraitIcon(trait)} <span className="capitalize">{trait}</span>: 
                    <span className="text-purple-400 font-semibold ml-1">+{value}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-purple-600/20 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2 flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                Requirements
              </h4>
              <div className="space-y-1">
                {proceduralMission.requirements?.total_traits && (
                  <p className="text-sm text-gray-300">
                    Total Traits: <span className="text-yellow-400">{proceduralMission.requirements.total_traits}</span>
                  </p>
                )}
                <p className="text-sm text-purple-400">
                  Zone: <span className="capitalize">{proceduralMission.zone.replace('_', ' ')}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quest Actions */}
          <div className="flex space-x-3">
            <button
              onClick={completeProceduralMission}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>{loading ? 'Completing...' : 'Complete Quest'}</span>
            </button>
            
            <button
              onClick={() => setProceduralMission(null)}
              className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>

          {/* Quest Lore */}
          <div className="bg-black/40 rounded-lg p-4 border border-purple-500/10">
            <p className="text-sm text-gray-400 italic">
              "The mystical energies have aligned to present you with this unique challenge. 
              Such opportunities are rare and fleeting in the ever-changing realm of Lorebound..."
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 mx-auto text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No Procedural Quest Available</h3>
          <p className="text-gray-500 mb-4">
            Complete more missions to unlock procedural quests tailored to your traits
          </p>
          <p className="text-sm text-purple-400">
            Requirement: At least 2 total trait points
          </p>
        </div>
      )}
    </div>
  );
};

export default ProceduralQuestPanel;