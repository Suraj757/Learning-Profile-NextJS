const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { testConnection } = require("./db");

// Import route modules
const {
  gamesRoutes,
  usersRoutes,
  likesRoutes,
  tagsRoutes,
  recommendationsRoutes,
} = require("./routes");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get("/", (req, res) => {
  res.json({
    message: "Express server is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Database health check endpoint
app.get("/health/db", async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.status(200).json({
      status: isConnected ? "OK" : "ERROR",
      database: isConnected ? "Connected" : "Disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "Error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes
app.use("/api/games", gamesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/tags", tagsRoutes);
app.use("/api/recommendations", recommendationsRoutes);

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "API endpoint is working!",
    data: {
      userAgent: req.get("User-Agent"),
      method: req.method,
      url: req.url,
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database health: http://localhost:${PORT}/health/db`);
  console.log(`🌐 API test: http://localhost:${PORT}/api/test`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);

  // Test database connection on startup
  await testConnection();
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

module.exports = app;
