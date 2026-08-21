import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Review from "../models/Review.js";

const PLATFORM_FEE_PERCENT = 0;

// Helper: build date match filter
const buildDateMatch = (startDate, endDate) => {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  return match;
};

// Helper: group format based on period
const getGroupFormat = (period) => {
  switch (period) {
    case "monthly":
      return { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    case "weekly":
      return { $dateToString: { format: "%Y-%U", date: "$createdAt" } };
    case "daily":
    default:
      return { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  }
};

/**
 * GET /api/admin/reports/overview
 */
export const getReportsOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateMatch = buildDateMatch(startDate, endDate);

    // Paid orders only
    const matchStage = { paymentStatus: "paid", ...dateMatch };

    const agg = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.itemStatus",
          totalGross: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          orderSet: { $addToSet: "$_id" },
        },
      },
    ]);

    let grossSales = 0;
    let totalRefunds = 0;
    let allOrdersSet = new Set();

    for (const row of agg) {
      if (row._id === "cancelled" || row._id === "refunded" || row._id === "returned") {
        totalRefunds += row.totalGross;
      } else {
        grossSales += row.totalGross;
      }
      row.orderSet.forEach((o) => allOrdersSet.add(o.toString()));
    }

    const platformCommission = (grossSales * PLATFORM_FEE_PERCENT) / 100;
    const sellerEarnings = grossSales - platformCommission;
    const totalOrders = allOrdersSet.size;
    const avgOrderValue = totalOrders > 0 ? (grossSales / totalOrders) : 0;

    res.json({
      success: true,
      data: {
        totalRevenue: grossSales, // Gross Sales
        platformCommission,
        sellerEarnings,
        totalRefunds,
        totalOrders,
        avgOrderValue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/reports/revenue
 */
export const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, period = "daily" } = req.query;
    const dateMatch = buildDateMatch(startDate, endDate);

    const matchStage = { paymentStatus: "paid", ...dateMatch };
    const dateFormat = getGroupFormat(period);

    const agg = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: { date: dateFormat, status: "$items.itemStatus" },
          amount: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          statuses: { $push: { k: "$_id.status", v: "$amount" } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const chartData = agg.map((row) => {
      const statuses = row.statuses.reduce((acc, curr) => {
        acc[curr.k] = curr.v;
        return acc;
      }, {});

      const refunds =
        (statuses.cancelled || 0) + (statuses.refunded || 0) + (statuses.returned || 0);
      const grossSales =
        (statuses.pending || 0) +
        (statuses.confirmed || 0) +
        (statuses.processing || 0) +
        (statuses.shipped || 0) +
        (statuses.delivered || 0);

      const platformCommission = (grossSales * PLATFORM_FEE_PERCENT) / 100;
      const sellerEarnings = grossSales - platformCommission;
      const netRevenue = platformCommission; // or whatever the platform logic is

      return {
        date: row._id,
        grossSales,
        platformCommission,
        sellerEarnings,
        refunds,
        netRevenue,
      };
    });

    res.json({ success: true, data: chartData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/reports/orders
 */
export const getOrdersReport = async (req, res) => {
  try {
    const { startDate, endDate, period = "daily" } = req.query;
    const dateMatch = buildDateMatch(startDate, endDate);

    const matchStage = { ...dateMatch };
    const dateFormat = getGroupFormat(period);

    // Summary counts
    const summaryAgg = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
      refunded: 0,
    };

    summaryAgg.forEach((r) => {
      summary.total += r.count;
      if (summary[r._id] !== undefined) summary[r._id] = r.count;
    });

    // Trend chart data
    const chartAgg = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { date: dateFormat },
          total: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] } },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    const chartData = chartAgg.map((r) => ({
      date: r._id.date,
      total: r.total,
      delivered: r.delivered,
      cancelled: r.cancelled,
    }));

    res.json({ success: true, summary, chartData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/reports/sellers
 */
export const getSellersReport = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 25, sort = "sales" } = req.query;
    const dateMatch = buildDateMatch(startDate, endDate);

    // 1. Get seller performance from orders
    const orderAgg = await Order.aggregate([
      { $match: { paymentStatus: "paid", ...dateMatch } },
      { $unwind: "$items" },
      { $match: { "items.itemStatus": { $nin: ["cancelled", "refunded", "returned"] } } },
      {
        $group: {
          _id: "$items.seller",
          grossSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          ordersSet: { $addToSet: "$_id" },
        },
      },
    ]);

    const sellerStats = {};
    orderAgg.forEach((r) => {
      const commission = (r.grossSales * PLATFORM_FEE_PERCENT) / 100;
      sellerStats[r._id.toString()] = {
        grossSales: r.grossSales,
        orders: r.ordersSet.length,
        commission,
        earnings: r.grossSales - commission,
      };
    });

    // 2. Get product counts per seller
    const productAgg = await Product.aggregate([
      { $group: { _id: "$seller", products: { $sum: 1 } } },
    ]);
    const productStats = {};
    productAgg.forEach((r) => {
      productStats[r._id.toString()] = r.products;
    });

    // 3. Get all sellers (Users with role="seller")
    let sellers = await User.find({ role: "seller" }).lean();

    // Map stats
    let results = sellers.map((s) => {
      const stats = sellerStats[s._id.toString()] || {
        grossSales: 0,
        orders: 0,
        commission: 0,
        earnings: 0,
      };
      const products = productStats[s._id.toString()] || 0;
      return {
        _id: s._id,
        name: s.name,
        email: s.email,
        products,
        ...stats,
      };
    });

    // Sort
    if (sort === "sales") results.sort((a, b) => b.grossSales - a.grossSales);
    else if (sort === "orders") results.sort((a, b) => b.orders - a.orders);
    else if (sort === "earnings") results.sort((a, b) => b.earnings - a.earnings);
    else if (sort === "products") results.sort((a, b) => b.products - a.products);
    else results.sort((a, b) => a.name.localeCompare(b.name));

    // Paginate
    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginated = results.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: paginated,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/reports/products
 */
export const getProductsReport = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 25, sort = "revenue" } = req.query;
    const dateMatch = buildDateMatch(startDate, endDate);

    const orderAgg = await Order.aggregate([
      { $match: { paymentStatus: "paid", ...dateMatch } },
      { $unwind: "$items" },
      { $match: { "items.itemStatus": { $nin: ["cancelled", "refunded", "returned"] } } },
      {
        $group: {
          _id: "$items.product",
          unitsSold: { $sum: "$items.quantity" },
          ordersSet: { $addToSet: "$_id" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
    ]);

    const orderStats = {};
    orderAgg.forEach((r) => {
      orderStats[r._id.toString()] = {
        unitsSold: r.unitsSold,
        orders: r.ordersSet.length,
        revenue: r.revenue,
      };
    });

    // Fetch all products
    let products = await Product.find().populate("seller", "name").lean();

    let results = products.map((p) => {
      const stats = orderStats[p._id.toString()] || { unitsSold: 0, orders: 0, revenue: 0 };
      return {
        _id: p._id,
        name: p.name,
        seller: p.seller?.name || "Unknown",
        rating: p.averageRating || 0,
        stock: p.stock,
        ...stats,
      };
    });

    if (sort === "revenue") results.sort((a, b) => b.revenue - a.revenue);
    else if (sort === "sold") results.sort((a, b) => b.unitsSold - a.unitsSold);
    else if (sort === "orders") results.sort((a, b) => b.orders - a.orders);
    else if (sort === "rating") results.sort((a, b) => b.rating - a.rating);

    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginated = results.slice(startIndex, startIndex + parseInt(limit));

    // Summary stats
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;

    res.json({
      success: true,
      data: paginated,
      summary: { lowStock, outOfStock },
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/reports/categories
 */
export const getCategoriesReport = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 25, sort = "revenue" } = req.query;
    const dateMatch = buildDateMatch(startDate, endDate);

    // Get order stats by category
    // In our system, category is just a string on the product model.
    const orderAgg = await Order.aggregate([
      { $match: { paymentStatus: "paid", ...dateMatch } },
      { $unwind: "$items" },
      { $match: { "items.itemStatus": { $nin: ["cancelled", "refunded", "returned"] } } },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDoc"
        }
      },
      { $unwind: "$productDoc" },
      {
        $group: {
          _id: "$productDoc.category",
          unitsSold: { $sum: "$items.quantity" },
          ordersSet: { $addToSet: "$_id" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
    ]);

    const orderStats = {};
    orderAgg.forEach((r) => {
      orderStats[r._id] = {
        unitsSold: r.unitsSold,
        orders: r.ordersSet.length,
        revenue: r.revenue,
      };
    });

    // Product counts by category
    const productAgg = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const productCounts = {};
    productAgg.forEach(r => { productCounts[r._id] = r.count; });

    let categories = await Category.find().lean();
    let results = categories.map((c) => {
      const stats = orderStats[c.name] || { unitsSold: 0, orders: 0, revenue: 0 };
      const products = productCounts[c.name] || 0;
      return {
        _id: c._id,
        name: c.name,
        products,
        ...stats,
      };
    });

    if (sort === "revenue") results.sort((a, b) => b.revenue - a.revenue);
    else if (sort === "orders") results.sort((a, b) => b.orders - a.orders);
    else if (sort === "products") results.sort((a, b) => b.products - a.products);
    else if (sort === "sold") results.sort((a, b) => b.unitsSold - a.unitsSold);

    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginated = results.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: paginated,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/reports/customers
 */
export const getCustomersReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateMatch = buildDateMatch(startDate, endDate);

    // Users
    const allBuyers = await User.find({ role: "buyer" }).lean();
    let newBuyersCount = 0;
    if (startDate || endDate) {
      newBuyersCount = await User.countDocuments({ role: "buyer", ...dateMatch });
    } else {
      newBuyersCount = allBuyers.length;
    }

    // Order stats per user
    const orderAgg = await Order.aggregate([
      { $match: { paymentStatus: "paid", ...dateMatch } },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        }
      }
    ]);

    const buyersWithOrders = orderAgg.length;
    const returningBuyers = orderAgg.filter(r => r.orderCount > 1).length;
    const totalSpent = orderAgg.reduce((acc, curr) => acc + curr.totalSpent, 0);
    const totalOrders = orderAgg.reduce((acc, curr) => acc + curr.orderCount, 0);

    const avgOrdersPerBuyer = buyersWithOrders > 0 ? (totalOrders / buyersWithOrders) : 0;
    const avgCustomerSpending = buyersWithOrders > 0 ? (totalSpent / buyersWithOrders) : 0;

    res.json({
      success: true,
      data: {
        totalBuyers: allBuyers.length,
        newBuyers: newBuyersCount,
        returningBuyers,
        buyersWithOrders,
        avgOrdersPerBuyer,
        avgCustomerSpending
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/reports/payments
 */
export const getPaymentsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateMatch = buildDateMatch(startDate, endDate);

    const agg = await Order.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: "$paymentStatus",
          amount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        }
      }
    ]);

    const result = {
      totalVolume: 0,
      successful: 0,
      failed: 0,
      pending: 0,
      refunded: 0,
    };

    agg.forEach(r => {
      result.totalVolume += r.amount;
      if (r._id === "paid") result.successful += r.amount;
      if (r._id === "failed") result.failed += r.amount;
      if (r._id === "pending") result.pending += r.amount;
      if (r._id === "refunded") result.refunded += r.amount;
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/reports/refunds
 */
export const getRefundsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateMatch = buildDateMatch(startDate, endDate);

    const agg = await Order.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.itemStatus",
          count: { $sum: 1 },
          amount: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      }
    ]);

    let totalItems = 0;
    const data = {
      cancelledOrders: 0,
      returnedOrders: 0,
      refundedOrders: 0,
      refundAmount: 0,
      cancellationRate: 0,
      returnRate: 0
    };

    agg.forEach(r => {
      totalItems += r.count;
      if (r._id === "cancelled") {
        data.cancelledOrders += r.count;
        data.refundAmount += r.amount;
      }
      if (r._id === "returned") {
        data.returnedOrders += r.count;
        data.refundAmount += r.amount;
      }
      if (r._id === "refunded") {
        data.refundedOrders += r.count;
        data.refundAmount += r.amount;
      }
    });

    if (totalItems > 0) {
      data.cancellationRate = data.cancelledOrders / totalItems;
      data.returnRate = data.returnedOrders / totalItems;
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/reports/reviews
 */
export const getReviewsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateMatch = buildDateMatch(startDate, endDate);

    const agg = await Review.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      }
    ]);

    let totalReviews = 0;
    let sumRatings = 0;
    const distribution = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };

    agg.forEach(r => {
      totalReviews += r.count;
      sumRatings += (r._id * r.count);
      distribution[r._id.toString()] = r.count;
    });

    const averageRating = totalReviews > 0 ? (sumRatings / totalReviews) : 0;

    res.json({
      success: true,
      data: {
        totalReviews,
        averageRating,
        distribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper to convert array of objects to CSV string
 */
const convertToCSV = (arr) => {
  if (!arr || !arr.length) return "";
  const keys = Object.keys(arr[0]);
  const header = keys.join(",");
  const rows = arr.map(obj => 
    keys.map(k => {
      let val = obj[k] === null || obj[k] === undefined ? "" : obj[k];
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(",")
  );
  return [header, ...rows].join("\n");
};

/**
 * GET /api/admin/reports/export
 */
export const exportReport = async (req, res) => {
  try {
    const { startDate, endDate, type = "sales" } = req.query;
    const dateMatch = buildDateMatch(startDate, endDate);
    
    let csvString = "";

    if (type === "sales") {
      const agg = await Order.aggregate([
        { $match: { paymentStatus: "paid", ...dateMatch } },
        { $unwind: "$items" },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            grossSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      const data = agg.map(r => ({ Date: r._id, GrossSales: r.grossSales }));
      csvString = convertToCSV(data.length ? data : [{ Date: "No Data", GrossSales: 0 }]);
    } 
    else if (type === "orders") {
      const agg = await Order.find(dateMatch).populate("user", "name").lean();
      const data = agg.map(o => ({
        OrderID: o._id.toString(),
        Date: o.createdAt.toISOString(),
        Customer: o.user?.name || "Unknown",
        Status: o.orderStatus,
        Amount: o.totalAmount,
        Payment: o.paymentStatus
      }));
      csvString = convertToCSV(data.length ? data : [{ OrderID: "No Data" }]);
    }
    else {
      csvString = convertToCSV([{ Message: "Export type not fully implemented yet in this stub", Type: type }]);
    }

    res.header("Content-Type", "text/csv");
    res.attachment(`${type}_report.csv`);
    return res.send(csvString);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
