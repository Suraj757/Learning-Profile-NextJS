"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart,
  Play,
  Star,
  Sparkles,
  TrendingUp,
  Clock,
  ChevronDown,
  Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Game {
  id: string;
  name: string;
  thumbnail: string;
  created_at: string;
  like_count: number;
  tags: { id: number; name: string }[];
  recommendation_score?: number;
  matching_tags?: number;
  play_count?: number;
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

export default function KidsGameStore() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [newGames, setNewGames] = useState<Game[]>([]);
  const [trendingGames, setTrendingGames] = useState<Game[]>([]);
  const [personalizedGames, setPersonalizedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [likedGames, setLikedGames] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState("personalized");
  const router = useRouter();
  const [likedGamesList, setLikedGamesList] = useState<Game[]>([]);
  const [suggestedGames, setSuggestedGames] = useState<Game[]>([]);
  const [userPlayStats, setUserPlayStats] = useState<{
    totalPlays: number;
    plays: Array<{
      id: string;
      name: string;
      thumbnail: string;
      play_count: number;
      last_played_at: string;
      tags: { id: number; name: string }[];
    }>;
  } | null>(null);
  const [userTagsData, setUserTagsData] = useState<UserTagsData | null>(null);

  const identifyUser = async () => {
    if (!username.trim()) return;

    setLoading(true);
    try {
      const result = await api.identifyUser(username);
      if (result.success && result.data) {
        setUser(result.data);
        localStorage.setItem("gamestore_user", JSON.stringify(result.data));
      }
    } catch (error) {
      console.error("Failed to identify user:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const result = await api.getGames();
      if (result.success) {
        setGames(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch games:", error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      // Fetch popular games
      const popularResult = await api.getPopularGames();
      if (popularResult.success) {
        setPopularGames(popularResult.data);
      }

      // Fetch new games
      const newResult = await api.getNewGames();
      if (newResult.success) {
        setNewGames(newResult.data);
      }

      // Fetch trending games
      const trendingResult = await api.getTrendingGames();
      if (trendingResult.success) {
        setTrendingGames(trendingResult.data);
      }

      // Fetch personalized recommendations if user is logged in
      if (user) {
        const personalizedResult = await api.getPersonalizedRecommendations(
          user.userId
        );
        if (personalizedResult.success) {
          setPersonalizedGames(personalizedResult.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    }
  };

  const fetchLikedGames = async () => {
    if (!user) return;

    try {
      const result = await api.getUserLikedGames(user.userId);
      if (result.success) {
        const likedIds = new Set(result.data);
        const userLikedGames = games.filter((game) => likedIds.has(game.id));
        setLikedGamesList(userLikedGames);
      }
    } catch (error) {
      console.error("Failed to fetch liked games:", error);
    }
  };

  const fetchSuggestedGames = async () => {
    if (!user) return;

    try {
      // Get a mix of popular and personalized recommendations
      const popularResult = await api.getPopularGames();
      const personalizedResult = await api.getPersonalizedRecommendations(
        user.userId
      );

      const suggested: Game[] = [];

      // Add top personalized games
      if (personalizedResult.success) {
        suggested.push(...personalizedResult.data.slice(0, 4));
      }

      // Add some popular games that aren't already included
      if (popularResult.success) {
        const popularNotIncluded = popularResult.data.filter(
          (game) => !suggested.some((sg) => sg.id === game.id)
        );
        suggested.push(...popularNotIncluded.slice(0, 4));
      }

      setSuggestedGames(suggested);
    } catch (error) {
      console.error("Failed to fetch suggested games:", error);
    }
  };

  const fetchUserPlayStats = async () => {
    if (!user) return;

    try {
      const result = await api.getUserPlayStats(user.userId);
      if (result.success && result.data) {
        setUserPlayStats(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch user play stats:", error);
    }
  };

  const fetchUserTags = async () => {
    if (!user) return;

    try {
      const result = await api.getUserTags(user.userId);
      if (result.success && result.data) {
        setUserTagsData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch user tags:", error);
    }
  };

  const likeGame = async (gameId: string) => {
    if (!user) return;

    try {
      // Use local state to determine if already liked
      const hasLiked = likedGames.has(gameId);

      let result;
      if (hasLiked) {
        result = await api.unlikeGame(user.userId, gameId);
      } else {
        result = await api.likeGame(user.userId, gameId);
      }

      if (result.success) {
        // Refresh games data
        fetchGames();
        fetchRecommendations();
        fetchUserLikes(); // Refresh user likes
        fetchLikedGames(); // Refresh liked games list
        fetchSuggestedGames(); // Refresh suggested games
      }
    } catch (error) {
      console.error("Failed to like/unlike game:", error);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;

    try {
      const result = await api.getUserLikedGames(user.userId);
      if (result.success) {
        setLikedGames(new Set(result.data));
      }
    } catch (error) {
      console.error("Failed to fetch user likes:", error);
    }
  };

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem("gamestore_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    fetchGames();
    fetchRecommendations();
    if (user) {
      fetchUserLikes();
      fetchLikedGames();
      fetchSuggestedGames();
      fetchUserPlayStats();
      fetchUserTags();
    }
  }, [user]);

  // Also add a separate useEffect to refetch liked games when games data changes
  useEffect(() => {
    if (user && games.length > 0) {
      fetchLikedGames();
    }
  }, [user, games]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  // Simplified Game Card Component
  const SimpleGameCard = ({
    game,
    showScore = false,
  }: {
    game: Game;
    showScore?: boolean;
  }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-3 hover:border-primary/50 bg-gradient-to-br from-white to-blue-50 overflow-hidden">
      <div className="relative">
        <img
          src={game.thumbnail || "/placeholder.svg"}
          alt={game.name}
          className="w-full h-40 object-cover"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white text-lg px-6 py-4 rounded-full shadow-lg transform hover:scale-105 transition-transform"
            onClick={() => router.push(`/game/${game.id}`)}
          >
            <Play className="w-6 h-6 mr-2" />
            Play!
          </Button>
        </div>
        {showScore && game.recommendation_score && (
          <div className="absolute bottom-2 right-2">
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1"
            >
              <Star className="w-3 h-3 mr-1" />
              {Math.round(game.recommendation_score)}%
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-primary line-clamp-1 flex-1">
            {game.name}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className={`ml-2 p-1 transition-all duration-300 ${
              likedGames.has(game.id)
                ? "text-red-500"
                : "text-gray-400 hover:text-red-500"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              likeGame(game.id);
            }}
            disabled={!user}
          >
            <Heart
              className={`w-5 h-5 transition-colors duration-300 ${
                likedGames.has(game.id) ? "fill-current" : ""
              }`}
            />
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="font-semibold">
              {game.like_count?.toLocaleString() || 0}
            </span>
          </div>
          {game.play_count && (
            <div className="flex items-center gap-1">
              <Play className="w-4 h-4 text-blue-500" />
              <span className="font-semibold">{game.play_count} plays</span>
            </div>
          )}
        </div>

        <div className="flex gap-1 mb-3">
          {game.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-xs px-2 py-1 bg-purple-50 text-purple-700 border-purple-200"
            >
              {tag.name}
            </Badge>
          ))}
          {game.tags.length > 2 && (
            <Badge variant="outline" className="text-xs px-2 py-1">
              +{game.tags.length - 2}
            </Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full bg-transparent text-sm py-2 hover:bg-blue-50"
          onClick={() => router.push(`/game/${game.id}`)}
        >
          Play Game
        </Button>
      </CardContent>
    </Card>
  );

  // Tag Card Component
  const TagCard = ({
    tag,
    type,
  }: {
    tag: UserTag;
    type: "added" | "interaction";
  }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 border-3 hover:border-primary/50 bg-gradient-to-br from-white to-green-50 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-primary">{tag.name}</h3>
              {tag.description && (
                <p className="text-sm text-muted-foreground">
                  {tag.description}
                </p>
              )}
            </div>
          </div>
          <Badge
            variant={type === "added" ? "default" : "secondary"}
            className={`${
              type === "added"
                ? "bg-emerald-500 text-white"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {type === "added"
              ? "You Added"
              : tag.interaction_type || "Interacted"}
          </Badge>
        </div>

        <div className="space-y-3">
          {type === "added" && tag.games_tagged && (
            <div className="flex items-center gap-2 text-sm">
              <Play className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold">
                {tag.games_tagged} games tagged
              </span>
            </div>
          )}

          {type === "interaction" && tag.games_with_tag && (
            <div className="flex items-center gap-2 text-sm">
              <Heart className="w-4 h-4 text-blue-500" />
              <span className="font-semibold">
                {tag.games_with_tag} games with this tag
              </span>
            </div>
          )}

          {tag.category && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-muted-foreground">
                Category: {tag.category}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const navigationItems = [
    {
      id: "personalized",
      label: "Just For You",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      show: true,
    },
    {
      id: "liked",
      label: "Your Liked Games",
      icon: Heart,
      color: "from-red-500 to-pink-500",
      show: user && likedGamesList.length > 0,
    },
    {
      id: "suggested",
      label: "Suggested Games",
      icon: Star,
      color: "from-yellow-500 to-orange-500",
      show: user && suggestedGames.length > 0,
    },
    {
      id: "played",
      label: "Games You've Played",
      icon: Play,
      color: "from-blue-500 to-green-500",
      show: user && userPlayStats && userPlayStats.plays.length > 0,
    },
    {
      id: "tags",
      label: "Your Tags",
      icon: Tag,
      color: "from-emerald-500 to-teal-500",
      show:
        user &&
        userTagsData &&
        (userTagsData.userAddedTags.length > 0 ||
          userTagsData.userInteractionTags.length > 0),
    },
    {
      id: "popular",
      label: "Popular",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      show: true,
    },
    {
      id: "new",
      label: "New Games",
      icon: Clock,
      color: "from-green-500 to-blue-500",
      show: true,
    },
    {
      id: "trending",
      label: "Trending",
      icon: TrendingUp,
      color: "from-indigo-500 to-purple-500",
      show: trendingGames.length > 0,
    },
    {
      id: "all",
      label: "All Games",
      icon: Play,
      color: "from-indigo-500 to-purple-500",
      show: true,
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-4 border-white shadow-2xl">
          <CardHeader className="text-center bg-gradient-to-r from-yellow-300 to-orange-300 rounded-t-lg">
            <div className="text-6xl mb-4">🎮</div>
            <CardTitle className="text-3xl font-bold text-purple-800">
              Welcome to codeSpark GameHub!
            </CardTitle>
            <CardDescription className="text-xl text-purple-700">
              What is your name, friend?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8 bg-white">
            <Input
              placeholder="Type your name here..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && identifyUser()}
              className="text-xl py-6 px-4 border-4 border-blue-200 rounded-xl focus:border-blue-400"
            />
            <Button
              onClick={identifyUser}
              disabled={loading || !username.trim()}
              className="w-full text-xl py-6 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform"
            >
              {loading ? "Getting Ready..." : "Let's Play Games! 🚀"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCurrentGames = () => {
    switch (activeSection) {
      case "personalized":
        return personalizedGames.slice(0, 8);
      case "liked":
        return likedGamesList;
      case "suggested":
        return suggestedGames;
      case "played":
        return (
          userPlayStats?.plays?.map((play) => ({
            id: play.id,
            name: play.name,
            thumbnail: play.thumbnail,
            created_at: play.last_played_at,
            like_count: 0,
            tags: play.tags || [],
            play_count: play.play_count,
          })) || []
        );
      case "tags":
        return []; // Tags are handled separately in the UI
      case "popular":
        return popularGames.slice(0, 8);
      case "new":
        return newGames.slice(0, 8);
      case "trending":
        return trendingGames.slice(0, 8);
      case "all":
        return games;
      default:
        return personalizedGames.slice(0, 8);
    }
  };

  const getCurrentTitle = () => {
    switch (activeSection) {
      case "personalized":
        return "Just For You! ✨";
      case "liked":
        return "Your Favorite Games! ❤️";
      case "suggested":
        return "Games We Think You Will Love! ⭐ (popular + personalized)";
      case "played":
        return `Games You Have Played! 🎮 (${
          userPlayStats?.totalPlays || 0
        } total plays)`;
      case "tags":
        return "Your Personalized Tags! 📚";
      case "popular":
        return "Super Popular Games! 🔥";
      case "new":
        return "Brand New Games! 🆕";
      case "trending":
        return "Trending Games! 🔥";
      case "all":
        return "All Our Amazing Games! 🎮";
      default:
        return "Just For You! ✨";
    }
  };

  const getCurrentIcon = () => {
    const item = navigationItems.find((item) => item.id === activeSection);
    return item ? item.icon : Sparkles;
  };

  const getCurrentColor = () => {
    const item = navigationItems.find((item) => item.id === activeSection);
    return item ? item.color : "from-purple-600 to-pink-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="border-b-4 border-purple-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              codeSpark GameHub
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-100 to-orange-100 px-6 py-3 rounded-full border-2 border-yellow-300">
                <Avatar
                  className={`w-10 h-10 ${
                    user.avatar?.color || "bg-purple-100"
                  } border-2 border-white`}
                >
                  <AvatarFallback
                    className={`${
                      user.avatar?.color || "bg-purple-100"
                    } text-2xl`}
                  >
                    {user.avatar?.emoji || "😊"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xl font-bold text-purple-800">
                  Hi, {user.username}!
                </span>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-6 py-3 border-2 border-red-300 hover:bg-red-50 bg-transparent"
                onClick={() => {
                  setUser(null);
                  localStorage.removeItem("gamestore_user");
                }}
              >
                Bye Bye! 👋
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Pills */}
      <div className="sticky top-[88px] z-40 bg-white/95 backdrop-blur border-b-2 border-purple-100 py-4">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {navigationItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "outline"}
                    size="lg"
                    className={`flex items-center gap-3 px-6 py-4 rounded-full text-lg font-bold whitespace-nowrap transition-all duration-300 ${
                      activeSection === item.id
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                        : "bg-white hover:bg-gray-50 border-2 border-gray-300"
                    }`}
                    onClick={() => scrollToSection(item.id)}
                  >
                    <Icon className="w-6 h-6" />
                    {item.label}
                    {activeSection === item.id && (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </Button>
                );
              })}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Current Section */}
        <section id={activeSection}>
          <div className="flex items-center gap-4 mb-8">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${getCurrentColor()} rounded-full flex items-center justify-center`}
            >
              {(() => {
                const Icon = getCurrentIcon();
                return <Icon className="w-7 h-7 text-white" />;
              })()}
            </div>
            <h2
              className={`text-4xl font-bold bg-gradient-to-r ${getCurrentColor()
                .replace("from-", "from-")
                .replace("to-", "to-")} bg-clip-text text-transparent`}
            >
              {getCurrentTitle()}
            </h2>
          </div>

          {activeSection === "tags" ? (
            <div className="space-y-8">
              {/* User Added Tags */}
              {userTagsData?.userAddedTags &&
                userTagsData.userAddedTags.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-emerald-600 mb-4 flex items-center gap-2">
                      <Tag className="w-6 h-6" />
                      Tags You&apos;ve Added (
                      {userTagsData.userAddedTags.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userTagsData.userAddedTags.map((tag) => (
                        <TagCard
                          key={`added-${tag.id}`}
                          tag={tag}
                          type="added"
                        />
                      ))}
                    </div>
                  </div>
                )}

              {/* User Interaction Tags */}
              {userTagsData?.userInteractionTags &&
                userTagsData.userInteractionTags.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-blue-600 mb-4 flex items-center gap-2">
                      <Heart className="w-6 h-6" />
                      Tags from Games You&apos;ve Interacted With (
                      {userTagsData.userInteractionTags.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userTagsData.userInteractionTags.map((tag) => (
                        <TagCard
                          key={`interaction-${tag.id}`}
                          tag={tag}
                          type="interaction"
                        />
                      ))}
                    </div>
                  </div>
                )}

              {/* Summary */}
              {userTagsData && (
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-xl border-2 border-emerald-200">
                  <h4 className="text-xl font-bold text-gray-800 mb-3">
                    Your Tag Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600">
                        {userTagsData.summary.totalUserAddedTags}
                      </div>
                      <div className="text-sm text-gray-600">
                        Tags You Added
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {userTagsData.summary.totalInteractionTags}
                      </div>
                      <div className="text-sm text-gray-600">
                        Interaction Tags
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {userTagsData.summary.totalUniqueTags}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Unique Tags
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {getCurrentGames().map((game) => (
                <SimpleGameCard
                  key={game.id}
                  game={game}
                  showScore={activeSection === "personalized"}
                />
              ))}
            </div>
          )}

          {getCurrentGames().length === 0 && activeSection !== "tags" && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-2xl font-bold text-purple-600 mb-4">
                Ready for an adventure?
              </p>
              <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
                {activeSection === "personalized"
                  ? "We're still learning what you love! Try exploring our popular games or check out what's new to help us find perfect matches for you."
                  : "This section is waiting for you to discover amazing games! Head over to our other sections to find your next favorite game."}
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => scrollToSection("popular")}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-full"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Explore Popular Games
                </Button>
                <Button
                  onClick={() => scrollToSection("new")}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-full"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Check Out New Games
                </Button>
              </div>
            </div>
          )}

          {activeSection === "tags" &&
            (!userTagsData ||
              (userTagsData.userAddedTags.length === 0 &&
                userTagsData.userInteractionTags.length === 0)) && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏷️</div>
                <p className="text-2xl font-bold text-emerald-600">
                  No tags found! Start playing games and adding tags to see them
                  here.
                </p>
              </div>
            )}
        </section>

        {/* Hidden sections for smooth scrolling */}
        {navigationItems
          .filter((item) => item.show && item.id !== activeSection)
          .map((item) => (
            <div key={item.id} id={item.id} className="h-0 invisible" />
          ))}
      </main>
    </div>
  );
}
