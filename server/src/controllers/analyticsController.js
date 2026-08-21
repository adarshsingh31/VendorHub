import Order from "../models/Order.js";
import Product from "../models/Product.js";
import InventoryTransaction from "../models/InventoryTransaction.js";
import StoreProfile from "../models/StoreProfile.js";
import Review from "../models/Review.js";
import mongoose from "mongoose";

// Platform fee must match earningsController
const PLATFORM_FEE_PERCENT = 0;

/**
 * Returns the start-of-day Date for a given number of days ago.
 */
function daysAgo(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function getPeriodBounds(period) {
  const now = new Date();
  let current, previous;

  switch (period) {
    case "today":
      current = daysAgo(0);
      previous = daysAgo(1);
      break;
    case "7d":
      current = daysAgo(7);
      previous = daysAgo(14);
      break;
    case "3m":
      current = daysAgo(90);
      previous = daysAgo(180);
      break;
    case "6m":
      current = daysAgo(180);
      previous = daysAgo(360);
      break;
    case "1y":
      current = daysAgo(365);
      previous = daysAgo(730);
      break;
    default: // 30d
      current = daysAgo(30);
      previous = daysAgo(60);
  }

  return { currentStart: current, previousStart: previous, currentEnd: now };
}

function chartDateFormat(period) {
  if (period === "today" || period === "7d" || period === "30d") return "%Y-%m-%d";
  return "%Y-%U"; // weekly for longer ranges
}

/**
 * Compute a flat overview for a given date range.
 */
async function computeOverview(sellerId, startDate) {
  const matchStage = {
    paymentStatus: "paid",
    "items.seller": sellerId,
    ...(startDate && { createdAt: { $gte: startDate } }),
  };

  const agg = await Order.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    { $match: { "items.seller": sellerId, "items.itemStatus": { $ne: "cancelled" } } },
    {
      $group: {
        _id: null,
        grossSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        unitsSold: { $sum: "$items.quantity" },
        ordersSet: { $addToSet: "$_id" },
        buyersSet: { $addToSet: "$user" },
      },
    },
  ]);

  if (!agg.length) return { grossSales: 0, unitsSold: 0, totalOrders: 0, totalBuyers: 0, avgOrderValue: 0 };

  const row = agg[0];
  const totalOrders = row.ordersSet.length;
  const totalBuyers = row.buyersSet.length;
  const grossSales = row.grossSales;
  const avgOrderValue = totalOrders > 0 ? Math.round(grossSales / totalOrders) : 0;

  return { grossSales, unitsSold: row.unitsSold, totalOrders, totalBuyers, avgOrderValue };
}

/**
 * GET /api/analytics/seller/overview
 */
export const getAnalyticsOverview = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);
    const { period = "30d" } = req.query;
    const { currentStart, previousStart } = getPeriodBounds(period);

    const [current, previous] = await Promise.all([
      computeOverview(sellerId, currentStart),
      computeOverview(sellerId, previousStart),
    ]);

    // Subtract previous-period data to isolate it (previous period = previousStart to currentStart)
    // We use a simpler approach: compare two non-overlapping windows
    const prevMatch = {
      paymentStatus: "paid",
      "items.seller": sellerId,
      createdAt: { $gte: previousStart, $lt: currentStart },
    };
    const prevAgg = await Order.aggregate([
      { $match: prevMatch },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId, "items.itemStatus": { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          grossSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          unitsSold: { $sum: "$items.quantity" },
          ordersSet: { $addToSet: "$_id" },
          buyersSet: { $addToSet: "$user" },
        },
      },
    ]);

    const prev = prevAgg.length
      ? {
          grossSales: prevAgg[0].grossSales,
          unitsSold: prevAgg[0].unitsSold,
          totalOrders: prevAgg[0].ordersSet.length,
          totalBuyers: prevAgg[0].buyersSet.length,
        }
      : { grossSales: 0, unitsSold: 0, totalOrders: 0, totalBuyers: 0 };

    const pct = (curr, prv) => {
      if (!prv) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prv) / prv) * 1000) / 10;
    };

    res.status(200).json({
      success: true,
      overview: {
        ...current,
        netEarnings: Math.round(current.grossSales * (1 - PLATFORM_FEE_PERCENT / 100)),
        platformFees: Math.round(current.grossSales * (PLATFORM_FEE_PERCENT / 100)),
        comparison: {
          grossSales: pct(current.grossSales, prev.grossSales),
          totalOrders: pct(current.totalOrders, prev.totalOrders),
          totalBuyers: pct(current.totalBuyers, prev.totalBuyers),
          unitsSold: pct(current.unitsSold, prev.unitsSold),
        },
      },
    });
  } catch (err) {
    console.error("Analytics overview error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * GET /api/analytics/seller/sales-chart
 */
export const getSalesChart = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);
    const { period = "30d" } = req.query;
    const { currentStart } = getPeriodBounds(period);
    const fmt = chartDateFormat(period);

    const agg = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          "items.seller": sellerId,
          createdAt: { $gte: currentStart },
        },
      },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId, "items.itemStatus": { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: fmt, date: "$createdAt" } },
          grossSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          orders: { $addToSet: "$_id" },
          unitsSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          grossSales: 1,
          orders: { $size: "$orders" },
          unitsSold: 1,
          netEarnings: {
            $subtract: ["$grossSales", { $multiply: ["$grossSales", PLATFORM_FEE_PERCENT / 100] }],
          },
        },
      },
    ]);

    res.status(200).json({ success: true, chartData: agg });
  } catch (err) {
    console.error("Sales chart error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * GET /api/analytics/seller/orders
 */
export const getOrderAnalytics = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);
    const { period = "30d" } = req.query;
    const { currentStart } = getPeriodBounds(period);

    const matchStage = {
      paymentStatus: "paid",
      "items.seller": sellerId,
      ...(currentStart && { createdAt: { $gte: currentStart } }),
    };

    const agg = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId } },
      {
        $group: {
          _id: "$items.itemStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap = {};
    const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    statuses.forEach((s) => (statusMap[s] = 0));
    agg.forEach((row) => {
      if (statusMap[row._id] !== undefined) statusMap[row._id] = row.count;
    });

    const total = Object.values(statusMap).reduce((a, b) => a + b, 0);

    res.status(200).json({ success: true, orderStatus: statusMap, total });
  } catch (err) {
    console.error("Order analytics error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * GET /api/analytics/seller/products
 */
export const getProductAnalytics = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);
    const { period = "30d" } = req.query;
    const { currentStart } = getPeriodBounds(period);

    const matchStage = {
      paymentStatus: "paid",
      "items.seller": sellerId,
      ...(currentStart && { createdAt: { $gte: currentStart } }),
    };

    const agg = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId, "items.itemStatus": { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$items.product",
          productName: { $first: "$items.name" },
          productImage: { $first: "$items.image" },
          unitsSold: { $sum: "$items.quantity" },
          ordersSet: { $addToSet: "$_id" },
          buyersSet: { $addToSet: "$user" },
          grossSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: 1,
          productImage: 1,
          unitsSold: 1,
          orders: { $size: "$ordersSet" },
          buyers: { $size: "$buyersSet" },
          grossSales: 1,
          netEarnings: {
            $subtract: ["$grossSales", { $multiply: ["$grossSales", PLATFORM_FEE_PERCENT / 100] }],
          },
        },
      },
      { $sort: { grossSales: -1 } },
    ]);

    res.status(200).json({ success: true, products: agg });
  } catch (err) {
    console.error("Product analytics error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * GET /api/analytics/seller/customers
 */
export const getCustomerAnalytics = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);
    const { period = "30d" } = req.query;
    const { currentStart } = getPeriodBounds(period);

    // All-time buyers before the current period (returning = already bought before)
    const allTimePrevious = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          "items.seller": sellerId,
          createdAt: { $lt: currentStart },
        },
      },
      { $group: { _id: "$user" } },
    ]);
    const previousBuyerIds = new Set(allTimePrevious.map((r) => r._id.toString()));

    // Current period buyers with spend info
    const currentAgg = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          "items.seller": sellerId,
          createdAt: { $gte: currentStart },
        },
      },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId, "items.itemStatus": { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$user",
          ordersSet: { $addToSet: "$_id" },
          unitsBought: { $sum: "$items.quantity" },
          totalSpent: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          buyerId: "$_id",
          name: { $ifNull: ["$userInfo.name", "Unknown"] },
          email: { $ifNull: ["$userInfo.email", ""] },
          orders: { $size: "$ordersSet" },
          unitsBought: 1,
          totalSpent: 1,
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);

    const totalBuyers = currentAgg.length;
    const returningBuyers = currentAgg.filter((b) => previousBuyerIds.has(b.buyerId.toString())).length;
    const newBuyers = totalBuyers - returningBuyers;
    const repeatRate = totalBuyers > 0 ? Math.round((returningBuyers / totalBuyers) * 1000) / 10 : 0;

    res.status(200).json({
      success: true,
      customerSummary: { totalBuyers, newBuyers, returningBuyers, repeatRate },
      topCustomers: currentAgg.slice(0, 10),
    });
  } catch (err) {
    console.error("Customer analytics error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * GET /api/analytics/seller/inventory
 */
export const getInventoryAnalytics = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    const products = await Product.find({ seller: sellerId }).select(
      "name images stock lowStockThreshold price"
    );

    let inStock = 0, lowStock = 0, outOfStock = 0, totalUnits = 0, inventoryValue = 0;
    const lowStockItems = [];
    const outOfStockItems = [];

    products.forEach((p) => {
      totalUnits += p.stock;
      inventoryValue += p.stock * p.price;
      const threshold = p.lowStockThreshold || 10;

      if (p.stock === 0) {
        outOfStock++;
        outOfStockItems.push({ productId: p._id, name: p.name, image: p.images?.[0] });
      } else if (p.stock <= threshold) {
        lowStock++;
        lowStockItems.push({ productId: p._id, name: p.name, image: p.images?.[0], stock: p.stock });
      } else {
        inStock++;
      }
    });

    res.status(200).json({
      success: true,
      inventory: {
        totalProducts: products.length,
        totalUnits,
        inStock,
        lowStock,
        outOfStock,
        inventoryValue,
        lowStockItems: lowStockItems.slice(0, 5),
        outOfStockItems: outOfStockItems.slice(0, 5),
      },
    });
  } catch (err) {
    console.error("Inventory analytics error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * GET /api/analytics/seller/recent-activity
 */
export const getRecentActivity = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    // Recent orders (last 10)
    const recentOrders = await Order.find({ "items.seller": sellerId, paymentStatus: "paid" })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name");

    const orderActivity = recentOrders.map((order) => {
      const sellerItems = order.items.filter((i) => i.seller.toString() === req.user.id);
      const sellerTotal = sellerItems.reduce((s, i) => s + i.price * i.quantity, 0);
      const itemNames = sellerItems.map((i) => `${i.name} ×${i.quantity}`).join(", ");
      return {
        type: "order",
        icon: "🛒",
        text: `${order.user?.name || "A buyer"} purchased ${itemNames}`,
        subText: `Order #${order._id.toString().slice(-8).toUpperCase()} · ₹${sellerTotal.toLocaleString()}`,
        timestamp: order.createdAt,
      };
    });

    // Recent inventory changes (last 5)
    const recentInv = await InventoryTransaction.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("product", "name");

    const invActivity = recentInv.map((tx) => ({
      type: "inventory",
      icon: tx.change > 0 ? "📦" : "📉",
      text: `${tx.product?.name || "Product"} stock ${tx.change > 0 ? "restocked" : "reduced"} to ${tx.newStock}`,
      subText: `${tx.reason.replace(/_/g, " ")} · ${tx.change > 0 ? "+" : ""}${tx.change} units`,
      timestamp: tx.createdAt,
    }));

    // Merge and sort by timestamp
    const activity = [...orderActivity, ...invActivity]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 12);

    res.status(200).json({ success: true, activity });
  } catch (err) {
    console.error("Recent activity error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * GET /api/analytics/seller/category-sales
 */
export const getCategorySales = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);
    const { period = "30d" } = req.query;
    const { currentStart } = getPeriodBounds(period);

    const matchStage = {
      paymentStatus: "paid",
      "items.seller": sellerId,
      ...(currentStart && { createdAt: { $gte: currentStart } }),
    };

    // Join orders with products to get category
    const agg = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId, "items.itemStatus": { $ne: "cancelled" } } },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$productInfo.category", "Uncategorized"] },
          grossSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          unitsSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { grossSales: -1 } },
      { $project: { _id: 0, category: "$_id", grossSales: 1, unitsSold: 1 } },
    ]);

    res.status(200).json({ success: true, categorySales: agg });
  } catch (err) {
    console.error("Category sales error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * GET /api/analytics/seller/dashboard
 * Aggregates all data required for the Seller Dashboard overview page.
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();
    
    // Date ranges
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    
    const last7DaysStart = new Date(now);
    last7DaysStart.setHours(0, 0, 0, 0);
    last7DaysStart.setDate(last7DaysStart.getDate() - 6); // Includes today + 6 previous days

    // 1. Seller Info
    const storeProfile = await StoreProfile.findOne({ seller: sellerId });
    const storeName = storeProfile?.storeName || req.user.name || "My Store";

    // 2. Revenue & Orders (Current Month vs Last Month)
    const monthlyStats = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: "paid", 
          "items.seller": sellerId,
          createdAt: { $gte: lastMonthStart }
        } 
      },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId, "items.itemStatus": { $ne: "cancelled" } } },
      {
        $group: {
          _id: {
            $cond: [
              { $gte: ["$createdAt", thisMonthStart] },
              "current",
              "previous"
            ]
          },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          orderIds: { $addToSet: "$_id" } // For unique order count
        }
      }
    ]);

    let currentMonthRev = 0, currentMonthOrders = 0;
    let prevMonthRev = 0, prevMonthOrders = 0;

    monthlyStats.forEach(stat => {
      if (stat._id === "current") {
        currentMonthRev = stat.revenue;
        currentMonthOrders = stat.orderIds.length;
      } else {
        prevMonthRev = stat.revenue;
        prevMonthOrders = stat.orderIds.length;
      }
    });

    const revGrowth = prevMonthRev > 0 ? ((currentMonthRev - prevMonthRev) / prevMonthRev) * 100 : null;
    const orderGrowth = prevMonthOrders > 0 ? ((currentMonthOrders - prevMonthOrders) / prevMonthOrders) * 100 : null;

    // 3. Awaiting Shipment / Due Today
    // Pending/processing items requiring action
    const awaitingStats = await Order.aggregate([
      { $match: { paymentStatus: "paid", "items.seller": sellerId } },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId, "items.itemStatus": { $in: ["pending", "confirmed", "processing"] } } },
      {
        $group: {
          _id: null,
          totalAwaiting: { $sum: 1 },
          dueToday: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", new Date(now.setHours(0,0,0,0))] },
                1, 0
              ]
            }
          }
        }
      }
    ]);

    const awaitingShipment = awaitingStats.length > 0 ? awaitingStats[0].totalAwaiting : 0;
    const dueToday = awaitingStats.length > 0 ? awaitingStats[0].dueToday : 0;

    // 4. Reviews
    const reviewStats = await Review.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "prod"
        }
      },
      { $unwind: "$prod" },
      { $match: { "prod.seller": sellerId } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: "$rating" }
        }
      }
    ]);

    const totalReviews = reviewStats.length > 0 ? reviewStats[0].totalReviews : 0;
    const averageRating = reviewStats.length > 0 ? Number(reviewStats[0].avgRating.toFixed(1)) : 0;

    // 5. Sales Last 7 Days Chart
    const salesChartAgg = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: "paid", 
          "items.seller": sellerId,
          createdAt: { $gte: last7DaysStart }
        } 
      },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId, "items.itemStatus": { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      }
    ]);

    const salesLast7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(last7DaysStart);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const match = salesChartAgg.find(s => s._id === dateStr);
      salesLast7Days.push({
        date: dateStr,
        sales: match ? match.sales : 0
      });
    }

    // 6. Low Stock & Out of Stock Products
    const products = await Product.find({ seller: sellerId, status: "active" }, "name category stock images");
    const lowStockThreshold = 5;
    
    const lowStockProducts = products
      .filter(p => p.stock > 0 && p.stock <= lowStockThreshold)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);
      
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    // 7. Recent Orders
    const recentOrders = await Order.find({ "items.seller": sellerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name");

    const formattedRecentOrders = recentOrders.map(order => {
      const sellerItem = order.items.find(i => i.seller.toString() === sellerId.toString());
      return {
        _id: order._id,
        orderId: `#${order._id.toString().slice(-8).toUpperCase()}`,
        item: sellerItem ? sellerItem.name : "Item",
        buyer: order.user?.name || "Unknown",
        amount: sellerItem ? (sellerItem.price * sellerItem.quantity) : 0,
        status: sellerItem ? sellerItem.itemStatus : "unknown"
      };
    });

    // 8. To-Do Items
    const todo = [];
    if (awaitingShipment > 0) {
      todo.push({
        text: `Pack & dispatch ${awaitingShipment} order${awaitingShipment > 1 ? "s" : ""}`,
        action: "View Orders",
        link: "/seller/orders"
      });
    }
    if (outOfStockCount > 0) {
      todo.push({
        text: `Restock ${outOfStockCount} out-of-stock product${outOfStockCount > 1 ? "s" : ""}`,
        action: "Manage Inventory",
        link: "/seller/inventory"
      });
    }
    if (lowStockProducts.length > 0) {
      todo.push({
        text: `Restock ${lowStockProducts.length} low-stock product${lowStockProducts.length > 1 ? "s" : ""}`,
        action: "Manage Inventory",
        link: "/seller/inventory"
      });
    }
    if (!storeProfile) {
      todo.push({
        text: `Complete your store profile`,
        action: "Go to Settings",
        link: "/seller/settings"
      });
    }
    if (todo.length === 0) {
      todo.push({
        text: `✓ You're all caught up!`,
        action: null,
        link: null
      });
    }

    // 9. Latest Reviews
    const latestReviewsRaw = await Review.find()
      .populate({ path: "product", match: { seller: sellerId }, select: "name" })
      .populate("buyer", "name")
      .sort({ createdAt: -1 })
      .limit(20);

    const latestReviews = latestReviewsRaw
      .filter(r => r.product !== null) // only reviews for this seller's products
      .slice(0, 3)
      .map(r => ({
        _id: r._id,
        rating: r.rating,
        comment: r.comment,
        buyer: { name: r.buyer?.name || "Anonymous" },
        productName: r.product?.name || "",
        createdAt: r.createdAt
      }));

    res.status(200).json({
      success: true,
      seller: { storeName, slug: storeProfile?.slug || null },
      summary: {
        monthlyRevenue: currentMonthRev,
        revenueGrowth: revGrowth,
        monthlyOrders: currentMonthOrders,
        orderGrowth: orderGrowth,
        awaitingShipment,
        dueToday,
        totalReviews,
        averageRating
      },
      salesLast7Days,
      lowStockProducts: lowStockProducts.map(p => ({
        _id: p._id,
        name: p.name,
        category: p.category,
        stock: p.stock,
        image: p.images?.[0] || null
      })),
      recentOrders: formattedRecentOrders,
      latestReviews,
      todo,
      outOfStockCount
    });

  } catch (err) {
    console.error("Dashboard overview error:", err);
    res.status(500).json({ success: false, message: "Server Error fetching dashboard data" });
  }
};
