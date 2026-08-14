import express from "express";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
} from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// Address management routes
router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.get("/addresses/default", getDefaultAddress);
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);
router.put("/addresses/:addressId/default", setDefaultAddress);

export default router;
