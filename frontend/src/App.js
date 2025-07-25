import React, { useState, useEffect, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
  useWallet
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletMultiButton,
  WalletDisconnectButton
} from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { Client, fetchExchange } from '@urql/core';
import createEdgeClient from '@honeycomb-protocol/edge-client';
import { 
  Sword, 
  BookOpen, 
  Compass, 
  Star, 
  MapPin, 
  Trophy,
  Zap,
  Shield,
  Crown,
  Scroll
} from 'lucide-react';
import './App.css';

// Honeycomb client setup
const API_URL = 'https://edge.test.honeycombprotocol.com/';
const honeycombClient = createEdgeClient(
  new Client({
    url: API_URL,
    exchanges: [fetchExchange],
  })
);

// Game components
const GameInterface = () => {
  const wallet = useWallet();
  const [playerProfile, setPlayerProfile] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [availableMissions, setAvailableMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Initialize player profile when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      initializePlayer();
    } else {
      setPlayerProfile(null);
      setGameState(null);
    }
  }, [wallet.connected, wallet.publicKey]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const initializePlayer = async () => {
    if (!wallet.publicKey) return;
    
    setLoading(true);
    try {
      const walletAddress = wallet.publicKey.toString();
      
      // Create or get player profile
      const profileResponse = await fetch(`${backendUrl}/api/players/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          username: `Explorer_${walletAddress.slice(0, 8)}`
        }),
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to create player profile');
      }
      
      const profile = await profileResponse.json();
      setPlayerProfile(profile);
      
      // Get game state
      const gameStateResponse = await fetch(`${backendUrl}/api/game-state/${walletAddress}`);
      if (gameStateResponse.ok) {
        const state = await gameStateResponse.json();
        setGameState(state);
        setAvailableMissions(state.available_missions || []);
      }
      
      showNotification('Welcome to Lorebound! Your adventure begins...');
    } catch (error) {
      console.error('Error initializing player:', error);
      showNotification('Error connecting to game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const completeMission = async (missionId) => {
    if (!wallet.publicKey) return;
    
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
          mission_id: missionId,
          transaction_signature: 'simulated_tx_' + Date.now()
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to complete mission');
      }
      
      const result = await response.json();
      
      // Refresh game state
      await initializePlayer();
      setSelectedMission(null);
      
      showNotification(`Mission completed! +${result.xp_gained} XP gained!`);
    } catch (error) {
      console.error('Error completing mission:', error);
      showNotification(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTraitIcon = (trait) => {
    const icons = {
      explorer: <Compass className="w-4 h-4" />,
      scholar: <BookOpen className="w-4 h-4" />,
      fighter: <Sword className="w-4 h-4" />,
      trickster: <Star className="w-4 h-4" />
    };
    return icons[trait] || <Star className="w-4 h-4" />;
  };

  const getXpProgress = () => {
    if (!gameState) return 0;
    const currentLevel = gameState.level;
    const currentXp = gameState.xp;
    const xpForCurrentLevel = currentLevel * 100 + (currentLevel - 1) * 50;
    const xpForNextLevel = (currentLevel + 1) * 100 + currentLevel * 50;
    const progress = ((currentXp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-8 p-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-400">
              LOREBOUND
            </h1>
            <p className="text-xl text-gray-300 max-w-md mx-auto">
              The On-chain Explorer
            </p>
            <p className="text-gray-400 max-w-lg mx-auto">
              Embark on mystical quests, evolve your traits, and build your legend on the Solana blockchain
            </p>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-6 mb-6">
              <div className="flex flex-col items-center">
                <Compass className="w-8 h-8 text-blue-400 mb-2" />
                <span className="text-sm text-gray-300">Explore</span>
              </div>
              <div className="flex flex-col items-center">
                <Scroll className="w-8 h-8 text-purple-400 mb-2" />
                <span className="text-sm text-gray-300">Discover</span>
              </div>
              <div className="flex flex-col items-center">
                <Crown className="w-8 h-8 text-yellow-400 mb-2" />
                <span className="text-sm text-gray-300">Evolve</span>
              </div>
            </div>
            
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 !rounded-xl !px-8 !py-3 !text-lg !font-semibold hover:!from-purple-700 hover:!to-blue-700 transition-all duration-300" />
            <p className="text-sm text-gray-400 mt-2">
              Connect your Solana wallet to begin your adventure
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {notification}
        </div>
      )}

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-400">
            LOREBOUND
          </h1>
          <div className="flex items-center space-x-4">
            {gameState && (
              <div className="flex items-center space-x-4 text-white">
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span>Level {gameState.level}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <span>{gameState.xp} XP</span>
                </div>
              </div>
            )}
            <WalletDisconnectButton className="!bg-red-600/80 !rounded-lg" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Panel */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-purple-400" />
                Player Profile
              </h2>
              
              {playerProfile && gameState ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-300">
                      <strong>{playerProfile.username}</strong>
                    </p>
                    <p className="text-sm text-gray-400 break-all">
                      {wallet.publicKey?.toString().slice(0, 20)}...
                    </p>
                  </div>
                  
                  {/* XP Progress */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Level {gameState.level}</span>
                      <span>{gameState.xp} XP</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getXpProgress()}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Traits */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Traits</h3>
                    {Object.keys(gameState.traits).length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(gameState.traits).map(([trait, value]) => (
                          <div key={trait} className="bg-purple-600/20 rounded-lg p-2 flex items-center">
                            {getTraitIcon(trait)}
                            <span className="ml-2 text-sm capitalize text-gray-300">
                              {trait}: {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No traits earned yet</p>
                    )}
                  </div>
                  
                  {/* Stats */}
                  <div className="pt-4 border-t border-purple-500/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Missions Completed:</span>
                      <span className="text-white">{gameState.completed_missions_count || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-300">Current Zone:</span>
                      <span className="text-purple-400 capitalize">{gameState.current_zone.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">Loading profile...</p>
              )}
            </div>

            {/* Game Scene */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <MapPin className="w-6 h-6 mr-2 text-blue-400" />
                Forest of Echoes
              </h2>
              
              <div className="relative h-64 bg-gradient-to-b from-green-900/50 to-green-800/50 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z"/%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
                
                {/* Interactive Elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white space-y-2">
                    <Compass className="w-12 h-12 mx-auto text-green-400 animate-pulse" />
                    <p className="text-lg font-semibold">Ancient Grove</p>
                    <p className="text-sm text-gray-300">Whispers echo through the trees...</p>
                  </div>
                </div>
                
                {/* Mission markers */}
                {availableMissions.map((mission, index) => (
                  <div
                    key={mission.mission_id}
                    className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                      index === 0 ? 'top-1/4 left-1/4' : 
                      index === 1 ? 'top-1/2 right-1/4' : 
                      'bottom-1/4 left-1/2'
                    }`}
                    onClick={() => setSelectedMission(mission)}
                  >
                    <div className="bg-yellow-500 rounded-full p-2 animate-bounce hover:bg-yellow-400 transition-colors">
                      <Trophy className="w-4 h-4 text-yellow-900" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-gray-300 text-sm">
                  Click on quest markers to start missions
                </p>
              </div>
            </div>

            {/* Quest Panel */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Scroll className="w-6 h-6 mr-2 text-yellow-400" />
                Available Quests
              </h2>
              
              {selectedMission ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-purple-400">{selectedMission.name}</h3>
                    <p className="text-gray-300 mt-2">{selectedMission.description}</p>
                  </div>
                  
                  <div className="bg-purple-600/20 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Rewards:</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-300">
                        <Zap className="w-4 h-4 inline mr-1 text-blue-400" />
                        {selectedMission.xp_reward} XP
                      </p>
                      {Object.entries(selectedMission.trait_rewards || {}).map(([trait, value]) => (
                        <p key={trait} className="text-sm text-gray-300">
                          {getTraitIcon(trait)}
                          <span className="ml-1 capitalize">{trait} +{value}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => completeMission(selectedMission.mission_id)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                  >
                    {loading ? 'Completing...' : 'Complete Mission'}
                  </button>
                  
                  <button
                    onClick={() => setSelectedMission(null)}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    Back to Quests
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableMissions.length > 0 ? (
                    availableMissions.map((mission) => (
                      <div
                        key={mission.mission_id}
                        className="bg-purple-600/20 rounded-lg p-4 cursor-pointer hover:bg-purple-600/30 transition-colors border border-purple-500/20"
                        onClick={() => setSelectedMission(mission)}
                      >
                        <h3 className="font-semibold text-white">{mission.name}</h3>
                        <p className="text-sm text-gray-300 mt-1">{mission.description}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-xs text-blue-400">
                            <Zap className="w-3 h-3 inline mr-1" />
                            {mission.xp_reward} XP
                          </span>
                          {Object.keys(mission.trait_rewards || {}).map(trait => (
                            <span key={trait} className="text-xs text-purple-400 capitalize">
                              {getTraitIcon(trait)}
                              <span className="ml-1">{trait}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                      <p className="text-gray-400">All missions completed!</p>
                      <p className="text-sm text-gray-500 mt-2">
                        New adventures await in higher zones...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App component
function App() {
  // Use Honeycomb's test RPC endpoint
  const network = 'https://rpc.test.honeycombprotocol.com';
  const endpoint = useMemo(() => network, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <GameInterface />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;