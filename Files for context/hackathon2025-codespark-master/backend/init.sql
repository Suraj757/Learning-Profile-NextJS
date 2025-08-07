-- Initialize database for hackathon project
-- This file runs when the PostgreSQL container starts for the first time
-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a sample table for testing
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    like_count INT DEFAULT 0
);

CREATE TABLE tags (
    id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE game_tag_votes (
    game_id VARCHAR(50) REFERENCES games(id),
    tag_id INT REFERENCES tags(id),
    user_id VARCHAR(50) REFERENCES users(id),
    PRIMARY KEY (game_id, tag_id, user_id)
);

CREATE TABLE user_likes (
    user_id VARCHAR(50) REFERENCES users(id),
    game_id VARCHAR(50) REFERENCES games(id),
    PRIMARY KEY (user_id, game_id)
);

CREATE TABLE user_plays (
    user_id VARCHAR(50) REFERENCES users(id),
    game_id VARCHAR(50) REFERENCES games(id),
    play_count INT DEFAULT 1,
    last_played_at TIMESTAMP,
    PRIMARY KEY (user_id, game_id)
);

-- Insert sample data
INSERT INTO
    users (id, username)
VALUES
    ('MARTIN', 'MARTIN') ON CONFLICT (username) DO NOTHING;

-- Improved trending_games view that handles minimal data better
CREATE
OR REPLACE VIEW trending_games AS WITH game_stats AS (
    SELECT
        g.id,
        g.name,
        g.thumbnail,
        g.created_at,
        g.like_count,
        COALESCE(SUM(up.play_count), 0) AS total_plays,
        COALESCE(COUNT(DISTINCT up.user_id), 0) AS unique_players,
        COALESCE(
            EXTRACT(
                EPOCH
                FROM
                    (NOW() - g.created_at)
            ) / 86400,
            0
        ) AS days_old,
        -- Calculate engagement rate (likes per day since creation)
        CASE
            WHEN COALESCE(
                EXTRACT(
                    EPOCH
                    FROM
                        (NOW() - g.created_at)
                ) / 86400,
                0
            ) > 0 THEN COALESCE(g.like_count, 0) :: float / COALESCE(
                EXTRACT(
                    EPOCH
                    FROM
                        (NOW() - g.created_at)
                ) / 86400,
                1
            )
            ELSE COALESCE(g.like_count, 0) :: float
        END AS engagement_rate
    FROM
        games g
        LEFT JOIN user_plays up ON g.id = up.game_id
    GROUP BY
        g.id,
        g.name,
        g.thumbnail,
        g.created_at,
        g.like_count
)
SELECT
    gs.*,
    -- Adaptive trending score that works with minimal and complete data
    COALESCE(
        CASE
            -- When we have minimal data (most games have 0-1 likes)
            WHEN (
                SELECT
                    COALESCE(AVG(like_count), 0)
                FROM
                    games
            ) < 2 THEN -- Prioritize recency and any engagement, with small bonus for likes
            (1 / (1 + COALESCE(gs.days_old, 0))) * 0.7 + LOG(1 + COALESCE(gs.like_count, 0)) * 0.2 + LOG(1 + COALESCE(gs.total_plays, 0)) * 0.1 -- When we have substantial data
            ELSE -- Standard trending algorithm
            LOG(1 + COALESCE(gs.like_count, 0)) * 0.5 + LOG(1 + COALESCE(gs.total_plays, 0)) * 0.3 + (1 / (1 + COALESCE(gs.days_old, 0))) * 0.2
        END,
        0
    ) AS trending_score,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id',
                t.id,
                'name',
                t.name
            )
        ) FILTER (
            WHERE
                t.id IS NOT NULL
        ),
        '[]' :: json
    ) as tags
FROM
    game_stats gs
    LEFT JOIN game_tag_votes gtv ON gs.id = gtv.game_id
    LEFT JOIN tags t ON gtv.tag_id = t.id
GROUP BY
    gs.id,
    gs.name,
    gs.thumbnail,
    gs.created_at,
    gs.like_count,
    gs.total_plays,
    gs.unique_players,
    gs.days_old,
    gs.engagement_rate
ORDER BY
    trending_score DESC;

-- Improved fresh_games view with better handling of minimal data
CREATE
OR REPLACE VIEW fresh_games AS
SELECT
    g.*,
    COALESCE(SUM(up.play_count), 0) AS total_plays,
    COALESCE(COUNT(DISTINCT up.user_id), 0) AS unique_players,
    -- Add engagement indicator for minimal data scenarios
    CASE
        WHEN g.like_count > 0
        OR COALESCE(SUM(up.play_count), 0) > 0 THEN 'engaged'
        ELSE 'new'
    END AS engagement_status,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id',
                t.id,
                'name',
                t.name
            )
        ) FILTER (
            WHERE
                t.id IS NOT NULL
        ),
        '[]' :: json
    ) as tags
FROM
    games g
    LEFT JOIN user_plays up ON g.id = up.game_id
    LEFT JOIN game_tag_votes gtv ON g.id = gtv.game_id
    LEFT JOIN tags t ON gtv.tag_id = t.id
WHERE
    g.created_at > NOW() - INTERVAL '14 days'
GROUP BY
    g.id,
    g.name,
    g.thumbnail,
    g.created_at,
    g.like_count
ORDER BY
    -- Prioritize engaged games, then by recency
    CASE
        WHEN g.like_count > 0
        OR COALESCE(SUM(up.play_count), 0) > 0 THEN 0
        ELSE 1
    END,
    g.created_at DESC;

-- Improved popular_games view with fallback ordering
CREATE
OR REPLACE VIEW popular_games AS
SELECT
    g.*,
    COALESCE(SUM(up.play_count), 0) AS total_plays,
    COALESCE(COUNT(DISTINCT up.user_id), 0) AS unique_players,
    -- Add popularity tier for better categorization
    CASE
        WHEN COALESCE(SUM(up.play_count), 0) >= 100
        OR g.like_count >= 50 THEN 'very_popular'
        WHEN COALESCE(SUM(up.play_count), 0) >= 20
        OR g.like_count >= 10 THEN 'popular'
        WHEN COALESCE(SUM(up.play_count), 0) >= 5
        OR g.like_count >= 3 THEN 'somewhat_popular'
        ELSE 'new'
    END AS popularity_tier,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id',
                t.id,
                'name',
                t.name
            )
        ) FILTER (
            WHERE
                t.id IS NOT NULL
        ),
        '[]' :: json
    ) as tags
FROM
    games g
    LEFT JOIN user_plays up ON g.id = up.game_id
    LEFT JOIN game_tag_votes gtv ON g.id = gtv.game_id
    LEFT JOIN tags t ON gtv.tag_id = t.id
GROUP BY
    g.id,
    g.name,
    g.thumbnail,
    g.created_at,
    g.like_count
ORDER BY
    total_plays DESC,
    like_count DESC,
    -- Fallback to creation order when engagement is identical
    g.created_at DESC;

-- Improved fair_trending_games view with adaptive fairness
CREATE
OR REPLACE VIEW fair_trending_games AS WITH play_stats AS (
    SELECT
        up.game_id,
        SUM(up.play_count) AS total_plays,
        COUNT(DISTINCT up.user_id) AS unique_players
    FROM
        user_plays up
    GROUP BY
        up.game_id
),
game_metrics AS (
    SELECT
        g.id,
        g.name,
        g.thumbnail,
        g.created_at,
        g.like_count,
        COALESCE(ps.total_plays, 0) AS total_plays,
        COALESCE(ps.unique_players, 0) AS unique_players,
        COALESCE(
            EXTRACT(
                EPOCH
                FROM
                    (NOW() - g.created_at)
            ) / 86400,
            0
        ) AS days_old,
        -- Calculate overall data richness
        (
            SELECT
                COUNT(*)
            FROM
                games
            WHERE
                like_count > 0
                OR id IN (
                    SELECT
                        DISTINCT game_id
                    FROM
                        user_plays
                )
        ) AS games_with_engagement,
        (
            SELECT
                COUNT(*)
            FROM
                games
        ) AS total_games
    FROM
        games g
        LEFT JOIN play_stats ps ON g.id = ps.game_id
)
SELECT
    gm.*,
    -- Adaptive fairness bonus based on data richness
    CASE
        -- When we have minimal data (less than 10% of games have engagement)
        WHEN gm.games_with_engagement :: float / gm.total_games < 0.1 THEN CASE
            WHEN gm.like_count = 0
            AND gm.total_plays = 0 THEN 0.3 -- Reduced bonus
            WHEN gm.like_count < 2
            AND gm.total_plays < 3 THEN 0.1 -- Small bonus
            ELSE 0
        END -- When we have substantial data
        ELSE CASE
            WHEN gm.like_count = 0
            AND gm.total_plays = 0 THEN 1.0
            WHEN gm.like_count < 5
            AND gm.total_plays < 10 THEN 0.5
            ELSE 0
        END
    END AS fairness_bonus,
    -- Final trending score with adaptive fairness
    COALESCE(
        (
            0.5 * LOG(1 + COALESCE(gm.like_count, 0)) + 0.3 * LOG(1 + COALESCE(gm.total_plays, 0)) + 0.2 * (1 / (1 + COALESCE(gm.days_old, 0))) + CASE
                WHEN gm.games_with_engagement :: float / NULLIF(gm.total_games, 0) < 0.1 THEN CASE
                    WHEN COALESCE(gm.like_count, 0) = 0
                    AND COALESCE(gm.total_plays, 0) = 0 THEN 0.3 -- Reduced bonus
                    WHEN COALESCE(gm.like_count, 0) < 2
                    AND COALESCE(gm.total_plays, 0) < 3 THEN 0.1 -- Small bonus
                    ELSE 0
                END -- When we have substantial data
                ELSE CASE
                    WHEN COALESCE(gm.like_count, 0) = 0
                    AND COALESCE(gm.total_plays, 0) = 0 THEN 1.0
                    WHEN COALESCE(gm.like_count, 0) < 5
                    AND COALESCE(gm.total_plays, 0) < 10 THEN 0.5
                    ELSE 0
                END
            END
        ),
        0
    ) AS fair_trending_score,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id',
                t.id,
                'name',
                t.name
            )
        ) FILTER (
            WHERE
                t.id IS NOT NULL
        ),
        '[]' :: json
    ) as tags
FROM
    game_metrics gm
    LEFT JOIN game_tag_votes gtv ON gm.id = gtv.game_id
    LEFT JOIN tags t ON gtv.tag_id = t.id
GROUP BY
    gm.id,
    gm.name,
    gm.thumbnail,
    gm.created_at,
    gm.like_count,
    gm.total_plays,
    gm.unique_players,
    gm.days_old,
    gm.games_with_engagement,
    gm.total_games
ORDER BY
    fair_trending_score DESC;