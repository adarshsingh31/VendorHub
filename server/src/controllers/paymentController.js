import Razorpay from "razorpay";
import crypto from "crypto";

import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import InventoryTransaction from "../models/InventoryTransaction.js";
import StoreProfile from "../models/StoreProfile.js";

// ─── Razorpay SDK instance ────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const DELIVERY_FEE = 49;

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Fetch authenticated user's cart,
 * refresh product prices from DB,
 * and calculate server-authoritative total.
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
  const sellerIds = [
    ...new Set(
      cart.items
        .map((item) => item.product?.seller?.toString())
        .filter(Boolean),
    ),
  ];

  const storeProfiles = await StoreProfile.find({
    seller: { $in: sellerIds },
  });

  const storeMap = new Map();

  storeProfiles.forEach((profile) => {
    storeMap.set(profile.seller.toString(), profile);
  });

  // Rebuild items using live product prices
  const items = [];
  let subtotal = 0;

  // Track seller subtotals
  const sellerSubtotals = new Map();

  for (const item of cart.items) {
    const product = item.product;

    // Product unavailable
    if (!product || product.status !== "active") {
      continue;
    }

    // Not enough stock
    if (product.stock < item.quantity) {
      continue;
    }

    const sellerIdStr = product.seller.toString();

    const storeProfile = storeMap.get(sellerIdStr);

    // Store is closed
    if (storeProfile && storeProfile.storeStatus === "closed") {
      throw new Error(`The store for ${product.name} is currently closed.`);
    }

    const lineTotal = product.price * item.quantity;

    subtotal += lineTotal;

    sellerSubtotals.set(
      sellerIdStr,
      (sellerSubtotals.get(sellerIdStr) || 0) + lineTotal,
    );

    items.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || "",
      price: product.price,
      quantity: item.quantity,
      seller: product.seller,
    });
  }

  // Nothing purchasable
  if (items.length === 0) {
    return null;
  }

  // Calculate delivery fee
  let deliveryFee = 0;

  for (const [sellerId, sellerSubtotal] of sellerSubtotals.entries()) {
    const profile = storeMap.get(sellerId);

    if (!profile || !profile.shippingEnabled) {
      continue;
    }

    const fee = profile.shippingFee ?? DELIVERY_FEE;
    const threshold = profile.freeShippingThreshold || 0;

    // Free shipping
    if (threshold > 0 && sellerSubtotal >= threshold) {
      continue;
    }

    deliveryFee += fee;
  }

  const totalAmount = subtotal + deliveryFee;

  return {
    items,
    subtotal,
    deliveryFee,
    totalAmount,
  };
}

// ─── CREATE RAZORPAY ORDER ────────────────────────────────────────────────

/**
 * POST /api/payment/create-order
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

    // Cart empty / unavailable
    if (!cartData) {
      return res.status(400).json({
        success: false,
        message:
          "Your cart is empty or contains unavailable items. Please review your cart.",
      });
    }

    const { totalAmount } = cartData;

    // Validate amount
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart amount.",
      });
    }

    // Razorpay requires amount in paise
    const amountInPaise = Math.round(totalAmount * 100);

    // Create Razorpay order
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

      // Amount in rupees
      amount: totalAmount,

      // Amount in paise
      amountInPaise,

      currency: "INR",

      // PUBLIC Razorpay key only
      keyId: process.env.RAZORPAY_KEY_ID,

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

// ─── VERIFY PAYMENT ──────────────────────────────────────────────────────

/**
 * POST /api/payment/verify
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
    } = req.body;

    // Validate payment fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields.",
      });
    }

    // Validate shipping address
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

    // Prevent duplicate order processing
    const existing = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Payment already verified.",
        order: existing,
      });
    }

    // Verify Razorpay signature
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

    // Re-fetch cart with fresh prices
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

    // Seller IDs
    const sellerIds = [
      ...new Set(
        cartData.items.map((item) => item.seller?.toString()).filter(Boolean),
      ),
    ];

    const storeProfiles = await StoreProfile.find({
      seller: { $in: sellerIds },
    });

    const storeMap = new Map();

    storeProfiles.forEach((profile) => {
      storeMap.set(profile.seller.toString(), profile);
    });

    // Apply autoConfirmOrders
    cartData.items = cartData.items.map((item) => {
      const sellerIdStr = item.seller.toString();

      const profile = storeMap.get(sellerIdStr);

      if (profile && profile.autoConfirmOrders) {
        item.itemStatus = "confirmed";
      }

      return item;
    });

    // Create order
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

    // Decrease stock
    for (const item of cartData.items) {
      const updatedProduct = await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: -item.quantity,
          },
        },
        {
          new: false,
        },
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

          user: req.user.id,
        });
      }
    }

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      {
        $set: {
          items: [],
        },
      },
    );

    return res.status(201).json({
      success: true,
      message: "Payment verified and order confirmed!",
      order,
    });
  } catch (error) {
    // Handle duplicate order
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

// ─── GET MY ORDERS ────────────────────────────────────────────────────────

/**
 * GET /api/payment/orders
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    })
      .sort({
        createdAt: -1,
      })
      .populate("items.product", "name images price");

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ─── GET ALL ORDERS ───────────────────────────────────────────────────────

/**
 * GET /api/payment/admin/orders
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({
        createdAt: -1,
      })
      .populate("user", "name email")
      .populate("items.product", "name images price");

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ─── UPDATE ORDER STATUS ──────────────────────────────────────────────────

/**
 * PUT /api/payment/admin/orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus: status,
      },
      {
        new: true,
      },
    ).populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
