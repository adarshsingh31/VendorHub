import mongoose from "mongoose";

/**
 * Category — represents a product category in VendorHub.
 *
 * Supports a two-level hierarchy:
 *   Parent (e.g. Electronics)
 *     └── Subcategory (e.g. Mobiles)
 *
 * The `parent` field is null for top-level categories.
 * Categories are referenced from Product.category (by name string, for
 * backward compat) and can also be referenced by ID in future versions.
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Cloudinary URL for category image/icon
    image: {
      type: String,
      default: "",
    },

    // null = top-level/parent category
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // Optional: controls display ordering in buyer-facing UI
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Unique name within a parent scope
// (two different parents can have a child called "Men")
categorySchema.index({ name: 1, parent: 1 }, { unique: true });

// Auto-generate slug from name before saving
categorySchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
  next();
});

export default mongoose.model("Category", categorySchema);
