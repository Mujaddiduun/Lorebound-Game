import React, { useState, useEffect } from 'react';
import { Users, Sword, Clock, Trophy, Plus, UserPlus } from 'lucide-react';

const SquadQuestPanel = ({ wallet, backendUrl, onNotification }) => {
  const [squadQuests, setSquadQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [requiredPlayers, setRequiredPlayers] = useState(3);

  useEffect(() => {
    if (wallet.connected) {
      fetchSquadQuests();
      // Refresh every 30 seconds
      const interval = setInterval(fetchSquadQuests, 30000);
      return () => clearInterval(interval);
    }
  }, [wallet.connected]);

  const fetchSquadQuests = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/squad-quests/available`);
      if (response.ok) {
        const data = await response.json();
        setSquadQuests(data.squad_quests || []);
      }
    } catch (error) {
      console.error('Error fetching squad quests:', error);
    }
  };

  const createSquadQuest = async () => {
    if (!wallet.publicKey) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/squad-quests/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creator_wallet: wallet.publicKey.toString(),
          required_players: requiredPlayers
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        onNotification('Squad quest created! Waiting for team members...');
        setShowCreateForm(false);
        fetchSquadQuests();
      }
    } catch (error) {
      console.error('Error creating squad quest:', error);
      onNotification('Error creating squad quest');
    } finally {
      setLoading(false);
    }
  };

  const joinSquadQuest = async (squadId) => {
    if (!wallet.publicKey) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/squad-quests/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          squad_id: squadId,
          wallet_address: wallet.publicKey.toString()
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        onNotification(`Joined squad! ${data.players_joined} players ready.`);
        fetchSquadQuests();
      } else {
        const error = await response.json();
        onNotification(error.detail || 'Error joining squad quest');
      }
    } catch (error) {
      console.error('Error joining squad quest:', error);
      onNotification('Error joining squad quest');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Users className="w-6 h-6 mr-2 text-blue-400" />
          Squad Quests
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Squad</span>
        </button>
      </div>

      {/* Create Squad Form */}
      {showCreateForm && (
        <div className="bg-purple-600/20 rounded-lg p-4 mb-4 border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-3">Create New Squad Quest</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Required Players</label>
              <select
                value={requiredPlayers}
                onChange={(e) => setRequiredPlayers(parseInt(e.target.value))}
                className="w-full bg-black/40 border border-purple-500/20 rounded-lg px-3 py-2 text-white"
              >
                <option value={2}>2 Players</option>
                <option value={3}>3 Players</option>
                <option value={4}>4 Players</option>
                <option value={5}>5 Players</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={createSquadQuest}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Create Squad'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Squad Quests List */}
      <div className="space-y-3">
        {squadQuests.length > 0 ? (
          squadQuests.map((quest) => (
            <div
              key={quest.squad_id}
              className="bg-blue-600/20 rounded-lg p-4 border border-blue-500/20"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{quest.name || 'Raid the Ancient Temple'}</h3>
                  <p className="text-sm text-gray-300 mt-1">
                    {quest.description || 'Team up with other explorers to uncover ancient secrets'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-blue-400 mb-1">
                    <Clock className="w-4 h-4 mr-1" />
                    {getTimeRemaining(quest.expires_at)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {quest.status === 'recruiting' ? 'Recruiting' : 'Active'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-300">
                    <Users className="w-4 h-4 mr-1 text-blue-400" />
                    {quest.current_players.length}/{quest.required_players} players
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Trophy className="w-4 h-4 mr-1 text-yellow-400" />
                    {quest.xp_pool} XP (shared)
                  </div>
                </div>

                {quest.status === 'recruiting' && 
                 !quest.current_players.includes(wallet.publicKey?.toString()) && (
                  <button
                    onClick={() => joinSquadQuest(quest.squad_id)}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Join Squad</span>
                  </button>
                )}

                {quest.current_players.includes(wallet.publicKey?.toString()) && (
                  <div className="bg-green-600/20 text-green-400 px-3 py-1 rounded-lg text-sm">
                    Joined
                  </div>
                )}

                {quest.status === 'active' && (
                  <div className="bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-lg text-sm">
                    In Progress
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(quest.current_players.length / quest.required_players) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">No active squad quests</p>
            <p className="text-sm text-gray-500 mt-2">
              Create a squad quest to team up with other players
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SquadQuestPanel;