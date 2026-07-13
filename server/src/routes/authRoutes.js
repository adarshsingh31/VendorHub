import express from "express";
import { signup, login } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── Public Routes (no auth required) ────────────────────────────────────────

router.post("/signup", signup);
router.post("/login", login);

// ─── Protected Routes (JWT required) ─────────────────────────────────────────

/**
 * GET /api/auth/vendor-dashboard
 *
 * A secured route example.
 * The 'protect' middleware runs first:
 *   - Valid token  → attaches req.user, calls next() → handler runs
 *   - Invalid token → returns 401, handler never runs
 */
router.get("/vendor-dashboard", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to VendorHub dashboard!",
    // req.user is populated by the protect middleware
    user: req.user, // { id, email, role }
  });
});

export default router;
