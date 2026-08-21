import express from "express";
import protect, { adminOnly } from "../middleware/authMiddleware.js";
import {
  getAdminUsers,
  getAdminUserById,
  updateAdminUserStatus,
  deleteAdminUser,
} from "../controllers/adminUserController.js";

const router = express.Router();

// All routes below require: valid JWT (protect) + admin role (adminOnly)
router.use(protect, adminOnly);

/**
 * GET /api/admin/users
 * List all users (buyers), paginated and filterable
 */
router.get("/", getAdminUsers);

/**
 * GET /api/admin/users/:id
 * Get single user details and their order statistics
 */
router.get("/:id", getAdminUserById);

/**
 * PATCH /api/admin/users/:id/status
 * Update user status (active/suspended)
 */
router.patch("/:id/status", updateAdminUserStatus);

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */
router.delete("/:id", deleteAdminUser);

export default router;
