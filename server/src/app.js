import express from "express";
import cors from "cors";
import multer from "multer";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// CORS Middleware — supports comma-separated CLIENT_URL list for multiple dev ports
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  }),
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "You can upload up to 5 product images.",
      });
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Each image must be 5MB or smaller.",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Invalid image upload.",
    });
  }

  return next();
});

// Test Route
app.get("/", (req, res) => {
  res.send("VendorHub Backend Running...");
});

export default app;
