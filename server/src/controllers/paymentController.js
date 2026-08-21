import Razorpay from "razorpay";
import crypto from "crypto";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import InventoryTransaction from "../models/InventoryTransaction.js";
import StoreProfile from "../models/StoreProfile.js";

// ─── Razorpay SDK instance (lazy) ────────────────────────────────────────────
// Initialised on first use rather than at module load time.
// This prevents a missing RAZORPAY_KEY_ID from crashing the entire server
// before any request is even received.
let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        "Razorpay keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
      );
    }
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
};

const DELIVERY_FEE = 49; // ₹49 flat delivery fee

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetch the authenticated user's cart, re-fetch product prices from the DB,
 * and compute the server-authoritative order total.
 * This ensures the frontend cannot manipulate the amount.
 */
async function getCartWithFreshPrices(userId) {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name price images stock status seller",
  });

  if (!cart || cart.items.length === 0) {
    return null;
  }

  // Fetch unique sellers
  const sellerIds = [...new Set(cart.items.map(item => item.product?.seller?.toString()).filter(Boolean))];
  const storeProfiles = await StoreProfile.find({ seller: { $in: sellerIds } });
  const storeMap = new Map();
  storeProfiles.forEach(profile => storeMap.set(profile.seller.toString(), profile));

  // Rebuild items using live product prices (ignore cart.items[].price)
  const items = [];
  let subtotal = 0;
  
  // Track seller subtotals to calculate shipping later
  const sellerSubtotals = new Map();

  for (const item of cart.items) {
    const product = item.product;
    if (!product || product.status !== "active") continue;
    if (product.stock < item.quantity) continue; // skip out-of-stock items
    
    const sellerIdStr = product.seller.toString();
    const storeProfile = storeMap.get(sellerIdStr);
    
    // Block purchasing from closed stores
    if (storeProfile && storeProfile.storeStatus === "closed") {
      throw new Error(`The store for ${product.name} is currently closed.`);
    }

    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    
    sellerSubtotals.set(sellerIdStr, (sellerSubtotals.get(sellerIdStr) || 0) + lineTotal);
    
    items.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || "",
      price: product.price,
      quantity: item.quantity,
      seller: product.seller,
    });
  }

  if (items.length === 0) return null;

  // Calculate delivery fee dynamically based on seller profiles
  let deliveryFee = 0;
  for (const [sellerId, sellerSubtotal] of sellerSubtotals.entries()) {
    const profile = storeMap.get(sellerId);
    if (!profile || !profile.shippingEnabled) continue;
    
    // Default fallback fee if profile exists but fee isn't set
    const fee = profile.shippingFee ?? 49;
    const threshold = profile.freeShippingThreshold || 0;
    
    if (threshold > 0 && sellerSubtotal >= threshold) {
      // Free shipping applies for this seller
      continue;
    }
    
    deliveryFee += fee;
  }

  const totalAmount = subtotal + deliveryFee;

  return { items, subtotal, deliveryFee, totalAmount };
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/payment/create-order
 *
 * 1. Fetches cart and recomputes amount from live product prices (server-side)
 * 2. Creates a Razorpay order
 * 3. Returns razorpayOrderId, amount (₹), currency, and the PUBLIC key_id
 *    — RAZORPAY_KEY_SECRET is never included in the response
 */
export const createOrder = async (req, res) => {
  try {
    let cartData;
    try {
      cartData = await getCartWithFreshPrices(req.user.id);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to process cart.",
      });
    }

    if (!cartData) {
      return res.status(400).json({
        success: false,
        message:
          "Your cart is empty or contains unavailable items. Please review your cart.",
      });
    }

    const { totalAmount } = cartData;

    // Razorpay requires amount in paise (1 ₹ = 100 paise)
    const amountInPaise = Math.round(totalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `vh_${req.user.id}_${Date.now()}`,
      notes: {
        userId: req.user.id.toString(),
      },
    });

    return res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,         // ₹ (for display)
      amountInPaise,               // paise (for Razorpay SDK)
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID, // PUBLIC key only — no secret
      // Cart summary for the checkout page confirmation
      subtotal: cartData.subtotal,
      deliveryFee: cartData.deliveryFee,
      itemCount: cartData.items.length,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order. Please try again.",
    });
  }
};

/**
 * POST /api/payment/verify
 *
 * Razorpay payment verification — the ONLY place an order gets marked 'paid'.
 *
 * Receives: razorpay_order_id, razorpay_payment_id, razorpay_signature,
 *           shippingAddress
 *
 * 1. Reconstructs the HMAC-SHA256 signature on the backend using KEY_SECRET
 * 2. Compares to the signature sent by Razorpay's checkout SDK
 * 3. Only on match: creates Order, marks paymentStatus='paid', clears Cart
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
    } = req.body;

    // ── 1. Validate required fields ──────────────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields.",
      });
    }

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.addressLine1 ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is incomplete.",
      });
    }

    // ── 2. Prevent duplicate order processing ────────────────────────────────
    const existing = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Payment already verified.",
        order: existing,
      });
    }

    // ── 3. Verify HMAC-SHA256 signature — backend only ──────────────────────
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Signature mismatch.",
      });
    }

    // ── 4. Re-fetch cart with fresh prices (authoritative amount) ────────────
    let cartData;
    try {
      cartData = await getCartWithFreshPrices(req.user.id);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to process cart.",
      });
    }
    
    if (!cartData) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty or contains unavailable items.",
      });
    }

    // ── 4b. Apply seller-specific autoConfirmOrders logic ────────────────────
    const sellerIds = [...new Set(cartData.items.map(item => item.seller?.toString()).filter(Boolean))];
    const storeProfiles = await StoreProfile.find({ seller: { $in: sellerIds } });
    const storeMap = new Map();
    storeProfiles.forEach(profile => storeMap.set(profile.seller.toString(), profile));

    cartData.items = cartData.items.map(item => {
      const sellerIdStr = item.seller.toString();
      const profile = storeMap.get(sellerIdStr);
      if (profile && profile.autoConfirmOrders) {
        item.itemStatus = "confirmed";
      }
      return item;
    });

    // ── 5. Create the Order document ─────────────────────────────────────────
    const order = await Order.create({
      user: req.user.id,
      items: cartData.items,
      shippingAddress,
      subtotal: cartData.subtotal,
      deliveryFee: cartData.deliveryFee,
      totalAmount: cartData.totalAmount,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      orderStatus: "confirmed",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paidAt: new Date(),
    });

    // ── 5.5 Decrement Stock ──────────────────────────────────────────────────
    for (const item of cartData.items) {
      const updatedProduct = await Product.findByIdAndUpdate(
        item.product, 
        { $inc: { stock: -item.quantity } },
        { new: false } // Returns the old document so we know previousStock
      );
      
      if (updatedProduct) {
        await InventoryTransaction.create({
          product: updatedProduct._id,
          seller: updatedProduct.seller,
          previousStock: updatedProduct.stock,
          change: -item.quantity,
          newStock: updatedProduct.stock - item.quantity,
          reason: "ORDER_PLACED",
          orderId: order._id,
          user: req.user.id
        });
      }
    }

    // ── 6. Clear the user's cart ─────────────────────────────────────────────
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $set: { items: [] } }
    );

    return res.status(201).json({
      success: true,
      message: "Payment verified and order confirmed!",
      order,
    });
  } catch (error) {
    // Handle duplicate razorpayOrderId (race condition)
    if (error.code === 11000) {
      const existing = await Order.findOne({
        razorpayOrderId: req.body.razorpay_order_id,
      });
      return res.status(200).json({
        success: true,
        message: "Payment already verified.",
        order: existing,
      });
    }
    console.error("Verify Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed. Please contact support.",
    });
  }
};

/**
 * GET /api/payment/orders
 * Returns all orders for the authenticated user, newest first.
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name images price");

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get Orders Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/payment/admin/orders
 * Admin route to get all orders in the platform
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("items.product", "name images price");

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * PUT /api/payment/admin/orders/:id/status
 * Admin route to update the status of an order
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    ).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
