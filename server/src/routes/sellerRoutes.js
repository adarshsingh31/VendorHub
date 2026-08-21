import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  submitApplication,
  getMyApplication,
} from "../controllers/sellerApplicationController.js";

const router = express.Router();

// ─── Buyer Routes (JWT required, any authenticated buyer) ─────────────────────

/**
 * POST /api/seller/apply
 * Submit a new seller application.
 * Blocked if a pending application already exists for this user.
 */
router.post("/apply", protect, submitApplication);

/**
 * GET /api/seller/application
 * Retrieve the current user's latest seller application (or null).
 */
router.get("/application", protect, getMyApplication);

export default router;
