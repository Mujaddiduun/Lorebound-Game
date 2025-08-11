import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock wallet context for demo purposes
// In production, this would use @solana/wallet-adapter-react
interface WalletContextType {
  wallet: { publicKey: { toString: () => string } } | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<{ publicKey: { toString: () => string } } | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    // Check for stored wallet connection
    const storedWallet = localStorage.getItem('lorebound_wallet');
    if (storedWallet) {
      setWallet({ publicKey: { toString: () => storedWallet } });
      setConnected(true);
    }
  }, []);

  const connect = async () => {
    setConnecting(true);
    
    // Simulate wallet connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock wallet address
    const mockAddress = `mock_${Math.random().toString(36).substring(2, 15)}`;
    const mockWallet = { publicKey: { toString: () => mockAddress } };
    
    setWallet(mockWallet);
    setConnected(true);
    setConnecting(false);
    
    localStorage.setItem('lorebound_wallet', mockAddress);
  };

  const disconnect = () => {
    setWallet(null);
    setConnected(false);
    localStorage.removeItem('lorebound_wallet');
  };

  return (
    <WalletContext.Provider value={{
      wallet,
      connected,
      connecting,
      connect,
      disconnect,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
import React, { createContext, useContext, useState, useEffect } from 'react';

interface WalletContextType {
  connected: boolean;
  publicKey: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const connect = () => {
    // Mock wallet connection
    const mockAddress = 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH';
    setPublicKey(mockAddress);
    setConnected(true);
    localStorage.setItem('wallet-connected', 'true');
    localStorage.setItem('wallet-address', mockAddress);
  };

  const disconnect = () => {
    setPublicKey(null);
    setConnected(false);
    localStorage.removeItem('wallet-connected');
    localStorage.removeItem('wallet-address');
  };

  useEffect(() => {
    // Check for saved wallet connection
    const wasConnected = localStorage.getItem('wallet-connected');
    const savedAddress = localStorage.getItem('wallet-address');
    
    if (wasConnected && savedAddress) {
      setPublicKey(savedAddress);
      setConnected(true);
    }
  }, []);

  return (
    <WalletContext.Provider value={{
      connected,
      publicKey,
      connect,
      disconnect,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
