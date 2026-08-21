import express from "express";
import protect, { adminOnly } from "../middleware/authMiddleware.js";
import {
  getReportsOverview,
  getRevenueReport,
  getOrdersReport,
  getSellersReport,
  getProductsReport,
  getCategoriesReport,
  getCustomersReport,
  getPaymentsReport,
  getRefundsReport,
  getReviewsReport,
  exportReport
} from "../controllers/adminReportController.js";

const router = express.Router();

// Admin protection for all routes
router.use(protect, adminOnly);

router.get("/overview", getReportsOverview);
router.get("/revenue", getRevenueReport);
router.get("/orders", getOrdersReport);
router.get("/sellers", getSellersReport);
router.get("/products", getProductsReport);
router.get("/categories", getCategoriesReport);
router.get("/customers", getCustomersReport);
router.get("/payments", getPaymentsReport);
router.get("/refunds", getRefundsReport);
router.get("/reviews", getReviewsReport);
router.get("/export", exportReport);

export default router;
