import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getEarningsSummary,
  getEarningsTransactions,
  getProductPerformance,
  getEarningsChart,
} from "../controllers/earningsController.js";

const router = express.Router();

router.use(protect);

router.get("/seller/summary", getEarningsSummary);
router.get("/seller/transactions", getEarningsTransactions);
router.get("/seller/product-performance", getProductPerformance);
router.get("/seller/chart", getEarningsChart);

export default router;
