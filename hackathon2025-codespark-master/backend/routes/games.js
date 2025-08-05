const express = require("express");
const router = express.Router();
const { query } = require("../db");
const { buildThumbnailUrl } = require("./helpers");

// GET /api/games - List all games
router.get("/", async (req, res) => {
  console.log(`[GAMES] GET /api/games - Query params:`, req.query);
  try {
    const result = await query(`
      SELECT 
        g.id,
        g.name,
        g.thumbnail,
        g.created_at,
        g.like_count,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', t.id,
              'name', t.name
            )
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'::json
        ) as tags
      FROM games g
      LEFT JOIN game_tag_votes gtv ON g.id = gtv.game_id
      LEFT JOIN tags t ON gtv.tag_id = t.id
      GROUP BY g.id, g.name, g.thumbnail, g.created_at, g.like_count
      ORDER BY g.name
    `);

    // Add full thumbnail URLs to the response
    const gamesWithThumbnailUrls = result.rows.map((game) => ({
      ...game,
      thumbnail: buildThumbnailUrl(game.thumbnail),
    }));

    console.log(
      `[GAMES] GET /api/games - Success: returned ${result.rows.length} games`
    );
    res.json({
      success: true,
      data: gamesWithThumbnailUrls,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("[GAMES] GET /api/games - Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch games",
      message: error.message,
    });
  }
});

// GET /api/games/:id - Get a single game by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`[GAMES] GET /api/games/${id} - Params:`, req.params);
  try {
    const result = await query(
      `
      SELECT 
        g.id,
        g.name,
        g.thumbnail,
        g.created_at,
        g.like_count,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', t.id,
              'name', t.name
            )
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'::json
        ) as tags
      FROM games g
      LEFT JOIN game_tag_votes gtv ON g.id = gtv.game_id
      LEFT JOIN tags t ON gtv.tag_id = t.id
      WHERE g.id = $1
      GROUP BY g.id, g.name, g.thumbnail, g.created_at, g.like_count
    `,
      [id]
    );

    if (result.rows.length === 0) {
      console.log(`[GAMES] GET /api/games/${id} - Game not found`);
      return res.status(404).json({
        success: false,
        error: "Game not found",
        message: `Game with ID ${id} does not exist`,
      });
    }

    // Add full thumbnail URL to the response
    const gameWithThumbnailUrl = {
      ...result.rows[0],
      thumbnail: buildThumbnailUrl(result.rows[0].thumbnail),
    };

    console.log(
      `[GAMES] GET /api/games/${id} - Success: returned game "${result.rows[0].name}"`
    );
    res.json({
      success: true,
      data: gameWithThumbnailUrl,
    });
  } catch (error) {
    console.error(`[GAMES] GET /api/games/${id} - Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch game",
      message: error.message,
    });
  }
});

// POST /api/games/:id/play - Record that a user played a game
router.post("/:id/play", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  console.log(
    `[GAMES] POST /api/games/${id}/play - Params:`,
    req.params,
    `Body:`,
    req.body
  );
  try {
    if (!userId) {
      console.log(`[GAMES] POST /api/games/${id}/play - Missing userId`);
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    // Check if game exists
    const gameResult = await query("SELECT id, name FROM games WHERE id = $1", [
      id,
    ]);

    if (gameResult.rows.length === 0) {
      console.log(`[GAMES] POST /api/games/${id}/play - Game not found`);
      return res.status(404).json({
        success: false,
        error: "Game not found",
        message: `Game with ID ${id} does not exist`,
      });
    }

    // Check if user exists
    const userResult = await query(
      "SELECT id, username FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.log(
        `[GAMES] POST /api/games/${id}/play - User not found: ${userId}`
      );
      return res.status(404).json({
        success: false,
        error: "User not found",
        message: `User with ID ${userId} does not exist`,
      });
    }

    // Insert or update play record
    // This query will:
    // - Insert a new record with play_count = 1 if no record exists
    // - Increment play_count by 1 if a record already exists (ON CONFLICT)
    const result = await query(
      `INSERT INTO user_plays (user_id, game_id, play_count, last_played_at) 
       VALUES ($1, $2, 1, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, game_id) 
       DO UPDATE SET 
         play_count = user_plays.play_count + 1,
         last_played_at = CURRENT_TIMESTAMP
       RETURNING play_count, last_played_at`,
      [userId, id]
    );

    console.log(
      `[GAMES] POST /api/games/${id}/play - Success: User ${userId} played game ${id}, total plays: ${result.rows[0].play_count}`
    );

    res.json({
      success: true,
      data: {
        gameId: id,
        gameName: gameResult.rows[0].name,
        userId: userId,
        username: userResult.rows[0].username,
        playCount: result.rows[0].play_count,
        lastPlayedAt: result.rows[0].last_played_at,
      },
    });
  } catch (error) {
    console.error(`[GAMES] POST /api/games/${id}/play - Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to record game play",
      message: error.message,
    });
  }
});

// GET /api/games/plays/:userId - Get play statistics for a user
router.get("/plays/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log(`[GAMES] GET /api/games/plays/${userId} - Params:`, req.params);
  try {
    // Check if user exists
    const userResult = await query(
      "SELECT id, username FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.log(`[GAMES] GET /api/games/plays/${userId} - User not found`);
      return res.status(404).json({
        success: false,
        error: "User not found",
        message: `User with ID ${userId} does not exist`,
      });
    }

    // Get play statistics for the user with tags
    const result = await query(
      `SELECT 
        g.id,
        g.name,
        g.thumbnail,
        up.play_count,
        up.last_played_at,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', t.id,
              'name', t.name
            )
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'::json
        ) as tags
       FROM user_plays up
       JOIN games g ON up.game_id = g.id
       LEFT JOIN game_tag_votes gtv ON g.id = gtv.game_id
       LEFT JOIN tags t ON gtv.tag_id = t.id
       WHERE up.user_id = $1
       GROUP BY g.id, g.name, g.thumbnail, up.play_count, up.last_played_at
       ORDER BY up.last_played_at DESC`,
      [userId]
    );

    // Add full thumbnail URLs to the response
    const playsWithThumbnailUrls = result.rows.map((play) => ({
      ...play,
      thumbnail: buildThumbnailUrl(play.thumbnail),
    }));

    const totalPlays = result.rows.reduce(
      (sum, play) => sum + parseInt(play.play_count),
      0
    );

    console.log(
      `[GAMES] GET /api/games/plays/${userId} - Success: ${result.rows.length} games played, ${totalPlays} total plays`
    );
    res.json({
      success: true,
      data: {
        userId: userId,
        username: userResult.rows[0].username,
        totalGamesPlayed: result.rows.length,
        totalPlays: totalPlays,
        plays: playsWithThumbnailUrls,
      },
    });
  } catch (error) {
    console.error(`[GAMES] GET /api/games/plays/${userId} - Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch play statistics",
      message: error.message,
    });
  }
});

module.exports = router;
