const { pool, testConnection } = require("../db");

class DatabaseSeeder {
  constructor() {
    this.client = null;
  }

  async connect() {
    try {
      this.client = await pool.connect();
      console.log("✅ Connected to database for seeding");
    } catch (error) {
      console.error("❌ Failed to connect to database:", error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      this.client.release();
      console.log("✅ Disconnected from database");
    }
  }

  async clearData() {
    console.log("🗑️  Clearing existing data...");

    const tables = [
      "user_plays",
      "user_likes",
      "game_tag_votes",
      "games",
      "tags",
      "users",
    ];

    for (const table of tables) {
      try {
        await this.client.query(`DELETE FROM ${table}`);
        console.log(`   Cleared ${table}`);
      } catch (error) {
        console.error(`   Error clearing ${table}:`, error.message);
      }
    }
  }

  async seedUsers() {
    console.log("👥 Seeding users from users_all.sql...");

    try {
      // Read the SQL file
      const fs = require("fs");
      const path = require("path");
      const sqlFilePath = path.join(__dirname, "..", "users_all.sql");

      if (!fs.existsSync(sqlFilePath)) {
        console.error(`   ❌ SQL file not found: ${sqlFilePath}`);
        return;
      }

      const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

      // Execute the SQL content
      try {
        await this.client.query(sqlContent);
        console.log("   ✅ Successfully inserted users from users_all.sql");
      } catch (error) {
        console.error("   ❌ Error executing users_all.sql:", error.message);
      }
    } catch (error) {
      console.error("   ❌ Error loading users_all.sql:", error.message);
    }
  }

  async seedTags() {
    console.log("🏷️  Seeding tags from tags.sql...");

    try {
      // Read the SQL file
      const fs = require("fs");
      const path = require("path");
      const sqlFilePath = path.join(__dirname, "..", "tags.sql");

      if (!fs.existsSync(sqlFilePath)) {
        console.error(`   ❌ SQL file not found: ${sqlFilePath}`);
        return;
      }

      const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

      // Execute the entire SQL content directly since it's a single INSERT statement
      // The tags.sql file contains a single multi-line INSERT statement

      // Execute the entire SQL content
      try {
        await this.client.query(sqlContent);
        console.log("   ✅ Successfully inserted tags from tags.sql");
      } catch (error) {
        console.error("   ❌ Error executing tags.sql:", error.message);
      }
    } catch (error) {
      console.error("   ❌ Error loading tags.sql:", error.message);
    }
  }

  async seedGames() {
    console.log("🎮 Seeding games from gamedata.sql...");

    try {
      // Read the SQL file
      const fs = require("fs");
      const path = require("path");
      const sqlFilePath = path.join(__dirname, "..", "gamedata.sql");

      if (!fs.existsSync(sqlFilePath)) {
        console.error(`   ❌ SQL file not found: ${sqlFilePath}`);
        return;
      }

      const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

      // Split the SQL content into individual statements
      // The file contains INSERT statements separated by "--- INSERT Statement (Specific Fields) ---"
      const statements = sqlContent
        .split("--- INSERT Statement (Specific Fields) ---")
        .filter((stmt) => stmt.trim())
        .map((stmt) => stmt.trim());

      console.log(`   Found ${statements.length} game records to insert`);

      // Execute each INSERT statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement) {
          try {
            await this.client.query(statement);
            if ((i + 1) % 10 === 0) {
              console.log(`   Inserted ${i + 1} games...`);
            }
          } catch (error) {
            console.error(`   Error inserting game ${i + 1}:`, error.message);
          }
        }
      }

      console.log(
        `   ✅ Successfully inserted ${statements.length} games from gamedata.sql`
      );
    } catch (error) {
      console.error("   ❌ Error loading gamedata.sql:", error.message);
    }
  }

  async seedGameTagVotesFromSQL() {
    console.log("🎯 Seeding game tag votes from game_tag_votes.sql...");

    try {
      // Read the SQL file
      const fs = require("fs");
      const path = require("path");
      const sqlFilePath = path.join(__dirname, "..", "game_tag_votes.sql");

      if (!fs.existsSync(sqlFilePath)) {
        console.error(`   ❌ SQL file not found: ${sqlFilePath}`);
        return;
      }

      const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

      // Get all existing game IDs from the database
      const gameResult = await this.client.query("SELECT id FROM games");
      const existingGameIds = new Set(gameResult.rows.map((row) => row.id));

      // Get all existing user IDs from the database
      const userResult = await this.client.query("SELECT id FROM users");
      const existingUserIds = new Set(userResult.rows.map((row) => row.id));

      // Get all existing tag IDs from the database
      const tagResult = await this.client.query("SELECT id FROM tags");
      const existingTagIds = new Set(tagResult.rows.map((row) => row.id));

      // Split the SQL content into individual statements
      const statements = sqlContent
        .split("--- INSERT Statement ---")
        .filter((stmt) => stmt.trim())
        .map((stmt) => stmt.trim());

      console.log(
        `   Found ${statements.length} game tag vote records to insert`
      );

      // Execute each INSERT statement
      let insertedCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement) {
          try {
            // Parse the statement to extract game_id, tag_id, and user_id
            const match = statement.match(
              /VALUES\s*\(\s*['"]([^'"]+)['"],\s*(\d+),\s*['"]([^'"]+)['"]\s*\)/
            );
            if (match) {
              const [, gameId, tagId, userId] = match;

              // Check if all IDs exist in the database
              if (
                existingGameIds.has(gameId) &&
                existingTagIds.has(parseInt(tagId)) &&
                existingUserIds.has(userId)
              ) {
                await this.client.query(statement);
                insertedCount++;
              } else {
                skippedCount++;
              }
            } else {
              // If we can't parse it, try to execute it directly
              await this.client.query(statement);
              insertedCount++;
            }

            if ((i + 1) % 50 === 0) {
              console.log(`   Processed ${i + 1} statements...`);
            }
          } catch (error) {
            console.error(
              `   Error inserting game tag vote ${i + 1}:`,
              error.message
            );
            skippedCount++;
          }
        }
      }

      console.log(
        `   ✅ Successfully inserted ${insertedCount} game tag votes from game_tag_votes.sql`
      );
      console.log(`   Skipped ${skippedCount} invalid game tag votes`);
    } catch (error) {
      console.error("   ❌ Error loading game_tag_votes.sql:", error.message);
    }
  }

  async seedUserLikesFromSQL() {
    console.log("❤️  Seeding user likes from user_likes.sql...");

    try {
      // Read the SQL file
      const fs = require("fs");
      const path = require("path");
      const sqlFilePath = path.join(__dirname, "..", "user_likes.sql");

      if (!fs.existsSync(sqlFilePath)) {
        console.error(`   ❌ SQL file not found: ${sqlFilePath}`);
        return;
      }

      const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

      // Get all existing game IDs from the database
      const gameResult = await this.client.query("SELECT id FROM games");
      const existingGameIds = new Set(gameResult.rows.map((row) => row.id));

      // Get all existing user IDs from the database
      const userResult = await this.client.query("SELECT id FROM users");
      const existingUserIds = new Set(userResult.rows.map((row) => row.id));

      // Parse the SQL content to extract user_id and game_id pairs
      const lines = sqlContent.split("\n");
      const validLikes = [];
      let skippedCount = 0;

      for (const line of lines) {
        // Look for lines that contain user_id and game_id pairs
        const match = line.match(/\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/);
        if (match) {
          const [, userId, gameId] = match;

          // Check if both user and game exist
          if (existingUserIds.has(userId) && existingGameIds.has(gameId)) {
            validLikes.push({ userId, gameId });
          } else {
            skippedCount++;
          }
        }
      }

      console.log(`   Found ${validLikes.length} valid likes to insert`);
      console.log(
        `   Skipped ${skippedCount} likes with non-existent users or games`
      );

      // Insert valid likes
      let insertedCount = 0;
      for (const like of validLikes) {
        try {
          await this.client.query(
            "INSERT INTO user_likes (user_id, game_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [like.userId, like.gameId]
          );
          insertedCount++;
        } catch (error) {
          console.error(
            `   Error inserting like for user ${like.userId} and game ${like.gameId}:`,
            error.message
          );
        }
      }

      console.log(
        `   ✅ Successfully inserted ${insertedCount} user likes from user_likes.sql`
      );
    } catch (error) {
      console.error("   ❌ Error loading user_likes.sql:", error.message);
    }
  }

  async run() {
    try {
      await this.connect();

      // Test connection
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error("Database connection test failed");
      }

      // Clear existing data
      await this.clearData();

      // Seed data in order
      await this.seedUsers();
      await this.seedTags();
      await this.seedGames();
      await this.seedGameTagVotesFromSQL();
      await this.seedUserLikesFromSQL();

      console.log("\n🎉 Database seeding completed successfully!");

      // Show summary
      await this.showSummary();
    } catch (error) {
      console.error("❌ Seeding failed:", error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async showSummary() {
    console.log("\n📊 Database Summary:");

    try {
      const userCount = await this.client.query("SELECT COUNT(*) FROM users");
      const gameCount = await this.client.query("SELECT COUNT(*) FROM games");
      const tagCount = await this.client.query("SELECT COUNT(*) FROM tags");
      const playCount = await this.client.query(
        "SELECT COUNT(*) FROM user_plays"
      );
      const likeCount = await this.client.query(
        "SELECT COUNT(*) FROM user_likes"
      );
      const tagVoteCount = await this.client.query(
        "SELECT COUNT(*) FROM game_tag_votes"
      );

      console.log(`   Users: ${userCount.rows[0].count}`);
      console.log(`   Games: ${gameCount.rows[0].count}`);
      console.log(`   Tags: ${tagCount.rows[0].count}`);
      console.log(`   User Plays: ${playCount.rows[0].count}`);
      console.log(`   User Likes: ${likeCount.rows[0].count}`);
      console.log(`   Game-Tag Votes: ${tagVoteCount.rows[0].count}`);
    } catch (error) {
      console.error("   Error getting summary:", error.message);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const seeder = new DatabaseSeeder();

  switch (command) {
    case "seed":
      await seeder.run();
      break;
    case "clear":
      await seeder.connect();
      await seeder.clearData();
      await seeder.disconnect();
      console.log("🗑️  Database cleared");
      break;
    case "summary":
      await seeder.connect();
      await seeder.showSummary();
      await seeder.disconnect();
      break;
    default:
      console.log(`
🎮 Database Seeder

Usage:
  node seed.js seed     - Seed the database with sample data
  node seed.js clear    - Clear all data from the database
  node seed.js summary  - Show database summary

Examples:
  node seed.js seed
  node seed.js clear
  node seed.js summary
      `);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseSeeder;
