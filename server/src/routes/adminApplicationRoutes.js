import express from "express";
import protect, { adminOnly } from "../middleware/authMiddleware.js";
import {
  getAllApplications,
  approveApplication,
  rejectApplication,
} from "../controllers/sellerApplicationController.js";

const router = express.Router();

// All routes below require: valid JWT (protect) + admin role (adminOnly)
// A buyer or seller hitting these endpoints receives 403 Forbidden.

/**
 * GET /api/admin/seller-applications
 * List all seller applications (newest first), populated with user details.
 */
router.get("/seller-applications", protect, adminOnly, getAllApplications);

/**
 * PATCH /api/admin/seller-applications/:id/approve
 * Approve an application → user.role becomes 'seller', fresh JWT returned.
 */
router.patch(
  "/seller-applications/:id/approve",
  protect,
  adminOnly,
  approveApplication
);

/**
 * PATCH /api/admin/seller-applications/:id/reject
 * Reject an application with an optional adminNote reason.
 */
router.patch(
  "/seller-applications/:id/reject",
  protect,
  adminOnly,
  rejectApplication
);

export default router;
