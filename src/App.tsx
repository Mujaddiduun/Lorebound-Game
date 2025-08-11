import React from 'react';
import { WalletProvider } from './contexts/WalletContext';
import { GameProvider } from './contexts/GameContext';
import { WalletButton } from './components/WalletButton';
import { GameInterface } from './components/GameInterface';
import { useWallet } from './contexts/WalletContext';
import { Compass, Sparkles, Map, Trophy } from 'lucide-react';

function AppContent() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          {/* Logo and Title */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Compass className="w-16 h-16 text-indigo-400 animate-spin-slow" />
                <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Lorebound
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              A Story-Driven Exploration Game Powered by Honeycomb Protocol
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-indigo-500/30 transition-all duration-300">
              <Map className="w-8 h-8 text-indigo-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-white mb-2">Explore Mystical Realms</h3>
              <p className="text-gray-400 text-sm">
                Journey through enchanted forests, crystal caverns, and shadow peaks in a world rich with lore and mystery.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
              <Trophy className="w-8 h-8 text-purple-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-white mb-2">On-Chain Progression</h3>
              <p className="text-gray-400 text-sm">
                Your choices shape your character permanently through blockchain-stored traits and achievements.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all duration-300">
              <Sparkles className="w-8 h-8 text-emerald-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-white mb-2">Branching Narratives</h3>
              <p className="text-gray-400 text-sm">
                Every decision creates unique story paths, making each playthrough a distinct adventure.
              </p>
            </div>
          </div>

          {/* Game Description */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-8 border border-white/10 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Begin Your Legend</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              In the mystical world of Lorebound, ancient secrets await discovery. As you explore interconnected realms, 
              your choices will permanently shape your character through the power of Honeycomb Protocol. Complete quests, 
              earn traits, and unlock new zones as you forge your unique path through this story-driven adventure.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                On-chain Mission Tracking
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Character Trait Evolution
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                Replayable Story Paths
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                Collectible Lore NFTs
              </span>
            </div>
          </div>

          {/* Connect Wallet Button */}
          <div className="space-y-4">
            <WalletButton />
            <p className="text-gray-400 text-sm">
              Connect your Solana wallet to begin your adventure on Devnet
            </p>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-gray-500 text-sm">
              Powered by Honeycomb Protocol • Built for Solana Devnet • Open Source on GitHub
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <GameInterface />;
}

function App() {
  return (
    <WalletProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </WalletProvider>
  );
}

export default App;