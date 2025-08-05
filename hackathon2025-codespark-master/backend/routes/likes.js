const express = require("express");
const router = express.Router();
const { query } = require("../db");

// GET /api/likes - Check if user liked a game OR get all liked games for user
router.get("/", async (req, res) => {
  const { userId, gameId } = req.query;
  console.log(`[LIKES] GET /api/likes - Query params:`, req.query);
  try {
    if (!userId) {
      console.log(`[LIKES] GET /api/likes - Missing required param: userId`);
      return res.status(400).json({
        success: false,
        error: "userId is required",
      });
    }

    // If gameId is provided, check if user liked that specific game
    if (gameId) {
      const result = await query(
        "SELECT user_id FROM user_likes WHERE user_id = $1 AND game_id = $2",
        [userId, gameId]
      );

      const hasLiked = result.rows.length > 0;

      console.log(
        `[LIKES] GET /api/likes - Success: User ${userId} ${
          hasLiked ? "has" : "has not"
        } liked game ${gameId}`
      );
      res.json({
        success: true,
        hasLiked: hasLiked,
        userId: userId,
        gameId: gameId,
      });
    } else {
      // If no gameId provided, get all liked games for the user
      const result = await query(
        "SELECT game_id FROM user_likes WHERE user_id = $1",
        [userId]
      );

      const likedGameIds = result.rows.map((row) => row.game_id);

      console.log(
        `[LIKES] GET /api/likes - Success: User ${userId} has ${likedGameIds.length} liked games`
      );
      res.json({
        success: true,
        likedGameIds: likedGameIds,
        userId: userId,
        count: likedGameIds.length,
      });
    }
  } catch (error) {
    console.error(`[LIKES] GET /api/likes - Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to check like status",
      message: error.message,
    });
  }
});

// POST /api/likes - Like a game
router.post("/", async (req, res) => {
  const { userId, gameId } = req.body;
  console.log(`[LIKES] POST /api/likes - Body:`, req.body);
  try {
    if (!userId || !gameId) {
      console.log(
        `[LIKES] POST /api/likes - Missing required params: userId=${userId}, gameId=${gameId}`
      );
      return res.status(400).json({
        success: false,
        error: "userId and gameId are required",
      });
    }

    // Check if user and game exist
    const userCheck = await query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);
    const gameCheck = await query("SELECT id FROM games WHERE id = $1", [
      gameId,
    ]);

    if (userCheck.rows.length === 0) {
      console.log(`[LIKES] POST /api/likes - User not found: ${userId}`);
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (gameCheck.rows.length === 0) {
      console.log(`[LIKES] POST /api/likes - Game not found: ${gameId}`);
      return res.status(404).json({
        success: false,
        error: "Game not found",
      });
    }

    // Add like (ignore if already exists due to PRIMARY KEY constraint)
    await query(
      "INSERT INTO user_likes (user_id, game_id) VALUES ($1, $2) ON CONFLICT (user_id, game_id) DO NOTHING",
      [userId, gameId]
    );

    // Update game like count
    await query(
      "UPDATE games SET like_count = (SELECT COUNT(*) FROM user_likes WHERE game_id = $1) WHERE id = $1",
      [gameId]
    );

    console.log(
      `[LIKES] POST /api/likes - Success: User ${userId} liked game ${gameId}`
    );
    res.json({
      success: true,
      message: "Game liked successfully",
    });
  } catch (error) {
    console.error(`[LIKES] POST /api/likes - Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to like game",
      message: error.message,
    });
  }
});

// DELETE /api/likes - Unlike a game
router.delete("/", async (req, res) => {
  const { userId, gameId } = req.body;
  console.log(`[LIKES] DELETE /api/likes - Body:`, req.body);
  try {
    if (!userId || !gameId) {
      console.log(
        `[LIKES] DELETE /api/likes - Missing required params: userId=${userId}, gameId=${gameId}`
      );
      return res.status(400).json({
        success: false,
        error: "userId and gameId are required",
      });
    }

    // Remove like
    const result = await query(
      "DELETE FROM user_likes WHERE user_id = $1 AND game_id = $2",
      [userId, gameId]
    );

    if (result.rowCount === 0) {
      console.log(
        `[LIKES] DELETE /api/likes - Like not found: User ${userId}, Game ${gameId}`
      );
      return res.status(404).json({
        success: false,
        error: "Like not found",
      });
    }

    // Update game like count
    await query(
      "UPDATE games SET like_count = (SELECT COUNT(*) FROM user_likes WHERE game_id = $1) WHERE id = $1",
      [gameId]
    );

    console.log(
      `[LIKES] DELETE /api/likes - Success: User ${userId} unliked game ${gameId}`
    );
    res.json({
      success: true,
      message: "Game unliked successfully",
    });
  } catch (error) {
    console.error(`[LIKES] DELETE /api/likes - Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to unlike game",
      message: error.message,
    });
  }
});

module.exports = router;
