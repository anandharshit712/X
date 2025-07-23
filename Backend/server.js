const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const envPath = path.join(__dirname, ".env");
require("dotenv").config({ path: envPath });

const authRoutes = require("./routes/auth");

const { testAllConnections, initializeDatabase } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files for uploaded images
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "EngageX User Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: "The requested endpoint does not exist",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test all database connections
    await testAllConnections();

    // Initialize database tables
    await initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 EngageX User Backend running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔗 API Documentation: http://localhost:${PORT}/api/health`);
      console.log(
        `🗄️  Available databases: dashboard, offerwall, emailing, engagex`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
