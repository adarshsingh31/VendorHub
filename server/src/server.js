import "./config/env.js";

// ─── Validate critical environment variables at startup ───────────────────────
// This prevents the server from silently starting with a missing secret,
// which would cause confusing auth failures at runtime instead of a clear crash.
const REQUIRED_ENV_VARS = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error("❌ FATAL: Missing required environment variables:");
  missingVars.forEach((v) => console.error(`   - ${v}`));
  console.error("Please set them in your .env file and restart the server.");
  process.exit(1);
}

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Connect Database then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running in ${NODE_ENV} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err.message);
    process.exit(1);
  });

// Handle unhandled promise rejections gracefully
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});
