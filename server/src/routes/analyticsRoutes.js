import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getAnalyticsOverview,
  getSalesChart,
  getOrderAnalytics,
  getProductAnalytics,
  getCustomerAnalytics,
  getInventoryAnalytics,
  getRecentActivity,
  getCategorySales,
  getDashboardSummary
} from "../controllers/analyticsController.js";

const router = express.Router();

router.use(protect);

router.get("/seller/overview", getAnalyticsOverview);
router.get("/seller/sales-chart", getSalesChart);
router.get("/seller/orders", getOrderAnalytics);
router.get("/seller/products", getProductAnalytics);
router.get("/seller/customers", getCustomerAnalytics);
router.get("/seller/inventory", getInventoryAnalytics);
router.get("/seller/recent-activity", getRecentActivity);
router.get("/seller/category-sales", getCategorySales);
router.get("/seller/dashboard", getDashboardSummary);

export default router;
