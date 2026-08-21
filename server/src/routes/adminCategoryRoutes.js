import express from "express";
import multer from "multer";
import protect, { adminOnly } from "../middleware/authMiddleware.js";
import {
  getPublicCategories,
  getAdminCategories,
  getAdminCategoryById,
  createAdminCategory,
  updateAdminCategory,
  updateAdminCategoryStatus,
  deleteAdminCategory,
  moveAdminCategoryProducts,
} from "../controllers/adminCategoryController.js";

const router = express.Router();

// Multer — memory storage for Cloudinary upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// ─── Public Route ──────────────────────────────────────────────────────────────
// Used by seller product forms + buyer storefront — no auth required
router.get("/public", getPublicCategories);

// ─── Admin Routes (protect + adminOnly) ───────────────────────────────────────
router.use(protect, adminOnly);

router.get("/", getAdminCategories);
router.get("/:id", getAdminCategoryById);
router.post("/", upload.single("image"), createAdminCategory);
router.patch("/:id", upload.single("image"), updateAdminCategory);
router.patch("/:id/status", updateAdminCategoryStatus);
router.delete("/:id", deleteAdminCategory);
router.patch("/:id/move-products", moveAdminCategoryProducts);

export default router;
