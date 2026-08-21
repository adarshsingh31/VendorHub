import express from "express";
import protect, { adminOnly } from "../middleware/authMiddleware.js";
import {
  getAdminSellers,
  getAdminSellerById,
  updateAdminSellerStatus,
  deleteAdminSeller,
} from "../controllers/adminSellerController.js";

const router = express.Router();

// All routes below require: valid JWT (protect) + admin role (adminOnly)
router.use(protect, adminOnly);

/**
 * GET /api/admin/sellers
 * List all sellers (Active, Suspended, Pending, Rejected)
 */
router.get("/", getAdminSellers);

/**
 * GET /api/admin/sellers/:id
 * Get single seller details (Info, Store Profile, Business Stats, Recent items)
 */
router.get("/:id", getAdminSellerById);

/**
 * PATCH /api/admin/sellers/:id/status
 * Update seller status (active/suspended)
 */
router.patch("/:id/status", updateAdminSellerStatus);

/**
 * DELETE /api/admin/sellers/:id
 * Delete a seller completely
 */
router.delete("/:id", deleteAdminSeller);

export default router;
