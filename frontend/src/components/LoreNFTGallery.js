import React, { useState, useEffect } from 'react';
import { Scroll, Star, Crown, Gem, X } from 'lucide-react';

const LoreNFTGallery = ({ wallet, backendUrl, isOpen, onClose }) => {
  const [loreNFTs, setLoreNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);

  useEffect(() => {
    if (isOpen && wallet.connected && wallet.publicKey) {
      fetchLoreNFTs();
    }
  }, [isOpen, wallet.connected, wallet.publicKey]);

  const fetchLoreNFTs = async () => {
    if (!wallet.publicKey) return;
    
    setLoading(true);
    try {
      const walletAddress = wallet.publicKey.toString();
      const response = await fetch(`${backendUrl}/api/lore-nfts/${walletAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        setLoreNFTs(data.lore_nfts || []);
      }
    } catch (error) {
      console.error('Error fetching lore NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-gray-400 border-gray-400',
      rare: 'text-blue-400 border-blue-400',
      legendary: 'text-yellow-400 border-yellow-400'
    };
    return colors[rarity] || colors.common;
  };

  const getRarityIcon = (rarity) => {
    const icons = {
      common: <Star className="w-4 h-4" />,
      rare: <Gem className="w-4 h-4" />,
      legendary: <Crown className="w-4 h-4" />
    };
    return icons[rarity] || icons.common;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-purple-500/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Scroll className="w-6 h-6 mr-2 text-purple-400" />
            Lore Collection
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
            </div>
          ) : loreNFTs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loreNFTs.map((nft) => (
                <div
                  key={nft.nft_id}
                  className={`bg-black/40 rounded-lg p-4 border-2 cursor-pointer hover:bg-black/60 transition-all duration-300 ${getRarityColor(nft.rarity)}`}
                  onClick={() => setSelectedNFT(nft)}
                >
                  <div className="aspect-square mb-4 rounded-lg overflow-hidden">
                    <img
                      src={nft.image_url}
                      alt={nft.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white text-sm">{nft.name}</h3>
                      <div className={`flex items-center space-x-1 ${getRarityColor(nft.rarity)}`}>
                        {getRarityIcon(nft.rarity)}
                        <span className="text-xs capitalize">{nft.rarity}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-xs line-clamp-2">
                      {nft.description}
                    </p>
                    
                    <div className="text-xs text-purple-400">
                      Unlocked: {nft.unlocked_by_mission?.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Scroll className="w-16 h-16 mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Lore Collected Yet</h3>
              <p className="text-gray-500">
                Complete missions to unlock mystical lore fragments and build your collection
              </p>
            </div>
          )}
        </div>
      </div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl max-w-2xl w-full border border-purple-500/20">
            <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
              <h3 className="text-xl font-bold text-white">{selectedNFT.name}</h3>
              <button
                onClick={() => setSelectedNFT(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={selectedNFT.image_url}
                    alt={selectedNFT.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className={`flex items-center space-x-2 ${getRarityColor(selectedNFT.rarity)}`}>
                    {getRarityIcon(selectedNFT.rarity)}
                    <span className="font-semibold capitalize">{selectedNFT.rarity} Rarity</span>
                  </div>
                  
                  <p className="text-gray-300">{selectedNFT.description}</p>
                  
                  <div className="bg-black/40 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-400 mb-2">Lore Fragment</h4>
                    <p className="text-gray-300 text-sm italic leading-relaxed">
                      "{selectedNFT.lore_text}"
                    </p>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    <p>Unlocked by: <span className="text-purple-400 capitalize">{selectedNFT.unlocked_by_mission?.replace('_', ' ')}</span></p>
                    <p>Discovered: {new Date(selectedNFT.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoreNFTGallery;