import express from "express";
import {
  getCategories,
  getNewArrivals,
  getTrending,
  getDeals,
  getRecommended,
  getFeaturedSellers,
  getBanners,
} from "../controllers/homeController.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/new-arrivals", getNewArrivals);
router.get("/trending", getTrending);
router.get("/deals", getDeals);
router.get("/recommended", getRecommended);
router.get("/featured-sellers", getFeaturedSellers);
router.get("/banners", getBanners);

export default router;
