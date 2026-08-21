import express from "express";
import protect, { adminOnly } from "../middleware/authMiddleware.js";
import {
  getAdminProducts,
  getAdminProductFilters,
  getAdminProductById,
  updateAdminProductStatus,
  deleteAdminProduct,
} from "../controllers/adminProductController.js";

const router = express.Router();

router.use(protect, adminOnly);

/**
 * GET /api/admin/products
 * List all products with advanced filtering and aggregates
 */
router.get("/", getAdminProducts);

/**
 * GET /api/admin/products/filters
 * Get distinct categories and sellers for filter dropdowns
 */
router.get("/filters", getAdminProductFilters);

/**
 * GET /api/admin/products/:id
 * Get single product details, stats, orders, and reviews
 */
router.get("/:id", getAdminProductById);

/**
 * PATCH /api/admin/products/:id/status
 * Update product status (active, inactive, blocked)
 */
router.patch("/:id/status", updateAdminProductStatus);

/**
 * DELETE /api/admin/products/:id
 * Hard delete product and associated reviews
 */
router.delete("/:id", deleteAdminProduct);

export default router;
