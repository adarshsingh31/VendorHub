import mongoose from "mongoose";

/**
 * Review — a buyer's rating and comment for a purchased product.
 *
 * Business rules:
 *   - One review per buyer per product (enforced via compound index).
 *   - A review is "verified" when the buyer's orderId is confirmed as a
 *     real paid order containing that product.
 */
const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    // Automatically set true when the order reference is a valid paid order
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// One review per buyer per product
reviewSchema.index({ product: 1, buyer: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
