import express from "express";
import { getWishlist, toggleWishlist } from "../controllers/wishlistController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getWishlist);
router.post("/:productId", toggleWishlist);
router.delete("/:productId", toggleWishlist); // Optionally alias delete to toggle for RESTful semantics

export default router;
