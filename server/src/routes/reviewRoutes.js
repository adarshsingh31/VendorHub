import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  submitReview,
  getSellerReviews,
  getProductReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

// Public route for product pages
router.get("/product/:productId", getProductReviews);

// Protected routes
router.use(protect);
router.post("/", submitReview);
router.get("/seller", getSellerReviews);

export default router;
