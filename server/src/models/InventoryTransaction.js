import mongoose from "mongoose";

const inventoryTransactionSchema = new mongoose.Schema(
  {
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
    previousStock: {
      type: Number,
      required: true,
    },
    change: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      enum: ["RESTOCK", "ORDER_PLACED", "ORDER_CANCELLED", "MANUAL_ADJUSTMENT", "RETURN", "REFUND"],
      required: true,
    },
    orderId: {
      type: String, // String or ObjectId, storing Razorpay/Order ID if applicable
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The person making the change (seller, admin, or system via buyer)
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("InventoryTransaction", inventoryTransactionSchema);
