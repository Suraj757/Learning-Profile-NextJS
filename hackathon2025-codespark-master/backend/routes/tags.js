const express = require("express");
const router = express.Router();
const { query } = require("../db");

// GET /api/tags - List all tags
router.get("/", async (req, res) => {
  console.log(`[TAGS] GET /api/tags - Query params:`, req.query);
  try {
    const result = await query(`
      SELECT 
        t.id,
        t.name,
        COUNT(gtv.game_id) as game_count
      FROM tags t
      LEFT JOIN game_tag_votes gtv ON t.id = gtv.tag_id
      GROUP BY t.id, t.name
      ORDER BY t.name
    `);

    console.log(
      `[TAGS] GET /api/tags - Success: returned ${result.rows.length} tags`
    );
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error(`[TAGS] GET /api/tags - Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tags",
      message: error.message,
    });
  }
});

// POST /api/tags/game - Add a tag to a game
router.post("/game", async (req, res) => {
  const { userId, tagId } = req.body;
  const { gameId } = req.query; // Get gameId from query params
  console.log(
    `[TAGS] POST /api/tags/game - Body:`,
    req.body,
    `Query params:`,
    req.query
  );
  try {
    if (!userId || !tagId || !gameId) {
      console.log(
        `[TAGS] POST /api/tags/game - Missing required params: userId=${userId}, tagId=${tagId}, gameId=${gameId}`
      );
      return res.status(400).json({
        success: false,
        error: "userId, tagId, and gameId are required",
      });
    }

    // Check if user, tag, and game exist
    const userCheck = await query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);
    const tagCheck = await query("SELECT id FROM tags WHERE id = $1", [tagId]);
    const gameCheck = await query("SELECT id FROM games WHERE id = $1", [
      gameId,
    ]);

    if (userCheck.rows.length === 0) {
      console.log(`[TAGS] POST /api/tags/game - User not found: ${userId}`);
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (tagCheck.rows.length === 0) {
      console.log(`[TAGS] POST /api/tags/game - Tag not found: ${tagId}`);
      return res.status(404).json({
        success: false,
        error: "Tag not found",
      });
    }

    if (gameCheck.rows.length === 0) {
      console.log(`[TAGS] POST /api/tags/game - Game not found: ${gameId}`);
      return res.status(404).json({
        success: false,
        error: "Game not found",
      });
    }

    // Add tag vote (ignore if already exists due to PRIMARY KEY constraint)
    await query(
      "INSERT INTO game_tag_votes (game_id, tag_id, user_id) VALUES ($1, $2, $3) ON CONFLICT (game_id, tag_id, user_id) DO NOTHING",
      [gameId, tagId, userId]
    );

    console.log(
      `[TAGS] POST /api/tags/game - Success: User ${userId} added tag ${tagId} to game ${gameId}`
    );
    res.json({
      success: true,
      message: "Tag added to game successfully",
    });
  } catch (error) {
    console.error(`[TAGS] POST /api/tags/game - Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to add tag to game",
      message: error.message,
    });
  }
});

// DELETE /api/tags/game - Remove a tag from a game
router.delete("/game", async (req, res) => {
  const { userId, tagId } = req.body;
  const { gameId } = req.query;
  console.log(
    `[TAGS] DELETE /api/tags/game - Body:`,
    req.body,
    `Query params:`,
    req.query
  );
  try {
    if (!userId || !tagId || !gameId) {
      console.log(
        `[TAGS] DELETE /api/tags/game - Missing required params: userId=${userId}, tagId=${tagId}, gameId=${gameId}`
      );
      return res.status(400).json({
        success: false,
        error: "userId, tagId, and gameId are required",
      });
    }

    // Remove tag vote
    const result = await query(
      "DELETE FROM game_tag_votes WHERE game_id = $1 AND tag_id = $2 AND user_id = $3",
      [gameId, tagId, userId]
    );

    if (result.rowCount === 0) {
      console.log(
        `[TAGS] DELETE /api/tags/game - Tag vote not found: User ${userId}, Tag ${tagId}, Game ${gameId}`
      );
      return res.status(404).json({
        success: false,
        error: "Tag vote not found",
      });
    }

    console.log(
      `[TAGS] DELETE /api/tags/game - Success: User ${userId} removed tag ${tagId} from game ${gameId}`
    );
    res.json({
      success: true,
      message: "Tag removed from game successfully",
    });
  } catch (error) {
    console.error(`[TAGS] DELETE /api/tags/game - Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to remove tag from game",
      message: error.message,
    });
  }
});

// GET /api/tags/user/:userId - Get tags for a specific user
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log(`[TAGS] GET /api/tags/user/${userId}`);

  try {
    // Check if user exists
    const userCheck = await query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);
    if (userCheck.rows.length === 0) {
      console.log(`[TAGS] GET /api/tags/user/${userId} - User not found`);
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Get tags the user has added to games
    const userAddedTags = await query(
      `
      SELECT DISTINCT
        t.id,
        t.name,
        t.description,
        t.category,
        COUNT(gtv.game_id) as games_tagged
      FROM tags t
      INNER JOIN game_tag_votes gtv ON t.id = gtv.tag_id
      WHERE gtv.user_id = $1
      GROUP BY t.id, t.name, t.description, t.category
      ORDER BY t.name
    `,
      [userId]
    );

    // Get tags from games the user has interacted with (liked or played)
    const userInteractionTags = await query(
      `
      SELECT DISTINCT
        t.id,
        t.name,
        t.description,
        t.category,
        COUNT(DISTINCT gtv.game_id) as games_with_tag,
        CASE 
          WHEN MAX(CASE WHEN ul.user_id IS NOT NULL THEN 1 ELSE 0 END) = 1 THEN 'liked'
          WHEN MAX(CASE WHEN up.user_id IS NOT NULL THEN 1 ELSE 0 END) = 1 THEN 'played'
          ELSE 'interacted'
        END as interaction_type
      FROM tags t
      INNER JOIN game_tag_votes gtv ON t.id = gtv.tag_id
      LEFT JOIN user_likes ul ON gtv.game_id = ul.game_id AND ul.user_id = $1
      LEFT JOIN user_plays up ON gtv.game_id = up.game_id AND up.user_id = $1
      WHERE (ul.user_id IS NOT NULL OR up.user_id IS NOT NULL)
        AND gtv.user_id <> $1  -- Exclude tags the user added themselves
      GROUP BY t.id, t.name, t.description, t.category
      ORDER BY t.name
    `,
      [userId]
    );

    console.log(
      `[TAGS] GET /api/tags/user/${userId} - Success: returned ${userAddedTags.rows.length} user-added tags and ${userInteractionTags.rows.length} interaction tags`
    );

    res.json({
      success: true,
      data: {
        userAddedTags: userAddedTags.rows,
        userInteractionTags: userInteractionTags.rows,
        summary: {
          totalUserAddedTags: userAddedTags.rows.length,
          totalInteractionTags: userInteractionTags.rows.length,
          totalUniqueTags: new Set([
            ...userAddedTags.rows.map((tag) => tag.id),
            ...userInteractionTags.rows.map((tag) => tag.id),
          ]).size,
        },
      },
    });
  } catch (error) {
    console.error(`[TAGS] GET /api/tags/user/${userId} - Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user tags",
      message: error.message,
    });
  }
});

module.exports = router;
