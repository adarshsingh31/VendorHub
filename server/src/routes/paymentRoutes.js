import express from "express";

import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/paymentController.js";
import protect, { adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/payment/create-order
 * Authenticated buyer → fetches cart, creates Razorpay order.
 * Returns { razorpayOrderId, amount, keyId } — secret stays on server.
 */
router.post("/create-order", protect, createOrder);

/**
 * POST /api/payment/verify
 * Verifies Razorpay HMAC signature on the backend.
 * Only creates the Order and clears the Cart after successful verification.
 */
router.post("/verify", protect, verifyPayment);

/**
 * GET /api/payment/orders
 * Returns the authenticated user's order history.
 */
router.get("/orders", protect, getMyOrders);

/**
 * GET /api/payment/admin/orders
 * Returns all platform orders for admins.
 */
router.get("/admin/orders", protect, adminOnly, getAllOrders);

/**
 * PUT /api/payment/admin/orders/:id/status
 * Updates the orderStatus.
 */
router.put("/admin/orders/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
