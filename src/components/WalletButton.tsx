import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

export function WalletButton() {
  const { wallet, connected, connecting, connect, disconnect } = useWallet();

  if (connected && wallet) {
    return (
      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-white">
            {wallet.publicKey.toString().slice(0, 8)}...
          </span>
        </div>
        <button
          onClick={disconnect}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          title="Disconnect Wallet"
        >
          <LogOut className="w-4 h-4 text-gray-300 hover:text-white" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      <Wallet className="w-4 h-4" />
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}