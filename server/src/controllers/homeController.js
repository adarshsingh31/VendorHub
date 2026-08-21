import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Banner from "../models/Banner.js";

/**
 * GET /api/home/categories
 * Returns distinct active product categories with an icon mapping
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { status: "active" });
    
    // Map icons to categories
    const categoryData = categories.map(cat => {
      let icon = '📦';
      if (cat.toLowerCase().includes('electronic')) icon = '📱';
      if (cat.toLowerCase().includes('fashion') || cat.toLowerCase().includes('cloth')) icon = '👗';
      if (cat.toLowerCase().includes('home')) icon = '🏺';
      if (cat.toLowerCase().includes('beauty')) icon = '💄';
      if (cat.toLowerCase().includes('grocer') || cat.toLowerCase().includes('food')) icon = '🥭';
      if (cat.toLowerCase().includes('toy')) icon = '🧸';
      if (cat.toLowerCase().includes('sport')) icon = '🏸';
      if (cat.toLowerCase().includes('book')) icon = '📚';
      return { id: cat, label: cat, icon };
    });

    return res.status(200).json({ success: true, categories: categoryData });
  } catch (error) {
    console.error("Get Categories Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/home/new-arrivals
 */
export const getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({ status: "active", stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("seller", "name avatar");
    
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Get New Arrivals Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/home/trending
 */
export const getTrending = async (req, res) => {
  try {
    // In a real app this might sort by views or sales. 
    // We'll sort by a mix or just recent + random
    const products = await Product.find({ status: "active", stock: { $gt: 0 } })
      .sort({ price: 1 }) // Just an example sort for "trending"
      .limit(8)
      .populate("seller", "name avatar");
    
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Get Trending Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/home/deals
 */
export const getDeals = async (req, res) => {
  try {
    const products = await Product.find({
      status: "active",
      stock: { $gt: 0 },
      originalPrice: { $gt: 0 },
      $expr: { $gt: ["$originalPrice", "$price"] }
    })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("seller", "name avatar");
    
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Get Deals Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

import jwt from "jsonwebtoken";

/**
 * GET /api/home/recommended
 * Uses user auth if available to find previously bought categories.
 */
export const getRecommended = async (req, res) => {
  try {
    let targetCategories = [];
    
    // Optional Auth: Check user's past orders if token is provided
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const orders = await Order.find({ user: decoded.userId }).populate("items.product");
        const categoryCounts = {};
        
        orders.forEach(order => {
          order.items.forEach(item => {
            if (item.product && item.product.category) {
              categoryCounts[item.product.category] = (categoryCounts[item.product.category] || 0) + 1;
            }
          });
        });
        
        // Sort categories by frequency
        targetCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]).slice(0, 3);
      } catch (err) {
        // Silently ignore auth errors for public route
      }
    }

    
    let query = { status: "active", stock: { $gt: 0 } };
    if (targetCategories.length > 0) {
      query.category = { $in: targetCategories };
    }
    
    let products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("seller", "name avatar");
      
    // If not enough recommended products, just pad with popular ones
    if (products.length < 4) {
      const moreProducts = await Product.find({ status: "active", stock: { $gt: 0 }, _id: { $nin: products.map(p => p._id) } })
        .limit(8 - products.length)
        .populate("seller", "name avatar");
      products = [...products, ...moreProducts];
    }

    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Get Recommended Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/home/featured-sellers
 */
export const getFeaturedSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" })
      .limit(6)
      .select("name avatar role createdAt");
      
    // Count products for each seller
    const sellersWithCounts = await Promise.all(sellers.map(async (seller) => {
      const productCount = await Product.countDocuments({ seller: seller._id, status: "active" });
      return {
        _id: seller._id,
        name: seller.name,
        avatar: seller.avatar,
        productCount,
        rating: (4 + Math.random()).toFixed(1) // Fake rating since User model lacks ratings
      };
    }));
    
    return res.status(200).json({ success: true, sellers: sellersWithCounts });
  } catch (error) {
    console.error("Get Featured Sellers Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/home/banners
 */
export const getBanners = async (req, res) => {
  try {
    const now = new Date();
    const banners = await Banner.find({
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: null },
        { startDate: { $lte: now } }
      ],
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    });
    
    return res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error("Get Banners Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
