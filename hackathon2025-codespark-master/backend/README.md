# Backend Express Server

A simple Express.js server boilerplate for the hackathon project with PostgreSQL database.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (optional):

```bash
# Copy this content to .env file
PORT=3001
NODE_ENV=development
DB_USER=hackathon_user
DB_HOST=localhost
DB_NAME=hackathon_db
DB_PASSWORD=hackathon_password
DB_PORT=5432
```

3. Start the PostgreSQL database:

```bash
npm run db:start
```

## Available Commands

### Start the server

```bash
npm start
```

### Start in development mode (with auto-reload)

```bash
npm run dev
```

### Database commands

```bash
# Start PostgreSQL container
npm run db:start

# Stop PostgreSQL container
npm run db:stop

# Reset database (removes all data and restarts)
npm run db:reset
```

## Server Endpoints

- `GET /` - Basic server info
- `GET /health` - Health check endpoint
- `GET /health/db` - Database health check endpoint
- `GET /api/test` - Test API endpoint
- `*` - 404 handler for unknown routes

## Database Setup

The PostgreSQL database is configured with:

- **Database**: `hackathon_db`
- **User**: `hackathon_user`
- **Password**: `hackathon_password`
- **Port**: `5432`

### Database Schema

The database includes sample tables:

- `users` - User management
- `projects` - Project management

## Validation

To validate the server is starting correctly:

1. Start the database: `npm run db:start`
2. Start the server: `npm start`
3. Check the console output for startup messages
4. Test the health endpoint: `curl http://localhost:3001/health`
5. Test the database health: `curl http://localhost:3001/health/db`
6. Test the API endpoint: `curl http://localhost:3001/api/test`

## Features

- ✅ Express.js server
- ✅ CORS enabled
- ✅ JSON body parsing
- ✅ Environment variable support
- ✅ Health check endpoint
- ✅ Database health check endpoint
- ✅ Error handling middleware
- ✅ Graceful shutdown
- ✅ Development mode with nodemon
- ✅ PostgreSQL database with Docker Compose
- ✅ Database connection pooling
- ✅ Sample database schema
