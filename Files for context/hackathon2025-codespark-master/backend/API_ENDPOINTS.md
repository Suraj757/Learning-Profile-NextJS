# API Endpoints Documentation

This document provides a comprehensive overview of all available API endpoints in the backend service.

## Base URL

All API endpoints are prefixed with `/api`

## Authentication

Currently, the API uses a simple user identification system. Users are identified by username and assigned a unique ID.

---

## Health & Status Endpoints

### GET `/`

**Description**: Basic server status check

**Response**:

```json
{
  "message": "Express server is running!",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### GET `/health`

**Description**: Health check endpoint

**Response**:

```json
{
  "status": "OK",
  "uptime": 123.456,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET `/health/db`

**Description**: Database health check

**Response**:

```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET `/api/test`

**Description**: API test endpoint

**Response**:

```json
{
  "message": "API endpoint is working!",
  "data": {
    "userAgent": "Mozilla/5.0...",
    "method": "GET",
    "url": "/api/test"
  }
}
```

---

## User Management

### POST `/api/users/identify`

**Description**: Identify or create a user by username

**Request Payload**:

```json
{
  "username": "string"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "username": "string"
  }
}
```

**Error Response** (400):

```json
{
  "success": false,
  "error": "Username is required"
}
```

---

## Games

### GET `/api/games`

**Description**: List all games with their tags

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Game Name",
      "description": "Game description",
      "release_date": "2024-01-01",
      "play_count": 100,
      "like_count": 50,
      "thumbnail": "url/to/thumbnail.jpg",
      "tags": [
        {
          "id": 1,
          "name": "Action"
        }
      ]
    }
  ],
  "count": 1
}
```

### GET `/api/games/:id`

**Description**: Get a single game by ID

**URL Parameters**:

- `id`: ID of the game

**Response**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Game Name",
    "description": "Game description",
    "release_date": "2024-01-01",
    "play_count": 100,
    "like_count": 50,
    "thumbnail": "url/to/thumbnail.jpg",
    "tags": [
      {
        "id": 1,
        "name": "Action"
      }
    ]
  }
}
```

**Error Responses**:

- **404**: Game not found

### POST `/api/games/:id/play`

**Description**: Record that a user played a game

**URL Parameters**:

- `id`: ID of the game

**Request Payload**:

```json
{
  "userId": "uuid"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "gameId": "game-id",
    "gameName": "Game Name",
    "userId": "user-uuid",
    "username": "username",
    "playCount": 5,
    "lastPlayedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:

- **400**: User ID is required
- **404**: Game or user not found

### GET `/api/games/plays/:userId`

**Description**: Get play statistics for a user

**URL Parameters**:

- `userId`: ID of the user

**Response**:

```json
{
  "success": true,
  "data": {
    "userId": "user-uuid",
    "username": "username",
    "totalGamesPlayed": 10,
    "totalPlays": 25,
    "plays": [
      {
        "id": "game-id",
        "name": "Game Name",
        "thumbnail": "url/to/thumbnail.jpg",
        "play_count": 5,
        "last_played_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses**:

- **404**: User not found

---

## Likes

### POST `/api/likes`

**Description**: Like a game

**Request Payload**:

```json
{
  "userId": 1,
  "gameId": 1
}
```

**Response**:

```json
{
  "success": true,
  "message": "Game liked successfully"
}
```

**Error Responses**:

- **400**: Missing required fields
- **404**: User or game not found

### DELETE `/api/likes`

**Description**: Unlike a game

**Request Payload**:

```json
{
  "userId": 1,
  "gameId": 1
}
```

**Response**:

```json
{
  "success": true,
  "message": "Game unliked successfully"
}
```

**Error Responses**:

- **400**: Missing required fields
- **404**: Like not found

---

## Tags

### GET `/api/tags`

**Description**: List all tags with game counts

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Action",
      "game_count": 10
    }
  ],
  "count": 1
}
```

### POST `/api/tags/game`

**Description**: Add a tag to a game

**Request Payload**:

```json
{
  "userId": 1,
  "tagId": 1
}
```

**Query Parameters**:

- `gameId`: ID of the game to tag

**Response**:

```json
{
  "success": true,
  "message": "Tag added to game successfully"
}
```

**Error Responses**:

- **400**: Missing required fields
- **404**: User, tag, or game not found

### DELETE `/api/tags/game`

**Description**: Remove a tag from a game

**Request Payload**:

```json
{
  "userId": 1,
  "tagId": 1
}
```

**Query Parameters**:

- `gameId`: ID of the game to untag

**Response**:

```json
{
  "success": true,
  "message": "Tag removed from game successfully"
}
```

**Error Responses**:

- **400**: Missing required fields
- **404**: Tag vote not found

### GET `/api/tags/user/:userId`

**Description**: Get tags for a specific user, including tags they've added and tags from games they've interacted with

**URL Parameters**:

- `userId`: ID of the user

**Response**:

```json
{
  "success": true,
  "data": {
    "userAddedTags": [
      {
        "id": 1,
        "name": "Action",
        "description": "Action-packed gameplay",
        "category": "genre",
        "games_tagged": 5,
        "game_ids": ["game1", "game2", "game3"]
      }
    ],
    "userInteractionTags": [
      {
        "id": 2,
        "name": "Puzzle",
        "description": "Puzzle elements",
        "category": "gameplay",
        "games_with_tag": 3,
        "game_ids": ["game4", "game5", "game6"],
        "interaction_type": "liked"
      }
    ],
    "summary": {
      "totalUserAddedTags": 1,
      "totalInteractionTags": 1,
      "totalUniqueTags": 2
    }
  }
}
```

**Error Responses**:

- **404**: User not found
- **500**: Internal server error

---

## Recommendations

### GET `/api/recommendations`

**Description**: Get recommended games based on popularity and recent activity

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Game Name",
      "description": "Game description",
      "release_date": "2024-01-01",
      "play_count": 100,
      "like_count": 50,
      "thumbnail": "url/to/thumbnail.jpg",
      "tags": [
        {
          "id": 1,
          "name": "Action"
        }
      ],
      "recommendation_score": 85.5
    }
  ],
  "count": 1
}
```

### GET `/api/recommendations/new`

**Description**: Get new games (recently released or added)

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Game Name",
      "description": "Game description",
      "release_date": "2024-01-01",
      "play_count": 100,
      "like_count": 50,
      "thumbnail": "url/to/thumbnail.jpg",
      "tags": [
        {
          "id": 1,
          "name": "Action"
        }
      ]
    }
  ],
  "count": 1
}
```

### GET `/api/recommendations/user/:userId`

**Description**: Get personalized recommendations for a specific user

**URL Parameters**:

- `userId`: ID of the user

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Game Name",
      "description": "Game description",
      "release_date": "2024-01-01",
      "play_count": 100,
      "like_count": 50,
      "thumbnail": "url/to/thumbnail.jpg",
      "tags": [
        {
          "id": 1,
          "name": "Action"
        }
      ],
      "matching_tags": 3,
      "recommendation_score": 85.5
    }
  ],
  "count": 1
}
```

**Error Responses**:

- **400**: Missing userId parameter
- **404**: User not found

---

## Error Handling

All endpoints return consistent error responses with the following structure:

```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message (in development)"
}
```

Common HTTP status codes:

- **200**: Success
- **400**: Bad Request (missing required fields)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

---

## Data Models

### Game Object

```json
{
  "id": "number",
  "name": "string",
  "description": "string",
  "release_date": "string (YYYY-MM-DD)",
  "play_count": "number",
  "like_count": "number",
  "thumbnail": "string (URL)",
  "tags": "array of tag objects"
}
```

### Tag Object

```json
{
  "id": "number",
  "name": "string"
}
```

### User Object

```json
{
  "userId": "number",
  "username": "string"
}
```
