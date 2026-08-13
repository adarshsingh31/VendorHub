import express from "express";
import {
  createProduct,
  getSellerProducts,
  getProductById,
} from "../controllers/productController.js";
import protect from "../middleware/authMiddleware.js";
import { sellerOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, sellerOnly, createProduct);
router.get("/seller", protect, sellerOnly, getSellerProducts);
router.get("/:id", getProductById);

export default router;
