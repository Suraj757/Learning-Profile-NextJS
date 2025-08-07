"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart,
  Play,
  TagIcon,
  ArrowLeft,
  Plus,
  X,
  Star,
  Home,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";

interface Game {
  id: string;
  name: string;
  thumbnail: string;
  created_at: string;
  like_count: number;
  tags: { id: number; name: string }[];
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

export default function KidsGameDetail() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [similarGames, setSimilarGames] = useState<Game[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [gameTransitionLoading, setGameTransitionLoading] = useState(false);

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem("gamestore_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchGame = async () => {
    try {
      const result = await api.getGame(gameId);
      if (result.success && result.data) {
        setGame(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch game:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarGames = async () => {
    try {
      const result = await api.getSimilarGames(gameId);
      if (result.success) {
        setSimilarGames(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch similar games:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const result = await api.getTags();
      if (result.success) {
        setAvailableTags(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  const checkIfLiked = async () => {
    if (user && game) {
      const liked = await api.hasUserLikedGame(user.userId, game.id);
      setHasLiked(liked);
    }
  };

  const likeGame = async () => {
    if (!user || !game) return;

    try {
      let result;
      if (hasLiked) {
        result = await api.unlikeGame(user.userId, game.id);
      } else {
        result = await api.likeGame(user.userId, game.id);
      }

      if (result.success) {
        setHasLiked(!hasLiked);
        // Refresh game data to update like count
        const gameResult = await api.getGame(game.id);
        if (gameResult.success && gameResult.data) {
          setGame(gameResult.data);
        }
      }
    } catch (error) {
      console.error("Failed to like/unlike game:", error);
    }
  };

  const addTag = async (tagId: number) => {
    if (!user || !game) return;

    try {
      const result = await api.addTagToGame(user.userId, game.id, tagId);
      if (result.success) {
        // Refresh game data to show new tag immediately
        const gameResult = await api.getGame(game.id);
        if (gameResult.success && gameResult.data) {
          setGame(gameResult.data);
        }
        fetchTags(); // Refresh available tags
        setIsTagDialogOpen(false); // Close the dialog
      }
    } catch (error) {
      console.error("Failed to add tag:", error);
    }
  };

  const removeTag = async (tagId: number) => {
    if (!user || !game) return;

    try {
      const result = await api.removeTagFromGame(user.userId, game.id, tagId);
      if (result.success) {
        // Refresh game data to remove tag immediately
        const gameResult = await api.getGame(game.id);
        if (gameResult.success && gameResult.data) {
          setGame(gameResult.data);
        }
        fetchTags(); // Refresh available tags
      }
    } catch (error) {
      console.error("Failed to remove tag:", error);
    }
  };

  const startPlaying = async () => {
    if (!user || !game) return;

    try {
      const result = await api.playGame(user.userId, game.id);
      if (result.success) {
        setIsPlaying(true);
        console.log("Game play recorded successfully:", result.data);
      } else {
        console.error("Failed to record game play:", result.error);
        // Still set playing state even if API call fails
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error recording game play:", error);
      // Still set playing state even if API call fails
      setIsPlaying(true);
    }
  };

  const handleGameTransition = async (newGameId: string) => {
    setGameTransitionLoading(true);
    // Small delay to show the spinner
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push(`/game/${newGameId}`);
  };

  useEffect(() => {
    if (gameId) {
      fetchGame();
      fetchTags();
      fetchSimilarGames();
    }
  }, [gameId]);

  useEffect(() => {
    checkIfLiked();
  }, [user, game]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎮</div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-2xl font-bold text-purple-600">
            Loading your game...
          </p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-3xl font-bold mb-6 text-purple-600">
            Oops! Game Not Found
          </h1>
          <Button
            size="lg"
            className="text-xl px-8 py-6"
            onClick={() => router.push("/")}
          >
            <Home className="w-6 h-6 mr-3" />
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  const availableTagsToAdd = availableTags.filter(
    (tag) => !game.tags.some((gameTag) => gameTag.id === tag.id)
  );

  const SimilarGameCard = ({ similarGame }: { similarGame: Game }) => (
    <div
      className="flex gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer transition-all duration-500 group border-2 border-transparent hover:border-purple-200 hover:shadow-lg transform hover:scale-105"
      onClick={() => handleGameTransition(similarGame.id)}
    >
      <div className="relative flex-shrink-0">
        <img
          src={similarGame.thumbnail || "/placeholder.svg"}
          alt={similarGame.name}
          className="w-28 h-20 object-cover rounded-lg border-2 border-purple-200 transition-all duration-300 group-hover:border-purple-400"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-lg flex items-center justify-center">
          {gameTransitionLoading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Play className="w-6 h-6 text-white transform scale-75 group-hover:scale-100 transition-transform duration-300" />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-lg line-clamp-2 mb-2 text-purple-800 group-hover:text-purple-900 transition-colors duration-300">
          {similarGame.name}
        </h4>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-500 transition-colors duration-300 group-hover:text-red-600" />
            <span className="font-semibold">
              {similarGame.like_count?.toLocaleString() || 0}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {similarGame.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-sm px-2 py-1 bg-purple-50 text-purple-700 transition-all duration-300 group-hover:bg-purple-100"
            >
              {tag.name}
            </Badge>
          ))}
          {similarGame.similarity_score && (
            <Badge
              variant="secondary"
              className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 transition-all duration-300 group-hover:bg-yellow-200"
            >
              <span className="flex items-center">
                <Star className="w-3 h-3 mr-1" />
                {Math.round(similarGame.similarity_score)}%
              </span>
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="border-b-4 border-purple-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="lg"
            className="text-xl px-6 py-4"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-6 h-6 mr-3" />
            Back to Games
          </Button>
          {user && (
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
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Game Media and Controls - Takes up 3 columns */}
          <div className="lg:col-span-3">
            {/* Game Video/Image */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-8 border-4 border-purple-300 shadow-2xl">
              {isPlaying ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
                  <div className="text-center text-white">
                    <div className="text-8xl mb-6 animate-bounce">🎮</div>
                    <h3 className="text-4xl font-bold mb-4">
                      Playing: {game.name}
                    </h3>
                    <p className="text-2xl opacity-80 mb-6">
                      Having fun? Keep playing!
                    </p>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="text-xl px-8 py-6 bg-white text-purple-600 hover:bg-gray-100"
                      onClick={() => setIsPlaying(false)}
                    >
                      Stop Playing
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={game.thumbnail || "/placeholder.svg"}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Button
                      size="lg"
                      className="bg-green-500 hover:bg-green-600 text-white text-2xl px-12 py-8 rounded-full shadow-2xl transform hover:scale-110 transition-transform"
                      onClick={startPlaying}
                    >
                      <Play className="w-10 h-10 mr-4" />
                      Let&apos;s Play!
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Game Action Buttons */}
            <div className="space-y-4 mb-8">
              <Button
                variant={hasLiked ? "default" : "outline"}
                className={`w-full text-xl py-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ${
                  hasLiked
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-white hover:bg-red-50 border-4 border-red-300"
                }`}
                onClick={likeGame}
                disabled={!user}
              >
                <Heart
                  className={`w-6 h-6 mr-3 transition-all duration-300 ${
                    hasLiked ? "fill-current text-white" : "text-red-500"
                  }`}
                />
                {hasLiked ? "I Love This! ❤️" : "Love This Game! 💖"}
              </Button>
            </div>

            {/* Tags Section */}
            <Card className="border-4 border-green-200 shadow-xl bg-gradient-to-br from-white to-green-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-2xl text-green-800">
                    <TagIcon className="w-6 h-6" />
                    Game Tags
                  </CardTitle>
                  {user && availableTagsToAdd.length > 0 && (
                    <Dialog
                      open={isTagDialogOpen}
                      onOpenChange={setIsTagDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="lg"
                          className="border-2 border-green-300 hover:bg-green-50 bg-transparent transition-all duration-300 hover:scale-105"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-4 border-purple-200 max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl text-purple-800">
                            Add Fun Tags!
                          </DialogTitle>
                          <DialogDescription className="text-lg text-purple-600">
                            Help other kids find this game by adding tags!
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                          {availableTagsToAdd.map((tag) => (
                            <Button
                              key={tag.id}
                              variant="outline"
                              size="lg"
                              onClick={() => addTag(tag.id)}
                              className={`justify-start text-lg py-4 ${tag.color} border-2 transition-all duration-300 hover:scale-105`}
                            >
                              <span className="text-2xl mr-3">{tag.emoji}</span>
                              {tag.name}
                            </Button>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {game.tags.map((tag) => {
                    const tagData = availableTags.find((t) => t.id === tag.id);
                    return (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className={`flex items-center gap-2 text-lg px-4 py-2 ${
                          tagData?.color || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {tagData?.emoji && (
                          <span className="text-xl">{tagData.emoji}</span>
                        )}
                        {tag.name}
                        {user && (
                          <button
                            onClick={() => removeTag(tag.id)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </Badge>
                    );
                  })}
                  {game.tags.length === 0 && (
                    <p className="text-lg text-muted-foreground">
                      No tags yet - be the first to add some!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-4 border-purple-200 shadow-xl bg-gradient-to-br from-white to-purple-50">
              <CardHeader>
                <CardTitle className="text-3xl text-purple-800">
                  {game.name}
                </CardTitle>
                <CardDescription className="text-lg text-purple-600">
                  Added {new Date(game.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-lg text-muted-foreground">
                    <Heart className="w-6 h-6 text-red-500" />
                    <span className="font-bold">
                      {game.like_count?.toLocaleString() || 0} likes
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-lg text-muted-foreground">
                    <Heart className="w-6 h-6 text-red-500" />
                    <span className="font-bold">
                      {game.like_count?.toLocaleString() || 0} likes
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Game Info */}
                <div>
                  <h3 className="text-xl font-bold text-purple-800 mb-3">
                    About This Game
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    This is a fun game that you can play with your friends!
                    Enjoy exploring and having adventures together.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Similar Games Sidebar - Takes up 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <div className="sticky top-28">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-purple-800">
                <Play className="w-7 h-7 text-purple-600" />
                More Fun Games Like This! 🎮
              </h3>
              <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                {similarGames.map((similarGame) => (
                  <SimilarGameCard
                    key={similarGame.id}
                    similarGame={similarGame}
                  />
                ))}
                {similarGames.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="text-6xl mb-4">🎮</div>
                    <p className="text-xl font-bold text-purple-600">
                      Looking for more games...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
