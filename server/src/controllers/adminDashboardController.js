import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import SellerApplication from "../models/SellerApplication.js";

const PLATFORM_FEE_PERCENT = 0;

// ─── Date helpers ─────────────────────────────────────────────────────────────
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay   = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const getThisMonthBounds = () => {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end:   now,
  };
};

const getPrevMonthBounds = () => {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    end:   new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
  };
};

// Format: ₹X.XL style
function formatINR(val) {
  if (!val) return "₹0";
  const lakh = val / 100000;
  if (lakh >= 1) return `₹${lakh.toFixed(1)}L`;
  const k = val / 1000;
  if (k >= 1) return `₹${k.toFixed(1)}K`;
  return `₹${Math.round(val)}`;
}

// Compute pct change: (curr - prev) / prev * 100
function pctChange(curr, prev) {
  if (!prev || prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

/**
 * GET /api/admin/dashboard
 * Single endpoint that powers the entire admin dashboard.
 */
export const getDashboardData = async (req, res) => {
  try {
    const thisMonth = getThisMonthBounds();
    const prevMonth = getPrevMonthBounds();

    // ── 1. GMV this month & prev month ────────────────────────────────────────
    const gmvAgg = async (start, end) => {
      const result = await Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: start, $lte: end },
          },
        },
        { $unwind: "$items" },
        {
          $match: {
            "items.itemStatus": { $nin: ["cancelled", "returned", "refunded"] },
          },
        },
        {
          $group: {
            _id: null,
            gmv: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            orders: { $addToSet: "$_id" },
          },
        },
      ]);
      return result[0] || { gmv: 0, orders: [] };
    };

    const [thisGmv, prevGmv] = await Promise.all([
      gmvAgg(thisMonth.start, thisMonth.end),
      gmvAgg(prevMonth.start, prevMonth.end),
    ]);

    const gmvValue     = thisGmv.gmv;
    const gmvOrders    = thisGmv.orders.length;
    const prevGmvValue = prevGmv.gmv;
    const prevGmvOrders = prevGmv.orders.length;

    // ── 2. Active sellers ─────────────────────────────────────────────────────
    const [activeSellers, prevActiveSellers] = await Promise.all([
      User.countDocuments({ role: "seller", isActive: { $ne: false } }),
      // prev month new: sellers created before this month
      User.countDocuments({
        role: "seller",
        isActive: { $ne: false },
        createdAt: { $lt: thisMonth.start },
      }),
    ]);

    // ── 3. Pending seller applications ────────────────────────────────────────
    const pendingApplicationsCount = await SellerApplication.countDocuments({ status: "pending" });

    // ── 4. Pending seller applications list (for table) ───────────────────────
    const pendingApplications = await SellerApplication.find({ status: "pending" })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // ── 5. Pending payouts (sum of seller earnings not yet paid out) ───────────
    // Pending = paid orders where items are in non-delivered, non-cancelled status
    const payoutAgg = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      {
        $match: {
          "items.itemStatus": { $in: ["pending", "confirmed", "processing", "shipped"] },
        },
      },
      {
        $group: {
          _id: null,
          pendingPayout: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
    ]);
    const pendingPayouts = (payoutAgg[0]?.pendingPayout || 0) * (1 - PLATFORM_FEE_PERCENT / 100);

    // ── 6. GMV chart: last 7 days ─────────────────────────────────────────────
    const now    = new Date();
    const day7   = new Date(now); day7.setDate(now.getDate() - 6); day7.setHours(0,0,0,0);
    const chartAgg = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: day7, $lte: now },
        },
      },
      { $unwind: "$items" },
      { $match: { "items.itemStatus": { $nin: ["cancelled", "returned", "refunded"] } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          gmv: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
    ]);

    // Build a map date -> gmv
    const chartMap = {};
    chartAgg.forEach(r => { chartMap[r._id] = r.gmv; });

    // Build 7 consecutive days
    const gmvChart = [];
    for (let i = 6; i >= 0; i--) {
      const d   = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      gmvChart.push({
        day:   d.toLocaleDateString('en-IN', { weekday: 'short' }),
        date:  key,
        gmv:   chartMap[key] || 0,
        label: formatINR(chartMap[key] || 0),
      });
    }

    const maxGmv = Math.max(...gmvChart.map(d => d.gmv), 1);

    // ── 7. GMV by category ────────────────────────────────────────────────────
    const catAgg = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      { $match: { "items.itemStatus": { $nin: ["cancelled", "returned", "refunded"] } } },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "prod",
        },
      },
      { $unwind: { path: "$prod", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$prod.category", "Other"] },
          gmv: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { gmv: -1 } },
    ]);

    const totalCatGmv = catAgg.reduce((s, c) => s + c.gmv, 0) || 1;
    const TOP_CATS = 5;
    const topCats  = catAgg.slice(0, TOP_CATS);
    const otherGmv = catAgg.slice(TOP_CATS).reduce((s, c) => s + c.gmv, 0);

    const categoryGmv = [
      ...topCats.map(c => ({
        name: c._id,
        gmv:  c.gmv,
        pct:  Math.round((c.gmv / totalCatGmv) * 100),
        w:    `${Math.round((c.gmv / totalCatGmv) * 100)}%`,
      })),
      ...(otherGmv > 0 ? [{
        name: 'Other',
        gmv:  otherGmv,
        pct:  Math.round((otherGmv / totalCatGmv) * 100),
        w:    `${Math.round((otherGmv / totalCatGmv) * 100)}%`,
      }] : []),
    ];

    // ── 8. Top sellers ────────────────────────────────────────────────────────
    const topSellersAgg = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      { $match: { "items.itemStatus": { $nin: ["cancelled", "returned", "refunded"] } } },
      {
        $group: {
          _id: "$items.seller",
          gmv: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { gmv: -1 } },
      { $limit: 5 },
    ]);

    const sellerIds = topSellersAgg.map(s => s._id);
    const sellerUsers = await User.find({ _id: { $in: sellerIds } }, "name avatar").lean();
    const userMap = {};
    sellerUsers.forEach(u => { userMap[u._id.toString()] = u; });

    // Avg ratings per seller
    const reviewAgg = await mongoose.connection.db.collection("reviews").aggregate([
      { $match: { seller: { $in: sellerIds } } },
      {
        $group: {
          _id: "$seller",
          avgRating: { $avg: "$rating" },
        },
      },
    ]).toArray().catch(() => []);
    const ratingMap = {};
    reviewAgg.forEach(r => { ratingMap[r._id.toString()] = r.avgRating; });

    const topSellers = topSellersAgg.map(s => {
      const sellerIdStr = s._id ? s._id.toString() : null;
      const user   = sellerIdStr ? userMap[sellerIdStr] : null;
      const rating = sellerIdStr ? ratingMap[sellerIdStr] : null;
      const name   = user?.name || "Unknown Seller";
      const inits  = name.split(' ').slice(0,2).map(w => w[0]?.toUpperCase() || '').join('');
      return {
        _id:    s._id,
        name,
        inits,
        avatar: user?.avatar || null,
        gmv:    s.gmv,
        gmvLabel: formatINR(s.gmv),
        rating: rating ? rating.toFixed(1) : null,
      };
    });

    // ── 9. "Needs attention" items ────────────────────────────────────────────
    const needsAttention = [];
    if (pendingApplicationsCount > 0) {
      needsAttention.push({
        level: 'warning',
        text: `${pendingApplicationsCount} seller${pendingApplicationsCount > 1 ? 's' : ''} pending approval`,
      });
    }
    // No dispute model yet — omit disputes rather than fabricate

    // ── 10. Open disputes (0 until dispute model exists) ─────────────────────
    const openDisputes = 0;

    // ── Assemble response ─────────────────────────────────────────────────────
    res.json({
      success: true,
      data: {
        // Header
        pendingApplicationsCount,
        openDisputes,

        // Stat cards
        gmv: {
          value: gmvValue,
          label: formatINR(gmvValue),
          pctChange: pctChange(gmvValue, prevGmvValue),
        },
        orders: {
          value: gmvOrders,
          pctChange: pctChange(gmvOrders, prevGmvOrders),
        },
        activeSellers: {
          value: activeSellers,
          newThisMonth: activeSellers - prevActiveSellers,
        },
        openDisputes: { value: openDisputes },
        pendingPayouts: {
          value: pendingPayouts,
          label: formatINR(pendingPayouts),
        },

        // Charts
        gmvChart: { data: gmvChart, maxGmv },
        categoryGmv,

        // Tables
        topSellers,
        pendingApplications: pendingApplications.map(a => ({
          _id:       a._id,
          shopName:  a.shopName,
          city:      a.city,
          status:    a.status,
          createdAt: a.createdAt,
          userName:  a.user?.name || 'Unknown',
          userEmail: a.user?.email || '',
          inits:     a.shopName.split(' ').slice(0,2).map(w => w[0]?.toUpperCase() || '').join(''),
        })),

        // Needs attention list
        needsAttention,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
