import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getSellerOrders, getSellerOrderById, updateSellerOrderItemStatus, getProductSalesSummary, getProductSalesDetails } from "../controllers/orderController.js";

const router = express.Router();

// Seller Routes
router.get("/seller", protect, getSellerOrders);
router.get("/seller/product-sales", protect, getProductSalesSummary);
router.get("/seller/product-sales/:productId", protect, getProductSalesDetails);
router.get("/seller/:id", protect, getSellerOrderById);
router.patch("/seller/:id/item/:itemId/status", protect, updateSellerOrderItemStatus);

export default router;
