import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    subcategory: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    originalPrice: {
      type: Number,
      min: 0,
    },

    images: {
      type: [String],
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },

    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    status: {
      type: String,
      enum: ["draft", "active", "inactive", "blocked"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for common query patterns
productSchema.index({ seller: 1, status: 1 });           // Seller product listing
productSchema.index({ category: 1, status: 1 });          // Category browsing
productSchema.index({ status: 1, createdAt: -1 });        // Admin product listing
productSchema.index({ name: "text", description: "text" }); // Full-text search

export default mongoose.model("Product", productSchema);
