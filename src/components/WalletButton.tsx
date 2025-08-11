import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Wallet, LogOut } from 'lucide-react';

export function WalletButton() {
  const { connected, publicKey, connect, disconnect } = useWallet();

  const handleClick = () => {
    if (connected) {
      disconnect();
    } else {
      connect();
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        connected
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
      }`}
    >
      {connected ? <LogOut className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
      <span>
        {connected && publicKey
          ? formatAddress(publicKey)
          : 'Connect Wallet'
        }
      </span>
    </button>
  );
}