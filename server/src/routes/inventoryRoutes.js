import express from "express";
import protect from "../middleware/authMiddleware.js";
import { 
  getSellerInventory, 
  updateProductStock, 
  getProductInventoryHistory 
} from "../controllers/inventoryController.js";

const router = express.Router();

router.use(protect);

router.get("/seller", getSellerInventory);
router.patch("/seller/:productId", updateProductStock);
router.get("/seller/:productId/history", getProductInventoryHistory);

export default router;
