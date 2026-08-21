import StoreProfile from "../models/StoreProfile.js";
import cloudinary from "../config/cloudinary.js";

const uploadImageToCloudinary = async (file) => {
  if (!file || !file.buffer) {
    throw new Error("Image buffer is missing.");
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "vendorhub/store",
        resource_type: "image",
      },
      (error, uploadResult) => {
        if (error) {
          return reject(error);
        }
        resolve(uploadResult);
      },
    );
    stream.end(file.buffer);
  });

  return result.secure_url;
};

/**
 * GET /api/seller/store-settings
 * Returns the authenticated seller's store profile. Creates a default one if it doesn't exist.
 */
export const getStoreSettings = async (req, res) => {
  try {
    const sellerId = req.user.id;
    let profile = await StoreProfile.findOne({ seller: sellerId });

    if (!profile) {
      profile = await StoreProfile.create({ seller: sellerId });
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("Get store settings error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * PATCH /api/seller/store-settings
 * Updates the authenticated seller's store profile.
 */
export const updateStoreSettings = async (req, res) => {
  try {
    const sellerId = req.user.id;
    
    // Process form data fields (which come as strings because of FormData)
    const updates = { ...req.body };
    
    // Parse nested objects/arrays if they were stringified in FormData
    if (updates.location && typeof updates.location === 'string') {
      try { updates.location = JSON.parse(updates.location); } catch (e) {}
    }
    if (updates.businessHours && typeof updates.businessHours === 'string') {
      try { updates.businessHours = JSON.parse(updates.businessHours); } catch (e) {}
    }
    if (updates.notificationPreferences && typeof updates.notificationPreferences === 'string') {
      try { updates.notificationPreferences = JSON.parse(updates.notificationPreferences); } catch (e) {}
    }

    // Handle booleans that might come as strings
    const boolFields = ['shippingEnabled', 'autoConfirmOrders', 'allowCustomerCancellation'];
    boolFields.forEach(f => {
      if (updates[f] === 'true') updates[f] = true;
      if (updates[f] === 'false') updates[f] = false;
    });

    // Handle numbers
    if (updates.shippingFee) updates.shippingFee = Number(updates.shippingFee);
    if (updates.freeShippingThreshold) updates.freeShippingThreshold = Number(updates.freeShippingThreshold);
    if (updates.processingTime) updates.processingTime = Number(updates.processingTime);

    // Prevent overwriting the seller reference or ID
    delete updates._id;
    delete updates.seller;
    
    // Simple slug uniqueness check if provided
    if (updates.storeSlug) {
      const existing = await StoreProfile.findOne({ storeSlug: updates.storeSlug, seller: { $ne: sellerId } });
      if (existing) {
        return res.status(400).json({ success: false, message: "Store URL/slug is already taken." });
      }
    }

    // Process image uploads
    if (req.files) {
      if (req.files.logo && req.files.logo.length > 0) {
        updates.storeLogo = await uploadImageToCloudinary(req.files.logo[0]);
      }
      if (req.files.banner && req.files.banner.length > 0) {
        updates.storeBanner = await uploadImageToCloudinary(req.files.banner[0]);
      }
    }

    const profile = await StoreProfile.findOneAndUpdate(
      { seller: sellerId },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Settings updated successfully", profile });
  } catch (error) {
    console.error("Update store settings error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
