import mongoose from "mongoose";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import StoreProfile from "../models/StoreProfile.js";

/**
 * GET /api/admin/products
 * Get paginated, searchable, filterable list of all products.
 */
export const getAdminProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const search = req.query.search || "";
    const category = req.query.category || "all";
    const seller = req.query.seller || "all";
    const status = req.query.status || "all";
    const stockStatus = req.query.stock || "all"; // all, instock, lowstock, outofstock
    const sort = req.query.sort || "newest";

    const matchStage = {};

    // Basic filters
    if (category !== "all") matchStage.category = category;
    if (seller !== "all") matchStage.seller = new mongoose.Types.ObjectId(seller);
    if (status !== "all") matchStage.status = status;

    // Search filter (Product Name, SKU)
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    // Stock Filter
    if (stockStatus !== "all") {
      if (stockStatus === "outofstock") {
        matchStage.stock = 0;
      } else if (stockStatus === "instock") {
        matchStage.stock = { $gt: 0 };
      } else if (stockStatus === "lowstock") {
        matchStage.$expr = {
          $and: [
            { $gt: ["$stock", 0] },
            { $lte: ["$stock", "$lowStockThreshold"] },
          ],
        };
      }
    }

    // Sorting setup
    let sortStage = {};
    switch (sort) {
      case "oldest":
        sortStage = { createdAt: 1 };
        break;
      case "priceAsc":
        sortStage = { price: 1 };
        break;
      case "priceDesc":
        sortStage = { price: -1 };
        break;
      case "salesDesc":
        sortStage = { totalSales: -1 };
        break;
      case "ratingDesc":
        sortStage = { avgRating: -1 };
        break;
      case "newest":
      default:
        sortStage = { createdAt: -1 };
        break;
    }

    // Determine summary stats before pagination
    const summaryAgg = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          outOfStock: {
            $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] },
          },
          lowStock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$stock", 0] },
                    { $lte: ["$stock", "$lowStockThreshold"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const stats = summaryAgg.length > 0
      ? summaryAgg[0]
      : { total: 0, active: 0, outOfStock: 0, lowStock: 0 };

    // Total filtered count
    const totalPipeline = [{ $match: matchStage }, { $count: "total" }];
    const totalResult = await Product.aggregate(totalPipeline);
    const totalFiltered = totalResult.length > 0 ? totalResult[0].total : 0;

    // Aggregation for items
    const pipeline = [
      { $match: matchStage },
      // Lookup Seller
      {
        $lookup: {
          from: "users",
          localField: "seller",
          foreignField: "_id",
          as: "sellerObj",
        },
      },
      {
        $lookup: {
          from: "storeprofiles",
          localField: "seller",
          foreignField: "seller",
          as: "storeProfile",
        },
      },
      {
        $addFields: {
          sellerObj: { $arrayElemAt: ["$sellerObj", 0] },
          storeProfile: { $arrayElemAt: ["$storeProfile", 0] },
        },
      },
      // Lookup Sales
      {
        $lookup: {
          from: "orders",
          let: { productId: "$_id" },
          pipeline: [
            { $match: { paymentStatus: "paid" } },
            { $unwind: "$items" },
            { $match: { $expr: { $eq: ["$items.product", "$$productId"] } } },
            { $group: { _id: null, totalSold: { $sum: "$items.quantity" } } },
          ],
          as: "salesInfo",
        },
      },
      // Lookup Reviews
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviewsList",
        },
      },
      {
        $addFields: {
          totalSales: {
            $ifNull: [{ $arrayElemAt: ["$salesInfo.totalSold", 0] }, 0],
          },
          reviewCount: { $size: "$reviewsList" },
          avgRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviewsList" }, 0] },
              then: { $avg: "$reviewsList.rating" },
              else: 0,
            },
          },
        },
      },
      { $sort: sortStage },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          reviewsList: 0,
          salesInfo: 0,
          "sellerObj.password": 0,
        },
      },
    ];

    const products = await Product.aggregate(pipeline);

    res.status(200).json({
      success: true,
      products,
      stats,
      total: totalFiltered,
      page,
      pages: Math.ceil(totalFiltered / limit),
    });
  } catch (error) {
    console.error("Admin Get Products Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/products/filters
 * Returns distinct categories and list of all sellers for the filter dropdowns.
 */
export const getAdminProductFilters = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    const sellers = await User.find({ role: "seller" })
      .select("name _id")
      .lean();
    
    // Attempt to merge store names
    const storeProfiles = await StoreProfile.find().select("seller storeName").lean();
    const storeMap = storeProfiles.reduce((acc, curr) => {
      acc[curr.seller.toString()] = curr.storeName;
      return acc;
    }, {});

    const mappedSellers = sellers.map((s) => ({
      _id: s._id,
      name: storeMap[s._id.toString()] || s.name,
    }));

    res.status(200).json({
      success: true,
      categories,
      sellers: mappedSellers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/products/:id
 * Get single product details, including performance stats, recent orders, and reviews.
 */
export const getAdminProductById = async (req, res) => {
  try {
    const productId = new mongoose.Types.ObjectId(req.params.id);

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const seller = await User.findById(product.seller).select("name email status avatar").lean();
    const storeProfile = await StoreProfile.findOne({ seller: product.seller }).select("storeName").lean();

    // Stats
    const orders = await Order.aggregate([
      { $match: { paymentStatus: "paid", "items.product": productId } },
      { $unwind: "$items" },
      { $match: { "items.product": productId } },
    ]);

    let unitsSold = 0;
    let revenueGenerated = 0;
    let cancelledUnits = 0;

    orders.forEach((row) => {
      if (row.items.itemStatus === "cancelled") {
        cancelledUnits += row.items.quantity;
      } else {
        unitsSold += row.items.quantity;
        revenueGenerated += row.items.quantity * row.items.price;
      }
    });

    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .populate("buyer", "name")
      .lean();

    const avgRating = reviews.length > 0 
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length) 
      : 0;

    // Recent orders to display
    const recentOrders = await Order.find({ "items.product": productId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name")
      .lean();

    const mappedRecentOrders = recentOrders.map(order => {
      const pItems = order.items.filter(i => i.product.toString() === productId.toString());
      const pTotal = pItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
      const pQuantity = pItems.reduce((acc, i) => acc + i.quantity, 0);
      return {
        _id: order._id,
        createdAt: order.createdAt,
        buyerName: order.user ? order.user.name : "Guest",
        totalAmount: pTotal,
        quantity: pQuantity,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      };
    });

    res.status(200).json({
      success: true,
      product: {
        ...product,
        seller: {
          ...seller,
          storeName: storeProfile?.storeName,
        },
        performance: {
          unitsSold,
          revenueGenerated,
          cancelledUnits,
          totalOrders: new Set(orders.map(o => o._id.toString())).size,
          avgRating,
          totalReviews: reviews.length,
        },
        recentOrders: mappedRecentOrders,
        recentReviews: reviews.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("Admin Get Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/admin/products/:id/status
 * Update product status (active, inactive, blocked)
 */
export const updateAdminProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive", "blocked", "draft"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/admin/products/:id
 * Hard delete a product and its associated reviews.
 */
export const deleteAdminProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Delete associated reviews
    await Review.deleteMany({ product: productId });

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
