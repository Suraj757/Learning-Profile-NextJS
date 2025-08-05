import { getRandomAvatar } from "./avatars";

interface Game {
  id: string;
  name: string;
  thumbnail: string;
  created_at: string;
  like_count: number;
  tags: { id: number; name: string }[];
  recommendation_score?: number;
  matching_tags?: number;
  similarity_score?: number;
}

interface User {
  userId: string;
  username: string;
  avatar: {
    id: number;
    name: string;
    emoji: string;
    color: string;
  };
}

interface Tag {
  id: number;
  name: string;
  game_count: number;
  emoji: string;
  color: string;
}

interface UserPlay {
  gameId: string;
  gameName: string;
  userId: string;
  username: string;
  playCount: number;
  lastPlayedAt: string;
}

interface UserPlayStats {
  userId: string;
  username: string;
  totalGamesPlayed: number;
  totalPlays: number;
  plays: Array<{
    id: string;
    name: string;
    thumbnail: string;
    play_count: number;
    last_played_at: string;
    tags: { id: number; name: string }[];
  }>;
}

interface UserTag {
  id: number;
  name: string;
  description?: string;
  category?: string;
  games_tagged?: number;
  games_with_tag?: number;
  game_ids?: string[];
  interaction_type?: "liked" | "played" | "interacted";
}

interface UserTagsData {
  userAddedTags: UserTag[];
  userInteractionTags: UserTag[];
  summary: {
    totalUserAddedTags: number;
    totalInteractionTags: number;
    totalUniqueTags: number;
  };
}

// Helper functions for tag emoji and color mapping
const getTagEmoji = (tagName: string): string => {
  const emojiMap: { [key: string]: string } = {
    Adventure: "🗺️",
    Magic: "✨",
    Friendship: "👫",
    Animals: "🐾",
    Learning: "📚",
    Racing: "🏁",
    Cars: "🚗",
    Fun: "🎉",
    Puzzles: "🧩",
    Princess: "👸",
    Thinking: "🧠",
    Space: "🌌",
    Aliens: "👽",
    Cooking: "🍳",
  };
  return emojiMap[tagName] || "🏷️";
};

const getTagColor = (tagName: string): string => {
  const colorMap: { [key: string]: string } = {
    Adventure: "bg-green-100 text-green-800",
    Magic: "bg-purple-100 text-purple-800",
    Friendship: "bg-pink-100 text-pink-800",
    Animals: "bg-orange-100 text-orange-800",
    Learning: "bg-blue-100 text-blue-800",
    Racing: "bg-red-100 text-red-800",
    Cars: "bg-gray-100 text-gray-800",
    Fun: "bg-yellow-100 text-yellow-800",
    Puzzles: "bg-indigo-100 text-indigo-800",
    Princess: "bg-pink-100 text-pink-800",
    Thinking: "bg-cyan-100 text-cyan-800",
    Space: "bg-purple-100 text-purple-800",
    Aliens: "bg-green-100 text-green-800",
    Cooking: "bg-orange-100 text-orange-800",
  };
  return colorMap[tagName] || "bg-gray-100 text-gray-800";
};

// API functions
export const api = {
  // User identification
  async identifyUser(
    username: string
  ): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      const response = await fetch("http://localhost:3001/api/users/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Add avatar to the user data from backend
        const userWithAvatar = {
          ...result.data,
          avatar: getRandomAvatar(),
        };
        return { success: true, data: userWithAvatar };
      } else {
        throw new Error(result.error || "Failed to identify user");
      }
    } catch (error) {
      console.error("Error identifying user:", error);
      return { success: false, error: "Failed to identify user" };
    }
  },

  // Get all games
  async getGames(): Promise<{ success: boolean; data: Game[]; count: number }> {
    try {
      const response = await fetch("http://localhost:3001/api/games", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || "Failed to fetch games");
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      return { success: false, data: [], count: 0 };
    }
  },

  // Get popular games (recommendations)
  async getPopularGames(): Promise<{ success: boolean; data: Game[] }> {
    try {
      const response = await fetch(
        "http://localhost:3001/api/recommendations",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || "Failed to fetch popular games");
      }
    } catch (error) {
      console.error("Error fetching popular games:", error);
      return { success: false, data: [] };
    }
  },

  // Get new games
  async getNewGames(): Promise<{ success: boolean; data: Game[] }> {
    try {
      const response = await fetch(
        "http://localhost:3001/api/recommendations/new",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || "Failed to fetch new games");
      }
    } catch (error) {
      console.error("Error fetching new games:", error);
      return { success: false, data: [] };
    }
  },

  // Get trending games
  async getTrendingGames(): Promise<{ success: boolean; data: Game[] }> {
    try {
      const response = await fetch(
        "http://localhost:3001/api/recommendations/trending",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || "Failed to fetch trending games");
      }
    } catch (error) {
      console.error("Error fetching trending games:", error);
      return { success: false, data: [] };
    }
  },

  // Get personalized recommendations
  async getPersonalizedRecommendations(
    userId: string
  ): Promise<{ success: boolean; data: Game[] }> {
    try {
      const response = await fetch(
        `http://localhost:3001/api/recommendations/user/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        throw new Error(
          result.error || "Failed to fetch personalized recommendations"
        );
      }
    } catch (error) {
      console.error("Error fetching personalized recommendations:", error);
      return { success: false, data: [] };
    }
  },

  // Like a game
  async likeGame(
    userId: string,
    gameId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch("http://localhost:3001/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, gameId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        throw new Error(result.error || "Failed to like game");
      }
    } catch (error) {
      console.error("Error liking game:", error);
      return { success: false, message: "Failed to like game" };
    }
  },

  // Unlike a game
  async unlikeGame(
    userId: string,
    gameId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch("http://localhost:3001/api/likes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, gameId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        throw new Error(result.error || "Failed to unlike game");
      }
    } catch (error) {
      console.error("Error unliking game:", error);
      return { success: false, message: "Failed to unlike game" };
    }
  },

  // Get all tags
  async getTags(): Promise<{ success: boolean; data: Tag[]; count: number }> {
    try {
      const response = await fetch("http://localhost:3001/api/tags", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Add emoji and color to the tags from backend since they're not stored in DB
        const tagsWithEmojiAndColor = result.data.map(
          (tag: { id: number; name: string; game_count: number }) => ({
            ...tag,
            emoji: getTagEmoji(tag.name),
            color: getTagColor(tag.name),
          })
        );
        return {
          success: true,
          data: tagsWithEmojiAndColor,
          count: result.count,
        };
      } else {
        throw new Error(result.error || "Failed to fetch tags");
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      return { success: false, data: [], count: 0 };
    }
  },

  // Add tag to game
  async addTagToGame(
    userId: string,
    gameId: string,
    tagId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `http://localhost:3001/api/tags/game?gameId=${gameId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, tagId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        throw new Error(result.error || "Failed to add tag to game");
      }
    } catch (error) {
      console.error("Error adding tag to game:", error);
      return { success: false, message: "Failed to add tag to game" };
    }
  },

  // Remove tag from game
  async removeTagFromGame(
    userId: string,
    gameId: string,
    tagId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `http://localhost:3001/api/tags/game?gameId=${gameId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, tagId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        throw new Error(result.error || "Failed to remove tag from game");
      }
    } catch (error) {
      console.error("Error removing tag from game:", error);
      return { success: false, message: "Failed to remove tag from game" };
    }
  },

  // Get single game by ID
  async getGame(
    gameId: string
  ): Promise<{ success: boolean; data?: Game; error?: string }> {
    try {
      const response = await fetch(
        `http://localhost:3001/api/games/${gameId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Failed to fetch game",
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error fetching game:", error);
      return { success: false, error: "Failed to fetch game" };
    }
  },

  // Check if user has liked a game
  async hasUserLikedGame(userId: string, gameId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `http://localhost:3001/api/likes?userId=${userId}&gameId=${gameId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.hasLiked;
      } else {
        throw new Error(result.error || "Failed to check like status");
      }
    } catch (error) {
      console.error("Error checking if user liked game:", error);
      return false;
    }
  },

  // Get all liked game IDs for a user
  async getUserLikedGames(
    userId: string
  ): Promise<{ success: boolean; data: string[]; count: number }> {
    try {
      const response = await fetch(
        `http://localhost:3001/api/likes?userId=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          data: result.likedGameIds || [],
          count: result.count || 0,
        };
      } else {
        throw new Error(result.error || "Failed to fetch user liked games");
      }
    } catch (error) {
      console.error("Error fetching user liked games:", error);
      return { success: false, data: [], count: 0 };
    }
  },

  // Get similar games based on tags and genre
  async getSimilarGames(
    gameId: string
  ): Promise<{ success: boolean; data: Game[] }> {
    try {
      const response = await fetch(
        `http://localhost:3001/api/recommendations/similar/${gameId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || "Failed to fetch similar games");
      }
    } catch (error) {
      console.error("Error fetching similar games:", error);
      return { success: false, data: [] };
    }
  },

  // Record that a user played a game
  async playGame(
    userId: string,
    gameId: string
  ): Promise<{ success: boolean; data?: UserPlay; error?: string }> {
    try {
      const response = await fetch(
        `http://localhost:3001/api/games/${gameId}/play`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Failed to record game play",
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error recording game play:", error);
      return { success: false, error: "Failed to record game play" };
    }
  },

  // Get user play statistics
  async getUserPlayStats(
    userId: string
  ): Promise<{ success: boolean; data?: UserPlayStats; error?: string }> {
    try {
      const response = await fetch(
        `http://localhost:3001/api/games/plays/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Failed to fetch play statistics",
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error fetching play statistics:", error);
      return { success: false, error: "Failed to fetch play statistics" };
    }
  },

  // Get user tags
  async getUserTags(
    userId: string
  ): Promise<{ success: boolean; data?: UserTagsData; error?: string }> {
    try {
      const response = await fetch(
        `http://localhost:3001/api/tags/user/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Failed to fetch user tags",
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error fetching user tags:", error);
      return { success: false, error: "Failed to fetch user tags" };
    }
  },
};
