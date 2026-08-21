import Order from "../models/Order.js";
import mongoose from "mongoose";

// Platform fee percentage (0 = no fee currently configured)
const PLATFORM_FEE_PERCENT = 0;

/**
 * Helper: Returns the date boundary for a given period filter.
 */
function getDateBoundary(period) {
  const now = new Date();
  switch (period) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "3m":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "6m":
      return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    case "1y":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return null; // all time
  }
}

/**
 * GET /api/earnings/seller/summary
 * Returns the top-level financial summary for the authenticated seller.
 */
export const getEarningsSummary = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    // All paid orders containing seller's items
    const agg = await Order.aggregate([
      { $match: { paymentStatus: "paid", "items.seller": sellerId } },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId } },
      {
        $group: {
          _id: "$items.itemStatus",
          grossSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
    ]);

    let grossSales = 0;
    let cancelledAmount = 0;

    for (const row of agg) {
      const amount = row.grossSales;
      if (row._id === "cancelled") {
        cancelledAmount += amount;
      } else {
        grossSales += amount;
      }
    }

    const platformFees = Math.round(grossSales * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
    const netEarnings = grossSales - platformFees;

    // Pending = items not yet delivered (confirmed/processing/shipped)
    const pendingAgg = await Order.aggregate([
      { $match: { paymentStatus: "paid", "items.seller": sellerId } },
      { $unwind: "$items" },
      {
        $match: {
          "items.seller": sellerId,
          "items.itemStatus": { $in: ["pending", "confirmed", "processing", "shipped"] },
        },
      },
      {
        $group: {
          _id: null,
          pendingEarnings: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
    ]);

    const pendingEarnings = pendingAgg[0]?.pendingEarnings || 0;

    res.status(200).json({
      success: true,
      summary: {
        grossSales,
        netEarnings,
        pendingEarnings,
        paidOut: 0, // Payouts not yet implemented
        platformFees,
        paymentFees: 0,
        refunds: cancelledAmount,
        platformFeePercent: PLATFORM_FEE_PERCENT,
      },
    });
  } catch (error) {
    console.error("Earnings summary error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * GET /api/earnings/seller/transactions
 * Returns paginated earning transactions with buyer info.
 * Query params: page, limit, search, startDate, endDate, status
 */
export const getEarningsTransactions = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);
    const { search, status, period, page = 1, limit = 20 } = req.query;

    const matchStage = { paymentStatus: "paid", "items.seller": sellerId };

    const dateBoundary = getDateBoundary(period);
    if (dateBoundary) {
      matchStage.createdAt = { $gte: dateBoundary };
    }

    let orders = await Order.find(matchStage)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Build flat transaction list (one row per order-item belonging to this seller)
    let transactions = [];

    for (const order of orders) {
      const sellerItems = order.items.filter(
        (item) => item.seller.toString() === req.user.id
      );

      for (const item of sellerItems) {
        const gross = item.price * item.quantity;
        const fee = Math.round(gross * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
        const net = gross - fee;

        transactions.push({
          _id: `${order._id}_${item._id}`,
          orderId: order._id,
          orderDate: order.createdAt,
          buyer: {
            name: order.user?.name || order.shippingAddress?.fullName || "Unknown",
            email: order.user?.email || "",
            phone: order.shippingAddress?.phone || "",
          },
          product: {
            id: item.product,
            name: item.name,
            image: item.image,
          },
          quantity: item.quantity,
          unitPrice: item.price,
          grossAmount: gross,
          platformFee: fee,
          paymentFee: 0,
          refund: 0,
          netAmount: net,
          itemStatus: item.itemStatus,
          paymentStatus: order.paymentStatus,
          razorpayPaymentId: order.razorpayPaymentId,
          shippingAddress: order.shippingAddress,
        });
      }
    }

    // Apply search filter
    if (search) {
      const s = search.toLowerCase();
      transactions = transactions.filter(
        (t) =>
          t.orderId.toString().toLowerCase().includes(s) ||
          t.buyer.name.toLowerCase().includes(s) ||
          t.buyer.email.toLowerCase().includes(s) ||
          t.product.name.toLowerCase().includes(s)
      );
    }

    // Apply status filter
    if (status && status !== "all") {
      transactions = transactions.filter((t) => t.itemStatus === status);
    }

    // Paginate
    const total = transactions.length;
    const startIndex = (page - 1) * limit;
    const paginated = transactions.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      transactions: paginated,
    });
  } catch (error) {
    console.error("Earnings transactions error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * GET /api/earnings/seller/product-performance
 * Returns earnings grouped by product.
 */
export const getProductPerformance = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    const agg = await Order.aggregate([
      { $match: { paymentStatus: "paid", "items.seller": sellerId } },
      { $unwind: "$items" },
      {
        $match: {
          "items.seller": sellerId,
          "items.itemStatus": { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: "$items.product",
          productName: { $first: "$items.name" },
          productImage: { $first: "$items.image" },
          unitsSold: { $sum: "$items.quantity" },
          ordersCount: { $addToSet: "$_id" },
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
          orders: { $size: "$ordersCount" },
          grossSales: 1,
          netEarnings: {
            $subtract: [
              "$grossSales",
              { $multiply: ["$grossSales", PLATFORM_FEE_PERCENT / 100] },
            ],
          },
        },
      },
      { $sort: { grossSales: -1 } },
    ]);

    res.status(200).json({ success: true, productPerformance: agg });
  } catch (error) {
    console.error("Product performance error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * GET /api/earnings/seller/chart
 * Returns time-series earnings data for the chart.
 * Query params: period (7d, 30d, 3m, 6m, 1y)
 */
export const getEarningsChart = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);
    const { period = "30d" } = req.query;

    const dateBoundary = getDateBoundary(period) || new Date(0);

    // Determine grouping granularity
    let dateFormat;
    if (period === "7d") {
      dateFormat = "%Y-%m-%d"; // daily
    } else if (period === "30d") {
      dateFormat = "%Y-%m-%d"; // daily
    } else {
      dateFormat = "%Y-%U"; // weekly (year-week)
    }

    const agg = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          "items.seller": sellerId,
          createdAt: { $gte: dateBoundary },
        },
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.seller": sellerId,
          "items.itemStatus": { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          grossSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          grossSales: 1,
          netEarnings: {
            $subtract: [
              "$grossSales",
              { $multiply: ["$grossSales", PLATFORM_FEE_PERCENT / 100] },
            ],
          },
        },
      },
    ]);

    res.status(200).json({ success: true, chartData: agg });
  } catch (error) {
    console.error("Earnings chart error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
