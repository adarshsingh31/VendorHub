import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

// ─── Buyer: Submit a Review ───────────────────────────────────────────────────

/**
 * POST /api/reviews
 * Authenticated buyer submits a review for a product they purchased.
 */
export const submitReview = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { productId, orderId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: "productId, rating, and comment are required." });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    // Verify purchase if orderId is provided
    let verifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        user: buyerId,
        "items.product": productId,
        paymentStatus: "paid",
      });
      verifiedPurchase = !!order;
    }

    // Upsert — update if buyer already reviewed this product
    const review = await Review.findOneAndUpdate(
      { product: productId, buyer: buyerId },
      {
        order: orderId || null,
        rating,
        comment: comment.trim(),
        verifiedPurchase,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, message: "Review submitted!", review });
  } catch (error) {
    console.error("Submit review error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─── Seller: Get Reviews ──────────────────────────────────────────────────────

/**
 * GET /api/reviews/seller
 * Returns paginated reviews for all products belonging to the authenticated seller.
 * Query params: productId, rating, search, sort, page, limit
 */
export const getSellerReviews = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { productId, rating, search, sort = "newest", page = 1, limit = 20 } = req.query;

    // 1. Get all product IDs owned by this seller
    const productFilter = { seller: sellerId };
    if (productId) productFilter._id = productId;
    const sellerProducts = await Product.find(productFilter).select("_id name images");

    if (sellerProducts.length === 0) {
      return res.status(200).json({ success: true, reviews: [], total: 0, pages: 0 });
    }
    const productIds = sellerProducts.map((p) => p._id);

    // 2. Build review query
    const query = { product: { $in: productIds } };
    if (rating) query.rating = Number(rating);

    // 3. Fetch and populate
    let reviews = await Review.find(query)
      .populate("product", "name images")
      .populate("buyer", "name avatar email")
      .sort({ createdAt: -1 }) // fetch newest first, we'll re-sort below
      .lean();

    // 4. Search filter (JS-side, reviews dataset is per-seller so bounded)
    if (search) {
      const s = search.toLowerCase();
      reviews = reviews.filter(
        (r) =>
          r.comment.toLowerCase().includes(s) ||
          r.product?.name?.toLowerCase().includes(s) ||
          r.buyer?.name?.toLowerCase().includes(s)
      );
    }

    // 5. Sort
    reviews.sort((a, b) => {
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "rating_high") return b.rating - a.rating;
      if (sort === "rating_low") return a.rating - b.rating;
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

    // 6. Paginate
    const total = reviews.length;
    const skip = (page - 1) * limit;
    const paginated = reviews.slice(skip, skip + Number(limit));

    // 7. Compute per-product rating summary for the filter sidebar
    const productSummary = sellerProducts.map((p) => {
      const productReviews = reviews.filter((r) => r.product?._id?.toString() === p._id.toString());
      const avg = productReviews.length
        ? Math.round((productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length) * 10) / 10
        : null;
      return {
        productId: p._id,
        name: p.name,
        image: p.images?.[0] || "",
        reviewCount: productReviews.length,
        avgRating: avg,
      };
    });

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      reviews: paginated,
      productSummary,
    });
  } catch (error) {
    console.error("Get seller reviews error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─── Public: Get Product Reviews ──────────────────────────────────────────────

/**
 * GET /api/reviews/product/:productId
 * Public endpoint for fetching reviews of a specific product (for buyer-facing pages).
 */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ product: productId })
      .populate("buyer", "name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Review.countDocuments({ product: productId });
    const avgRating = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limit),
      avgRating: Math.round(avgRating * 10) / 10,
      reviews,
    });
  } catch (error) {
    console.error("Get product reviews error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
