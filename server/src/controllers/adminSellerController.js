import mongoose from "mongoose";
import User from "../models/User.js";
import StoreProfile from "../models/StoreProfile.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import SellerApplication from "../models/SellerApplication.js";

/**
 * GET /api/admin/sellers
 * Get paginated, searchable, filterable list of sellers (Active, Suspended, Pending, Rejected).
 */
export const getAdminSellers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const search = req.query.search || "";
    const statusFilter = req.query.status || "all"; // all, active, suspended, pending, rejected
    const sort = req.query.sort || "newest";
    const dateRange = req.query.dateRange || "all";

    // Date filtering
    let dateMatch = {};
    if (dateRange !== "all") {
      const now = new Date();
      let startDate = new Date();
      if (dateRange === "today") {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === "7days") {
        startDate.setDate(now.getDate() - 7);
      } else if (dateRange === "30days") {
        startDate.setDate(now.getDate() - 30);
      }
      dateMatch.createdAt = { $gte: startDate };
    }

    // Sort setup
    let sortObj = {};
    switch (sort) {
      case "oldest":
        sortObj = { createdAt: 1 };
        break;
      case "storeAsc":
        sortObj = { "storeProfile.storeName": 1 };
        break;
      case "storeDesc":
        sortObj = { "storeProfile.storeName": -1 };
        break;
      case "earnings":
        sortObj = { totalEarnings: -1 };
        break;
      case "orders":
        sortObj = { totalOrders: -1 };
        break;
      case "newest":
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    // Aggregation pipeline to get Unified Sellers
    const pipeline = [
      { $match: dateMatch },
      // Lookup SellerApplication
      {
        $lookup: {
          from: "sellerapplications",
          localField: "_id",
          foreignField: "user",
          as: "application",
        },
      },
      // Keep only those who are sellers OR have applied
      {
        $match: {
          $or: [{ role: "seller" }, { "application.0": { $exists: true } }],
        },
      },
      // Determine unified status
      {
        $addFields: {
          unifiedStatus: {
            $cond: {
              if: { $eq: ["$role", "seller"] },
              then: { $ifNull: ["$status", "active"] }, // active or suspended
              else: { $arrayElemAt: ["$application.status", -1] }, // pending or rejected (latest if multiple, though unique constraint usually prevents multiple pending)
            },
          },
          latestApplication: { $arrayElemAt: ["$application", -1] },
        },
      },
    ];

    // Status Filter
    if (statusFilter !== "all") {
      pipeline.push({
        $match: { unifiedStatus: statusFilter },
      });
    }

    // Lookup Store Profile (only for approved sellers)
    pipeline.push({
      $lookup: {
        from: "storeprofiles",
        localField: "_id",
        foreignField: "seller",
        as: "storeProfile",
      },
    });
    pipeline.push({
      $addFields: {
        storeProfile: { $arrayElemAt: ["$storeProfile", 0] },
      },
    });

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { "storeProfile.storeName": searchRegex },
            { phone: searchRegex },
            { "latestApplication.shopName": searchRegex },
          ],
        },
      });
    }

    // Calculate total matching documents before pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await User.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Apply pagination and sorting
    pipeline.push({ $sort: sortObj });
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    // Lookup Products Count
    pipeline.push({
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "seller",
        as: "products",
      },
    });

    // Lookup Orders for Earnings
    pipeline.push({
      $lookup: {
        from: "orders",
        let: { sellerId: "$_id" },
        pipeline: [
          { $match: { paymentStatus: "paid" } },
          { $unwind: "$items" },
          { $match: { $expr: { $eq: ["$items.seller", "$$sellerId"] } } },
          {
            $group: {
              _id: "$$sellerId",
              totalOrders: { $sum: 1 },
              totalEarnings: {
                $sum: { $multiply: ["$items.price", "$items.quantity"] },
              },
            },
          },
        ],
        as: "orderStats",
      },
    });

    pipeline.push({
      $addFields: {
        totalProducts: { $size: "$products" },
        totalOrders: {
          $ifNull: [{ $arrayElemAt: ["$orderStats.totalOrders", 0] }, 0],
        },
        totalEarnings: {
          $ifNull: [{ $arrayElemAt: ["$orderStats.totalEarnings", 0] }, 0],
        },
      },
    });

    pipeline.push({
      $project: {
        password: 0,
        resetPasswordToken: 0,
        resetPasswordExpire: 0,
        products: 0, // don't return full product list
        orderStats: 0,
      },
    });

    const sellers = await User.aggregate(pipeline);

    // Provide summary stats (total, active, pending, suspended)
    const summaryAgg = await User.aggregate([
      {
        $lookup: {
          from: "sellerapplications",
          localField: "_id",
          foreignField: "user",
          as: "application",
        },
      },
      {
        $match: {
          $or: [{ role: "seller" }, { "application.0": { $exists: true } }],
        },
      },
      {
        $addFields: {
          unifiedStatus: {
            $cond: {
              if: { $eq: ["$role", "seller"] },
              then: { $ifNull: ["$status", "active"] },
              else: { $arrayElemAt: ["$application.status", -1] },
            },
          },
        },
      },
      {
        $group: {
          _id: "$unifiedStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      total: 0,
      active: 0,
      pending: 0,
      suspended: 0,
    };
    summaryAgg.forEach((s) => {
      stats.total += s.count;
      if (s._id === "active") stats.active = s.count;
      if (s._id === "pending") stats.pending = s.count;
      if (s._id === "suspended") stats.suspended = s.count;
    });

    res.status(200).json({
      success: true,
      sellers,
      stats,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin Sellers Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/sellers/:id
 * Get single seller details (Info, Store Profile, Business Stats, Recent items)
 */
export const getAdminSellerById = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.params.id);

    const user = await User.findById(sellerId).select("-password").lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const application = await SellerApplication.findOne({ user: sellerId })
      .sort({ createdAt: -1 })
      .lean();
    const storeProfile = await StoreProfile.findOne({ seller: sellerId }).lean();
    const products = await Product.find({ seller: sellerId })
      .limit(5)
      .lean();

    const unifiedStatus =
      user.role === "seller"
        ? user.status || "active"
        : application
        ? application.status
        : "unknown";

    // Order Stats
    const orderItems = await Order.aggregate([
      { $match: { "items.seller": sellerId } },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId } },
    ]);

    let totalOrders = 0; // distinct orders could be orderItems.length but we need distinct order IDs
    const uniqueOrderIds = new Set();
    let completedOrders = 0;
    let pendingOrders = 0;
    let cancelledOrders = 0;
    let totalRevenue = 0; // all paid
    let platformCommission = 0;

    orderItems.forEach((row) => {
      uniqueOrderIds.add(row._id.toString());
      if (row.itemStatus === "delivered") completedOrders++;
      else if (row.itemStatus === "cancelled") cancelledOrders++;
      else pendingOrders++;
    });
    totalOrders = uniqueOrderIds.size;

    const paidOrderItems = orderItems.filter((o) => {
      // Find original order to check payment status
      return true; // Wait, we didn't bring paymentStatus down in unwind. We need to check paymentStatus.
    });

    // Better approach: aggregate for stats
    const statsAgg = await Order.aggregate([
      { $match: { "items.seller": sellerId } },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId } },
      {
        $group: {
          _id: {
            itemStatus: "$items.itemStatus",
            paymentStatus: "$paymentStatus",
          },
          orderIds: { $addToSet: "$_id" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
    ]);

    let stats_totalOrders = new Set();
    let stats_completed = 0;
    let stats_pending = 0;
    let stats_cancelled = 0;
    let stats_revenue = 0;

    statsAgg.forEach((group) => {
      group.orderIds.forEach((id) => stats_totalOrders.add(id.toString()));
      if (group._id.itemStatus === "delivered") stats_completed += group.orderIds.length;
      else if (group._id.itemStatus === "cancelled") stats_cancelled += group.orderIds.length;
      else stats_pending += group.orderIds.length;

      if (group._id.paymentStatus === "paid") {
        stats_revenue += group.revenue;
      }
    });

    totalOrders = stats_totalOrders.size;
    totalRevenue = stats_revenue;
    platformCommission = Math.round(totalRevenue * 0.1); // Assuming 10% for display
    const sellerEarnings = totalRevenue - platformCommission;

    const recentOrders = await Order.find({ "items.seller": sellerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name")
      .lean();

    // Map recent orders to seller-specific totals
    const mappedRecentOrders = recentOrders.map((order) => {
      const sellerItems = order.items.filter(
        (i) => i.seller.toString() === sellerId.toString()
      );
      const sellerTotal = sellerItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      return {
        _id: order._id,
        createdAt: order.createdAt,
        buyerName: order.user ? order.user.name : "Guest",
        totalAmount: sellerTotal, // Seller portion only
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        itemCount: sellerItems.length,
      };
    });

    res.status(200).json({
      success: true,
      seller: {
        ...user,
        unifiedStatus,
        application,
        storeProfile,
        businessStats: {
          totalOrders,
          completedOrders: stats_completed,
          pendingOrders: stats_pending,
          cancelledOrders: stats_cancelled,
          totalRevenue,
          sellerEarnings,
          platformCommission,
          productsListed: await Product.countDocuments({ seller: sellerId }),
        },
        recentProducts: products,
        recentOrders: mappedRecentOrders,
      },
    });
  } catch (error) {
    console.error("Admin Get Seller Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/admin/sellers/:id/status
 * Update user status (active/suspended)
 */
export const updateAdminSellerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: "seller" },
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/admin/sellers/:id
 * Perform soft delete (or hard delete based on preference, here hard delete but graceful)
 * We will remove User, StoreProfile, SellerApplication, and mark Products as inactive.
 * We will NOT delete Orders to preserve financial history.
 */
export const deleteAdminSeller = async (req, res) => {
  try {
    const sellerId = req.params.id;

    // We do a hard delete of the user for GDPR compliance, but leave orders intact.
    // If we wanted soft delete, we'd add a deletedAt to User schema.
    const user = await User.findByIdAndDelete(sellerId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    await StoreProfile.findOneAndDelete({ seller: sellerId });
    await SellerApplication.deleteMany({ user: sellerId });
    
    // Mark products as draft instead of deleting so existing orders still reference them if needed
    // (though Order snapshot pattern handles this anyway)
    await Product.updateMany({ seller: sellerId }, { status: "draft" });

    res
      .status(200)
      .json({ success: true, message: "Seller deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
