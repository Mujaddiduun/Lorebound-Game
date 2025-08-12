import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Wallet, LogOut } from 'lucide-react';

export function WalletButton() {
  const { wallet, connected, connecting, publicKey, connect, disconnect, select } = useWallet();
  const { wallets } = useWallet();
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setConnectionError(null);
      if (!wallet) {
        setShowWalletOptions(true);
        return;
      }
      await connect();
      console.log(' Wallet connected successfully');
    } catch (error) {
      console.error(' Wallet connection failed:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect wallet');
    }
  };

  const handleWalletSelect = async (selectedWallet: any) => {
    try {
      setConnectionError(null);
      select(selectedWallet.adapter.name);
      setShowWalletOptions(false);
      await connect();
      console.log(' Wallet connected:', selectedWallet.adapter.name);
    } catch (error) {
      console.error(' Failed to connect to', selectedWallet.adapter.name, error);
      setConnectionError(`Failed to connect to ${selectedWallet.adapter.name}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setConnectionError(null);
      console.log('🔌 Wallet disconnected');
    } catch (error) {
      console.error(' Disconnect failed:', error);
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (connected && publicKey) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-3 py-2 bg-green-600/20 border border-green-500/30 rounded-lg">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-mono">
            {formatWalletAddress(publicKey.toString())}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {connecting ? (
        <button className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg cursor-not-allowed">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span>Connecting...</span>
        </button>
      ) : (
        <button
          onClick={handleConnect}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
        >
          <Wallet className="w-5 h-5" />
          <span>Connect Wallet</span>
        </button>
      )}

      {/* Wallet Selection Modal */}
      {showWalletOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Choose Wallet</h3>
              <button
                onClick={() => setShowWalletOptions(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              {wallets
                .filter(wallet => wallet.readyState === 'Installed' || wallet.readyState === 'Loadable')
                .map((wallet) => (
                <button
                  key={wallet.adapter.name}
                  onClick={() => handleWalletSelect(wallet)}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <img
                    src={wallet.adapter.icon}
                    alt={wallet.adapter.name}
                    className="w-8 h-8"
                  />
                  <span className="text-white font-medium">{wallet.adapter.name}</span>
                  <div className="ml-auto">
                    {wallet.readyState === 'Installed' && (
                      <span className="text-xs text-green-400">Ready</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-4 text-center">
              Don't have a wallet? Install{' '}
              <a 
                href="https://phantom.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                Phantom
              </a>{' '}
              or{' '}
              <a 
                href="https://solflare.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                Solflare
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {connectionError && (
        <div className="absolute top-full mt-2 left-0 right-0 p-3 bg-red-900/90 border border-red-600 rounded-lg">
          <p className="text-red-200 text-sm">{connectionError}</p>
          <button
            onClick={() => setConnectionError(null)}
            className="text-red-400 hover:text-red-300 text-xs mt-1"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}