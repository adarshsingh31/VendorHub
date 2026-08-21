import User from "../models/User.js";
import Order from "../models/Order.js";

/**
 * GET /api/admin/users
 * Get paginated, searchable, filterable list of buyers
 */
export const getAdminUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const search = req.query.search || "";
    const status = req.query.status || "all";
    const sort = req.query.sort || "newest";
    const dateRange = req.query.dateRange || "all";

    const query = { role: "buyer" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status !== "all") {
      query.status = status;
    }

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
      query.createdAt = { $gte: startDate };
    }

    let sortOptions = {};
    switch (sort) {
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "nameAsc":
        sortOptions = { name: 1 };
        break;
      case "nameDesc":
        sortOptions = { name: -1 };
        break;
      case "newest":
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -resetPasswordToken -resetPasswordExpire")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Fetch order counts for each user
    const userIds = users.map((u) => u._id);
    const orderCounts = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: "$user", count: { $sum: 1 } } },
    ]);

    const orderCountMap = orderCounts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const usersWithOrderCount = users.map((u) => ({
      ...u,
      totalOrders: orderCountMap[u._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      users: usersWithOrderCount,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/users/:id
 * Get single user details with order aggregation
 */
export const getAdminUserById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: "buyer" }).select(
      "-password -resetPasswordToken -resetPasswordExpire"
    ).lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const orders = await Order.find({ user: user._id })
      .select("_id createdAt totalAmount orderStatus paymentStatus")
      .sort({ createdAt: -1 })
      .lean();

    const totalOrders = orders.length;
    let totalSpent = 0;
    let completedOrders = 0;
    let pendingOrders = 0;
    let cancelledOrders = 0;

    orders.forEach((order) => {
      if (order.paymentStatus === "paid") {
        totalSpent += order.totalAmount;
      }
      if (order.orderStatus === "delivered") completedOrders++;
      else if (order.orderStatus === "cancelled") cancelledOrders++;
      else pendingOrders++;
    });

    res.status(200).json({
      success: true,
      user: {
        ...user,
        shoppingStats: {
          totalOrders,
          totalSpent,
          completedOrders,
          pendingOrders,
          cancelledOrders,
        },
        recentOrders: orders.slice(0, 5),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/admin/users/:id/status
 * Update user status (active/suspended)
 */
export const updateAdminUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: "buyer" },
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete a user completely
 */
export const deleteAdminUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: "buyer" });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
