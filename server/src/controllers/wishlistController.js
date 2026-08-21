import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

// @route   GET /api/wishlist
// @desc    Get user wishlist
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
      path: "products",
      populate: { path: "seller", select: "name storeName" }
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    return res.status(200).json({ success: true, wishlist });
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @route   POST /api/wishlist/:productId
// @desc    Toggle product in wishlist (add if not exists, remove if exists)
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    const index = wishlist.products.indexOf(productId);
    if (index > -1) {
      // Remove
      wishlist.products.splice(index, 1);
    } else {
      // Add
      wishlist.products.push(productId);
    }

    await wishlist.save();
    
    await wishlist.populate({
      path: "products",
      populate: { path: "seller", select: "name storeName" }
    });

    return res.status(200).json({ success: true, wishlist });
  } catch (error) {
    console.error("Toggle Wishlist Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
