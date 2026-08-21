import mongoose from "mongoose";

/**
 * SellerApplication — tracks a buyer's request to become a seller.
 *
 * Status lifecycle:
 *   pending  → admin reviews → approved | rejected
 *
 * Only one pending application per user is allowed at a time.
 * The unique partial index below enforces this at the DB level.
 */
const sellerApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    shopDescription: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    shopAddress: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Admin's rejection reason — populated only on rejection
    adminNote: {
      type: String,
      default: null,
    },
    // Timestamp when admin took action
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

// Prevent a user from submitting multiple pending applications.
// This is a sparse partial index — it only enforces uniqueness when
// status === 'pending', so rejected/approved applications don't block resubmission.
sellerApplicationSchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
    name: "unique_pending_per_user",
  }
);

const SellerApplication = mongoose.model(
  "SellerApplication",
  sellerApplicationSchema
);

export default SellerApplication;
