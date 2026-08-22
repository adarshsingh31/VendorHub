import express from "express";
import cors from "cors";
import multer from "multer";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import adminApplicationRoutes from "./routes/adminApplicationRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import adminSellerRoutes from "./routes/adminSellerRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import adminCategoryRoutes from "./routes/adminCategoryRoutes.js";
import adminReportRoutes from "./routes/adminReportRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import earningsRoutes from "./routes/earningsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import storeSettingsRoutes from "./routes/storeSettingsRoutes.js";

const app = express();

// ─── Production Middlewares & Security ────────────────────────────────────────

// 1. Set Security HTTP Headers
app.use(helmet());

// 2. Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// 3. CORS
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // In production, we might want to be strict and disallow no-origin requests
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  }),
);

// 4. Rate Limiting (100 requests per 10 mins per IP)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 10 minutes.",
  },
});
// app.use("/api", limiter); // Disabled during development to prevent 429 Too Many Requests errors

// 5. Body Parsers (with size limits)
app.use(express.json({ limit: "10kb" })); // Body limit is 10kb
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 6. Data Sanitization against NoSQL Query Injection
//app.use(mongoSanitize());

// 7. Data Sanitization against XSS
app.use(xss());

// 8. Prevent Parameter Pollution
app.use(hpp());

// 9. Response Compression
app.use(compression());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminApplicationRoutes);
app.use("/api/admin", adminDashboardRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/sellers", adminSellerRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/reports", adminReportRoutes);
app.use("/api/categories", adminCategoryRoutes); // public route on same router
app.use("/api/payment", paymentRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/earnings", earningsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/seller/store-settings", storeSettingsRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "VendorHub API is running securely." });
});

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ success: false, message: "File too large. Max size is 5MB." });
    }
  }

  const statusCode = err.statusCode || 500;

  const errorResponse = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV !== "production") {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

export default app;
