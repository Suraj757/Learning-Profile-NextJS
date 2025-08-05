const express = require("express");
const router = express.Router();
const { query } = require("../db");
const { buildThumbnailUrl } = require("./helpers");

async function getFreshGames(limit = 20) {
  const { rows } = await query("SELECT * FROM fresh_games LIMIT $1", [limit]);
  return rows;
}

async function getPopularGames(limit = 20) {
  const { rows } = await query("SELECT * FROM popular_games LIMIT $1", [limit]);
  return rows;
}

async function getTrendingGames(limit = 20) {
  const { rows } = await query("SELECT * FROM trending_games LIMIT $1", [
    limit,
  ]);
  return rows;
}

async function getFairTrendingGames(limit = 20) {
  const { rows } = await query("SELECT * FROM fair_trending_games LIMIT $1", [
    limit,
  ]);
  return rows;
}

async function getTagBasedRecommendations(userId, limit = 20) {
  const { rows } = await query(
    `
    WITH user_tags AS (
        SELECT DISTINCT gtv.tag_id
        FROM user_likes ul
        JOIN game_tag_votes gtv ON ul.game_id = gtv.game_id
        WHERE ul.user_id = $1
    ),
    tagged_games AS (
        SELECT gtv.game_id, COUNT(*) AS matching_tags
        FROM game_tag_votes gtv
        WHERE gtv.tag_id IN (SELECT tag_id FROM user_tags)
        GROUP BY gtv.game_id
    )
    SELECT 
        g.*, 
        tg.matching_tags,
        COALESCE(
            json_agg(
                DISTINCT jsonb_build_object(
                    'id', t.id,
                    'name', t.name
                )
            ) FILTER (WHERE t.id IS NOT NULL), 
            '[]'::json
        ) as tags
    FROM tagged_games tg
    JOIN games g ON g.id = tg.game_id
    LEFT JOIN game_tag_votes gtv ON g.id = gtv.game_id
    LEFT JOIN tags t ON gtv.tag_id = t.id
    WHERE g.id NOT IN (
        SELECT game_id FROM user_likes WHERE user_id = $1
    )
    GROUP BY g.id, g.name, g.thumbnail, g.created_at, g.like_count, tg.matching_tags
    ORDER BY tg.matching_tags DESC, g.like_count DESC
    LIMIT $2
    `,
    [userId, limit]
  );
  return rows;
}

async function getCollaborativeRecommendations(userId, limit = 20) {
  const { rows } = await query(
    `
    WITH user_liked_games AS (
      SELECT game_id FROM user_likes WHERE user_id = $1
    ),
    similar_users AS (
      SELECT DISTINCT ul.user_id
      FROM user_likes ul
      WHERE ul.game_id IN (SELECT game_id FROM user_liked_games)
        AND ul.user_id != $1
    ),
    recommended_games AS (
      SELECT ul.game_id, COUNT(*) AS freq
      FROM user_likes ul
      WHERE ul.user_id IN (SELECT user_id FROM similar_users)
        AND ul.game_id NOT IN (SELECT game_id FROM user_liked_games)
      GROUP BY ul.game_id
    )
    SELECT 
        g.*, 
        rg.freq,
        COALESCE(
            json_agg(
                DISTINCT jsonb_build_object(
                    'id', t.id,
                    'name', t.name
                )
            ) FILTER (WHERE t.id IS NOT NULL), 
            '[]'::json
        ) as tags
    FROM recommended_games rg
    JOIN games g ON g.id = rg.game_id
    LEFT JOIN game_tag_votes gtv ON g.id = gtv.game_id
    LEFT JOIN tags t ON gtv.tag_id = t.id
    GROUP BY g.id, g.name, g.thumbnail, g.created_at, g.like_count, rg.freq
    ORDER BY freq DESC, g.like_count DESC
    LIMIT $2
    `,
    [userId, limit]
  );
  return rows;
}

/**
 * Get recommended games based on popularity and recent activity
 * @returns {Promise<Array>} Array of recommended games
 */
async function getRecommendedGames() {
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
      ) as tags,
      (g.like_count * 0.7 + COALESCE(g.like_count, 0) * 0.3) as recommendation_score
    FROM games g
    LEFT JOIN game_tag_votes gtv ON g.id = gtv.game_id
    LEFT JOIN tags t ON gtv.tag_id = t.id
    GROUP BY g.id, g.name, g.thumbnail, g.created_at, g.like_count
    ORDER BY recommendation_score DESC, g.name
    LIMIT 20
  `);

  return result.rows;
}

/**
 * Get new games (recently released or added)
 * @returns {Promise<Array>} Array of new games
 */
async function getNewGames() {
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
    ORDER BY g.created_at DESC NULLS LAST, g.name
    LIMIT 20
  `);

  return result.rows;
}

/**
 * Get personalized recommendations for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of personalized game recommendations
 */
async function getUserRecommendations(userId) {
  const result = await query(
    `
    WITH user_liked_tags AS (
      SELECT DISTINCT t.id, t.name
      FROM user_likes ul
      JOIN game_tag_votes gtv ON ul.game_id = gtv.game_id
      JOIN tags t ON gtv.tag_id = t.id
      WHERE ul.user_id = $1
    ),
    user_liked_games AS (
      SELECT game_id FROM user_likes WHERE user_id = $1
    )
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
      ) as tags,
      COUNT(DISTINCT CASE WHEN ult.id IS NOT NULL THEN t.id END) as matching_tags,
      (g.like_count * 0.4 + COALESCE(g.like_count, 0) * 0.2 + COUNT(DISTINCT CASE WHEN ult.id IS NOT NULL THEN t.id END) * 0.4) as recommendation_score
    FROM games g
    LEFT JOIN game_tag_votes gtv ON g.id = gtv.game_id
    LEFT JOIN tags t ON gtv.tag_id = t.id
    LEFT JOIN user_liked_tags ult ON t.id = ult.id
    WHERE g.id NOT IN (SELECT game_id FROM user_liked_games)
    GROUP BY g.id, g.name, g.thumbnail, g.created_at, g.like_count
    ORDER BY recommendation_score DESC, matching_tags DESC, g.name
    LIMIT 20
  `,
    [userId]
  );

  return result.rows;
}

/**
 * Get similar games based on shared tags
 * @param {string} gameId - The game ID to find similar games for
 * @returns {Promise<Object>} Object containing similar games and recommendation type
 */
async function getSimilarGames(gameId) {
  // First, try to get similar games based on shared tags
  const similarResult = await query(
    `
    WITH game_tags AS (
      SELECT DISTINCT t.id, t.name
      FROM game_tag_votes gtv
      JOIN tags t ON gtv.tag_id = t.id
      WHERE gtv.game_id = $1
    )
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
      ) as tags,
      COUNT(DISTINCT CASE WHEN gt.id IS NOT NULL THEN t.id END) as shared_tags,
      (g.like_count * 0.3 + COALESCE(g.like_count, 0) * 0.2 + COUNT(DISTINCT CASE WHEN gt.id IS NOT NULL THEN t.id END) * 0.5) as similarity_score
    FROM games g
    LEFT JOIN game_tag_votes gtv ON g.id = gtv.game_id
    LEFT JOIN tags t ON gtv.tag_id = t.id
    LEFT JOIN game_tags gt ON t.id = gt.id
    WHERE g.id != $1
    GROUP BY g.id, g.name, g.thumbnail, g.created_at, g.like_count
    HAVING COUNT(DISTINCT CASE WHEN gt.id IS NOT NULL THEN t.id END) > 0
    ORDER BY similarity_score DESC NULLS LAST, shared_tags DESC, g.name
    LIMIT 20
  `,
    [gameId]
  );

  // If no similar games found based on tags, get random games instead
  if (similarResult.rows.length === 0) {
    const randomResult = await query(
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
      WHERE g.id != $1
      GROUP BY g.id, g.name, g.thumbnail, g.created_at, g.like_count
      ORDER BY RANDOM()
      LIMIT 20
    `,
      [gameId]
    );

    return {
      games: randomResult.rows,
      recommendationType: "random",
    };
  }

  return {
    games: similarResult.rows,
    recommendationType: "similar",
  };
}

/**
 * Check if a user exists
 * @param {string} userId - The user ID to check
 * @returns {Promise<boolean>} True if user exists, false otherwise
 */
async function userExists(userId) {
  const userCheck = await query("SELECT id FROM users WHERE id = $1", [userId]);
  return userCheck.rows.length > 0;
}

/**
 * Check if a game exists
 * @param {string} gameId - The game ID to check
 * @returns {Promise<Object|null>} Game object if exists, null otherwise
 */
async function gameExists(gameId) {
  const gameCheck = await query("SELECT id, name FROM games WHERE id = $1", [
    gameId,
  ]);
  return gameCheck.rows.length > 0 ? gameCheck.rows[0] : null;
}

/**
 * Add full thumbnail URLs to game objects
 * @param {Array} games - Array of game objects
 * @returns {Array} Array of game objects with full thumbnail URLs
 */
function addThumbnailUrls(games) {
  return games.map((game) => ({
    ...game,
    thumbnail: buildThumbnailUrl(game.thumbnail),
  }));
}

// GET /api/recommendations - Get recommended games (based on popularity and recent activity)
router.get("/", async (req, res) => {
  console.log(
    `[RECOMMENDATIONS] GET /api/recommendations - Query params:`,
    req.query
  );
  try {
    const games = await getPopularGames();
    // const games = await getRecommendedGames();
    const gamesWithThumbnailUrls = addThumbnailUrls(games);

    console.log(
      `[RECOMMENDATIONS] GET /api/recommendations - Success: returned ${games.length} recommended games`
    );
    res.json({
      success: true,
      data: gamesWithThumbnailUrls,
      count: games.length,
    });
  } catch (error) {
    console.error(`[RECOMMENDATIONS] GET /api/recommendations - Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recommended games",
      message: error.message,
    });
  }
});

// GET /api/recommendations/new - Get new games (recently released or added)
router.get("/new", async (req, res) => {
  console.log(
    `[RECOMMENDATIONS] GET /api/recommendations/new - Query params:`,
    req.query
  );
  try {
    const games = await getFreshGames();
    // const games = await getNewGames();
    const gamesWithThumbnailUrls = addThumbnailUrls(games);

    console.log(
      `[RECOMMENDATIONS] GET /api/recommendations/new - Success: returned ${games.length} new games`
    );
    res.json({
      success: true,
      data: gamesWithThumbnailUrls,
      count: games.length,
    });
  } catch (error) {
    console.error(
      `[RECOMMENDATIONS] GET /api/recommendations/new - Error:`,
      error
    );
    res.status(500).json({
      success: false,
      error: "Failed to fetch new games",
      message: error.message,
    });
  }
});

// GET /api/recommendations/user/:userId - Get personalized recommendations for a user
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log(
    `[RECOMMENDATIONS] GET /api/recommendations/user/${userId} - Params:`,
    req.params,
    `Query params:`,
    req.query
  );
  try {
    if (!userId) {
      console.log(
        `[RECOMMENDATIONS] GET /api/recommendations/user/${userId} - Missing userId`
      );
      return res.status(400).json({
        success: false,
        error: "userId is required",
      });
    }

    // Check if user exists
    if (!(await userExists(userId))) {
      console.log(
        `[RECOMMENDATIONS] GET /api/recommendations/user/${userId} - User not found`
      );
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const games = await getTagBasedRecommendations(userId);
    // const games = await getCollaborativeRecommendations(userId);
    // const games = await getUserRecommendations(userId);
    const gamesWithThumbnailUrls = addThumbnailUrls(games);

    console.log(
      `[RECOMMENDATIONS] GET /api/recommendations/user/${userId} - Success: returned ${games.length} personalized recommendations`
    );
    res.json({
      success: true,
      data: gamesWithThumbnailUrls,
      count: games.length,
    });
  } catch (error) {
    console.error(
      `[RECOMMENDATIONS] GET /api/recommendations/user/${userId} - Error:`,
      error
    );
    res.status(500).json({
      success: false,
      error: "Failed to fetch user recommendations",
      message: error.message,
    });
  }
});

// GET /api/recommendations/similar/:gameId - Get similar games based on shared tags
router.get("/similar/:gameId", async (req, res) => {
  const { gameId } = req.params;
  console.log(
    `[RECOMMENDATIONS] GET /api/recommendations/similar/${gameId} - Params:`,
    req.params,
    `Query params:`,
    req.query
  );
  try {
    if (!gameId) {
      console.log(
        `[RECOMMENDATIONS] GET /api/recommendations/similar/${gameId} - Missing gameId`
      );
      return res.status(400).json({
        success: false,
        error: "gameId is required",
      });
    }

    // Check if game exists
    const originalGame = await gameExists(gameId);
    if (!originalGame) {
      console.log(
        `[RECOMMENDATIONS] GET /api/recommendations/similar/${gameId} - Game not found`
      );
      return res.status(404).json({
        success: false,
        error: "Game not found",
      });
    }

    const { games, recommendationType } = await getSimilarGames(gameId);
    const gamesWithThumbnailUrls = addThumbnailUrls(games);

    if (recommendationType === "random") {
      console.log(
        `[RECOMMENDATIONS] GET /api/recommendations/similar/${gameId} - No similar games found, returning random games instead`
      );
    }

    console.log(
      `[RECOMMENDATIONS] GET /api/recommendations/similar/${gameId} - Success: returned ${games.length} ${recommendationType} games`
    );
    res.json({
      success: true,
      data: gamesWithThumbnailUrls,
      count: games.length,
      originalGame: originalGame,
      recommendationType: recommendationType,
    });
  } catch (error) {
    console.error(
      `[RECOMMENDATIONS] GET /api/recommendations/similar/${gameId} - Error:`,
      error
    );
    res.status(500).json({
      success: false,
      error: "Failed to fetch similar games",
      message: error.message,
    });
  }
});

// GET /api/recommendations/trending - Get trending games
router.get("/trending", async (req, res) => {
  console.log(
    `[RECOMMENDATIONS] GET /api/recommendations/trending - Query params:`,
    req.query
  );
  try {
    // const games = await getTrendingGames();
    const games = await getFairTrendingGames();
    const gamesWithThumbnailUrls = addThumbnailUrls(games);

    console.log(
      `[RECOMMENDATIONS] GET /api/recommendations/trending - Success: returned ${games.length} trending games`
    );
    res.json({
      success: true,
      data: gamesWithThumbnailUrls,
      count: games.length,
    });
  } catch (error) {
    console.error(
      `[RECOMMENDATIONS] GET /api/recommendations/trending - Error:`,
      error
    );
    res.status(500).json({
      success: false,
      error: "Failed to fetch trending games",
      message: error.message,
    });
  }
});

module.exports = router;
