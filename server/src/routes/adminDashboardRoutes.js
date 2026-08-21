import express from "express";
import { getDashboardData } from "../controllers/adminDashboardController.js";
import protect, { adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getDashboardData);

export default router;
