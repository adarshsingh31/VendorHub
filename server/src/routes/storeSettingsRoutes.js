import express from "express";
import protect from "../middleware/authMiddleware.js";
import { uploadStoreImages } from "../middleware/uploadMiddleware.js";
import { getStoreSettings, updateStoreSettings } from "../controllers/storeSettingsController.js";

const router = express.Router();

router.use(protect);

router.get("/", getStoreSettings);
router.patch("/", uploadStoreImages, updateStoreSettings);

export default router;
