import mongoose from "mongoose";

/**
 * Order — persists a completed purchase after Razorpay payment verification.
 *
 * Lifecycle:
 *   Cart → create-order (Razorpay order) → user pays in modal
 *   → verify (backend HMAC check) → Order created {paymentStatus:'paid'}
 *   → Cart cleared
 */

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Snapshot fields — stored so order history stays accurate even if
  // the product is later edited or deleted.
  name: { type: String, required: true },
  image: { type: String, default: "" },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  itemStatus: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ],
    default: "pending",
  },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String, default: "" },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: "India" },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },

    // Amounts (stored in ₹, NOT paise)
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // Payment
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      default: "razorpay",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Razorpay IDs — populated only after successful verification
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    paidAt: { type: Date, default: null },

    // Fulfilment
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Prevent duplicate order creation for the same Razorpay order ID
orderSchema.index({ razorpayOrderId: 1 }, { sparse: true, unique: true });

// Compound indexes for common query patterns
orderSchema.index({ user: 1, createdAt: -1 });              // Buyer order history
orderSchema.index({ "items.seller": 1, createdAt: -1 });    // Seller order list
orderSchema.index({ paymentStatus: 1, createdAt: -1 });     // Dashboard GMV aggregations
orderSchema.index({ orderStatus: 1 });                      // Admin order filtering
orderSchema.index({ createdAt: -1 });                       // Reports date-range queries

const Order = mongoose.model("Order", orderSchema);
export default Order;
