import express from "express";
import { signup, login, googleAuth, setPassword, changePassword } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── Public Routes (no auth required) ────────────────────────────────────────

router.post("/signup", signup);
router.post("/login", login);

// POST /api/auth/google — verifies a Google ID token and returns a VendorHub JWT
router.post("/google", googleAuth);

// POST /api/auth/set-password — allows authenticated users to set/update their password
// Protected: requires a valid JWT in the Authorization header
router.post("/set-password", protect, setPassword);

// PUT /api/auth/change-password — change password for users who already have one
router.put("/change-password", protect, changePassword);


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
