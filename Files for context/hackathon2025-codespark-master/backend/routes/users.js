const express = require("express");
const router = express.Router();
const { query } = require("../db");

// POST /api/users/identify - Identify user by email
router.post("/identify", async (req, res) => {
  const { username } = req.body;
  console.log(`[USERS] POST /api/users/identify - Body:`, req.body);
  try {
    if (!username) {
      console.log(`[USERS] POST /api/users/identify - Missing username`);
      return res.status(400).json({
        success: false,
        error: "Username is required",
      });
    }

    // Check if user exists
    let result = await query(
      "SELECT id, username FROM users WHERE username = $1",
      [username]
    );

    let user;
    if (result.rows.length === 0) {
      // Create new user
      console.log(
        `[USERS] POST /api/users/identify - Creating new user: ${username}`
      );
      result = await query(
        "INSERT INTO users (id, username) VALUES (uuid_generate_v4()::VARCHAR(50), $1) RETURNING id, username",
        [username]
      );
      user = result.rows[0];
    } else {
      console.log(
        `[USERS] POST /api/users/identify - Found existing user: ${username} (ID: ${result.rows[0].id})`
      );
      user = result.rows[0];
    }

    console.log(
      `[USERS] POST /api/users/identify - Success: User identified as ${user.username} (ID: ${user.id})`
    );
    res.json({
      success: true,
      data: {
        userId: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(`[USERS] POST /api/users/identify - Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to identify user",
      message: error.message,
    });
  }
});

module.exports = router;
