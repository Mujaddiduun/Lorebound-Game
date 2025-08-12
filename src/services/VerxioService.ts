import { VerxioClient } from "@verxio/node-sdk";

class VerxioService {
  private client: VerxioClient | null = null;

  async initialize() {
    try {
      // Initialize Verxio client for social features
      this.client = new VerxioClient({
        network: "devnet",
        apiKey: process.env.VERXIO_API_KEY || "demo_key",
      });

      console.log("🔗 Verxio integration initialized");
      return true;
    } catch (error) {
      console.error("Failed to initialize Verxio:", error);
      return false;
    }
  }

  // Social Profile Management
  async createSocialProfile(walletAddress: string, gameData: any) {
    if (!this.client) return null;

    try {
      const profile = await this.client.createProfile({
        wallet: walletAddress,
        username: `Adventurer_${walletAddress.slice(-4)}`,
        gameMetadata: {
          level: gameData.level,
          traits: gameData.traits,
          achievements: gameData.completedQuests,
          currentZone: gameData.currentZone,
        },
        visibility: "public",
      });

      return profile;
    } catch (error) {
      console.error("Error creating Verxio profile:", error);
      return null;
    }
  }

  // Social Interactions
  async shareAchievement(walletAddress: string, achievement: any) {
    if (!this.client) return;

    try {
      await this.client.shareUpdate({
        user: walletAddress,
        type: "achievement",
        content: {
          title: `🏆 ${achievement.name} Unlocked!`,
          description: achievement.description,
          metadata: {
            gameId: "lorebound",
            achievementId: achievement.id,
            timestamp: Date.now(),
          },
        },
        tags: ["gaming", "solana", "lorebound", "achievement"],
      });
    } catch (error) {
      console.error("Error sharing achievement:", error);
    }
  }

  // Community Discovery
  async findNearbyPlayers(walletAddress: string, zone: string) {
    if (!this.client) return [];

    try {
      const players = await this.client.findUsers({
        filters: {
          gameMetadata: {
            currentZone: zone,
          },
          excludeWallet: walletAddress,
        },
        limit: 10,
      });

      return players;
    } catch (error) {
      console.error("Error finding nearby players:", error);
      return [];
    }
  }

  // Chat and Messaging
  async sendZoneMessage(
    walletAddress: string,
    zoneId: string,
    message: string
  ) {
    if (!this.client) return;

    try {
      await this.client.sendMessage({
        from: walletAddress,
        channel: `zone_${zoneId}`,
        content: message,
        type: "zone_chat",
      });
    } catch (error) {
      console.error("Error sending zone message:", error);
    }
  }

  async getZoneMessages(zoneId: string, limit: number = 20) {
    if (!this.client) return [];

    try {
      const messages = await this.client.getChannelMessages(`zone_${zoneId}`, {
        limit,
        orderBy: "timestamp_desc",
      });

      return messages;
    } catch (error) {
      console.error("Error fetching zone messages:", error);
      return [];
    }
  }

  // Friend System
  async sendFriendRequest(fromWallet: string, toWallet: string) {
    if (!this.client) return;

    try {
      await this.client.sendFriendRequest({
        from: fromWallet,
        to: toWallet,
        context: "lorebound_game",
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  }

  async getFriendsList(walletAddress: string) {
    if (!this.client) return [];

    try {
      const friends = await this.client.getFriends(walletAddress);
      return friends;
    } catch (error) {
      console.error("Error fetching friends list:", error);
      return [];
    }
  }

  // Reputation System
  async updateReputation(walletAddress: string, action: string, value: number) {
    if (!this.client) return;

    try {
      await this.client.updateReputation({
        user: walletAddress,
        action,
        value,
        category: "gaming",
        source: "lorebound",
      });
    } catch (error) {
      console.error("Error updating reputation:", error);
    }
  }
}

const verxioService = new VerxioService();
export { VerxioService, verxioService };
