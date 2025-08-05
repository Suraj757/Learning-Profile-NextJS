Here's a quick breakdown of each game recommendation strategy, explained in simple terms along with how each works:
🔥 1. Trending Games

What it does: Recommends games that are both popular and recently released.

How it works:

    Combines metrics like:

        Play counts

        Likes

        Recency (how new the game is)

    Uses a scoring formula that gives higher scores to games with more activity and freshness.

🆕 2. Fresh Games

What it does: Shows the newest games, regardless of popularity.

How it works:

    Filters games based on their created_at timestamp.

    Sorts by most recent and optionally by engagement (likes, plays).

📈 3. Popular Games

What it does: Highlights games that are the most played or liked overall.

How it works:

    Ranks games based on:

        Total number of plays

        Total number of likes

        Number of unique users playing the game

❤️ 4. Tag-Based Recommendations

What it does: Suggests games that share similar tags to what a user already likes.

How it works:

    Identifies tags from games the user liked.

    Finds other games with overlapping tags.

    Excludes games the user has already interacted with.

👥 5. Collaborative Filtering (Lite)

What it does: Recommends games liked by similar users.

How it works:

    Finds users who liked the same games as the target user.

    Recommends other games those users liked, excluding games already liked by the target user.

    Based on the idea: “People similar to you liked these too.”

🧑‍🤝‍🧑 6. Fairness-Aware Recommendations

What it does:
Ensures that underexposed games (especially those made by kids with few or no likes/plays) get a fair chance to be discovered, alongside popular ones.

How it works:

    Adds a "fairness bonus" to the trending score of games with low or zero activity.

    Boosts games that:

        Have never been played or liked (+1.5 bonus)

        Have fewer than 3 likes and 5 plays (+1.0 bonus)

    Final score = Trending score + Fairness bonus, so games still compete on merit but start with a more level playing field.

Why it's useful:
Without this, games by less popular creators (like kids new to the platform) may never be seen — this method makes the system inclusive and encouraging.
