# Database Seeding Scripts

This directory contains scripts for managing and seeding the database with sample data.

## Files

- `seed.js` - Main database seeding script with comprehensive sample data

## Prerequisites

1. Make sure the database is running:

   ```bash
   npm run db:start
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

## Usage

### Using npm scripts (recommended)

```bash
# Seed the database with sample data
npm run seed

# Clear all data from the database
npm run seed:clear

# Show database summary
npm run seed:summary
```

### Using the script directly

```bash
# Seed the database
node scripts/seed.js seed

# Clear all data
node scripts/seed.js clear

# Show summary
node scripts/seed.js summary

# Show help
node scripts/seed.js
```

## Sample Data

The seeder creates the following sample data:

### Users (8 users)

- alice_gamer
- bob_developer
- charlie_designer
- diana_tester
- edward_player
- fiona_creator
- george_streamer
- helen_modder

### Games (8 popular games)

- The Legend of Zelda: Breath of the Wild
- Elden Ring
- Minecraft
- Portal 2
- Red Dead Redemption 2
- The Witcher 3: Wild Hunt
- Super Mario Odyssey
- God of War

### Tags (16 game categories)

- rpg, action, adventure, strategy, puzzle, horror
- sports, racing, simulation, indie
- multiplayer, single-player, open-world, linear
- story-driven, sandbox

### Relationships

- Game-tag associations (each game has 3-4 relevant tags)
- User plays (users have played various games with random play counts)
- User likes (users have liked specific games)

## Database Schema

The seeder works with the following tables:

- `users` - User accounts
- `games` - Game information
- `tags` - Game categories/tags
- `game_tag_votes` - Associations between games and tags
- `user_plays` - User game play history
- `user_likes` - User game likes

## Customization

To modify the sample data, edit the arrays at the top of `seed.js`:

- `sampleUsers` - Add/modify user data
- `sampleTags` - Add/modify tag categories
- `sampleGames` - Add/modify game data
- `gameTags` - Modify game-tag associations
- `userInteractions` - Modify which games users have played
- `userLikes` - Modify which games users have liked

## Error Handling

The script includes comprehensive error handling:

- Database connection testing
- Individual record creation error handling
- Graceful cleanup on failures
- Detailed logging of all operations

## Example Output

```
✅ Connected to database for seeding
🗑️  Clearing existing data...
   Cleared user_plays
   Cleared user_likes
   Cleared game_tag_votes
   Cleared games
   Cleared tags
   Cleared users
👥 Seeding users...
   Created user: alice_gamer
   Created user: bob_developer
   ...
🏷️  Seeding tags...
   Created tag: rpg
   Created tag: action
   ...
🎮 Seeding games...
   Created game: The Legend of Zelda: Breath of the Wild
   Created game: Elden Ring
   ...
🎯 Seeding game-tag associations...
   Associated tag "action" with game "The Legend of Zelda: Breath of the Wild"
   ...
🎲 Seeding user plays...
   User alice_gamer played The Legend of Zelda: Breath of the Wild 5 times
   ...
❤️  Seeding user likes...
   User alice_gamer liked The Legend of Zelda: Breath of the Wild
   ...

🎉 Database seeding completed successfully!

📊 Database Summary:
   Users: 8
   Games: 8
   Tags: 16
   User Plays: 24
   User Likes: 16
   Game-Tag Votes: 28
```
