import express from "express";
import {
  createProduct,
  getSellerProducts,
  getProductById,
  updateProduct,
  getAllProducts,
} from "../controllers/productController.js";
import protect from "../middleware/authMiddleware.js";
import { sellerOnly } from "../middleware/roleMiddleware.js";
import { uploadProductImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getAllProducts);
router.post("/", protect, sellerOnly, uploadProductImages, createProduct);
router.get("/seller", protect, sellerOnly, getSellerProducts);
router.put("/:id", protect, sellerOnly, uploadProductImages, updateProduct);
router.get("/:id", getProductById);

export default router;
