import { useEffect, useState } from "react";
import { honeycombService } from "../services/HoneycombService";
import { Trophy, Users, TrendingUp, X } from "lucide-react";

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LeaderboardEntry {
  wallet: string;
  xp: number;
  level: number;
  traits: string[];
}

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await honeycombService.getGlobalLeaderboard(10);
      setLeaderboard(data);

      // Get current player's rank
      const rank = await honeycombService.getPlayerRank("current_player");
      setPlayerRank(rank);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-md rounded-2xl border border-white/20 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">
                Global Leaderboard
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Player's Rank */}
          {playerRank && (
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-4 mb-6 border border-green-500/30">
              <div className="flex items-center justify-between">
                <span className="text-green-300 font-medium">Your Rank</span>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-bold">
                    #{playerRank}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading leaderboard...</p>
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={entry.wallet}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-yellow-400 w-12">
                        {getRankIcon(index + 1)}
                      </span>
                      <div>
                        <p className="text-white font-semibold">
                          {formatWallet(entry.wallet)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Level {entry.level} • {entry.xp.toLocaleString()} XP
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex space-x-1 mb-1">
                        {entry.traits.slice(0, 3).map((i) => (
                          <span
                            key={i}
                            className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                          />
                        ))}
                        {entry.traits.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{entry.traits.length - 3}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {entry.traits.length} traits
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Community Stats */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                Join thousands of adventurers exploring Lorebound
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
