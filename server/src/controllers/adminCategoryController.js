import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import cloudinary, { hasCloudinaryConfig } from "../config/cloudinary.js";

// ─── Seeder ───────────────────────────────────────────────────────────────────

/**
 * One-time seed: bootstrap the known hardcoded categories that already exist
 * as strings in existing Product documents so nothing looks orphaned.
 * Safe to call multiple times — uses upsert.
 */
export const seedDefaultCategories = async () => {
  const defaults = [
    "Electronics",
    "Fashion",
    "Home & kitchen",
    "Beauty",
    "Grocery",
    "Toys",
    "Sports",
    "Books",
  ];
  for (const name of defaults) {
    await Category.findOneAndUpdate(
      { name, parent: null },
      { name, status: "active" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uploadToCloudinary = async (file) => {
  if (!file?.buffer) throw new Error("Image buffer missing");
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "vendorhub/categories", resource_type: "image" },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
};

// ─── Public Route ─────────────────────────────────────────────────────────────

/**
 * GET /api/categories  (public — no auth)
 * Returns all active categories nested as a tree.
 * Used by seller product forms and buyer storefront.
 */
export const getPublicCategories = async (_req, res) => {
  try {
    const categories = await Category.find({ status: "active" })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Build tree: parents first, children nested
    const parents = categories.filter((c) => !c.parent);
    const children = categories.filter((c) => c.parent);

    const tree = parents.map((p) => ({
      ...p,
      subcategories: children.filter(
        (c) => c.parent.toString() === p._id.toString()
      ),
    }));

    res.json({ success: true, categories: tree });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: List + Stats ─────────────────────────────────────────────────────

/**
 * GET /api/admin/categories
 * Paginated list of all categories with real product/seller counts.
 */
export const getAdminCategories = async (req, res) => {
  try {
    // Seed defaults on first use if the collection is empty
    const count = await Category.countDocuments();
    if (count === 0) await seedDefaultCategories();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const search = req.query.search || "";
    const status = req.query.status || "all";
    const type = req.query.type || "all"; // all | parent | sub
    const sort = req.query.sort || "newest";

    const match = {};
    if (status !== "all") match.status = status;
    if (type === "parent") match.parent = null;
    if (type === "sub") match.parent = { $ne: null };
    if (search) match.name = { $regex: search, $options: "i" };

    let sortObj = {};
    switch (sort) {
      case "oldest":     sortObj = { createdAt: 1 }; break;
      case "nameAsc":    sortObj = { name: 1 }; break;
      case "nameDesc":   sortObj = { name: -1 }; break;
      case "products":   sortObj = { productCount: -1 }; break;
      default:           sortObj = { createdAt: -1 }; break;
    }

    // Get all categories matching criteria
    const allMatching = await Category.find(match)
      .populate("parent", "name")
      .lean();

    const total = allMatching.length;

    // Get product counts per category name (since products store category as string)
    const productCounts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const productCountMap = productCounts.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    // Get distinct seller count per category
    const sellerCounts = await Product.aggregate([
      { $group: { _id: { cat: "$category", seller: "$seller" } } },
      { $group: { _id: "$_id.cat", sellerCount: { $sum: 1 } } },
    ]);
    const sellerCountMap = sellerCounts.reduce((acc, row) => {
      acc[row._id] = row.sellerCount;
      return acc;
    }, {});

    const enriched = allMatching.map((cat) => ({
      ...cat,
      productCount: productCountMap[cat.name] || 0,
      sellerCount: sellerCountMap[cat.name] || 0,
    }));

    // Sort enriched list
    if (sort === "products") {
      enriched.sort((a, b) => b.productCount - a.productCount);
    } else if (sort === "nameAsc") {
      enriched.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "nameDesc") {
      enriched.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === "oldest") {
      enriched.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const paginated = enriched.slice((page - 1) * limit, page * limit);

    // Summary stats across ALL categories (not just filtered)
    const allCats = await Category.find().lean();
    const totalProductsInDB = await Product.countDocuments();
    const stats = {
      total: allCats.length,
      active: allCats.filter((c) => c.status === "active").length,
      inactive: allCats.filter((c) => c.status === "inactive").length,
      totalProducts: totalProductsInDB,
      empty: allCats.filter((c) => !productCountMap[c.name]).length,
    };

    res.json({
      success: true,
      categories: paginated,
      stats,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("getAdminCategories error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Get Single ────────────────────────────────────────────────────────

/**
 * GET /api/admin/categories/:id
 */
export const getAdminCategoryById = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id)
      .populate("parent", "name _id")
      .lean();

    if (!cat) return res.status(404).json({ success: false, message: "Category not found" });

    // Subcategories
    const subcategories = await Category.find({ parent: cat._id }).lean();

    // Products in this category
    const products = await Product.find({ category: cat.name })
      .populate("seller", "name")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const productCount = await Product.countDocuments({ category: cat.name });

    // Distinct sellers
    const distinctSellers = await Product.distinct("seller", { category: cat.name });

    // Stock stats
    const outOfStock = await Product.countDocuments({ category: cat.name, stock: 0 });
    const activeProducts = await Product.countDocuments({ category: cat.name, status: "active" });

    res.json({
      success: true,
      category: {
        ...cat,
        subcategories,
        stats: {
          productCount,
          sellerCount: distinctSellers.length,
          activeProducts,
          outOfStock,
        },
        recentProducts: products,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Create ────────────────────────────────────────────────────────────

/**
 * POST /api/admin/categories
 */
export const createAdminCategory = async (req, res) => {
  try {
    const { name, description, parent, status, displayOrder } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    // Check for duplicate
    const existing = await Category.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
      parent: parent ? new mongoose.Types.ObjectId(parent) : null,
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "A category with this name already exists" });
    }

    // Validate parent exists
    if (parent) {
      const parentCat = await Category.findById(parent);
      if (!parentCat) {
        return res.status(400).json({ success: false, message: "Invalid parent category" });
      }
      // Prevent more than 2 levels
      if (parentCat.parent) {
        return res.status(400).json({ success: false, message: "Cannot nest subcategories more than one level deep" });
      }
    }

    let imageUrl = "";
    if (req.file && hasCloudinaryConfig()) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || "",
      parent: parent || null,
      status: status || "active",
      displayOrder: displayOrder ? Number(displayOrder) : 0,
      image: imageUrl,
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Category name already exists in this level" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Update ────────────────────────────────────────────────────────────

/**
 * PATCH /api/admin/categories/:id
 */
export const updateAdminCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parent, status, displayOrder } = req.body;

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const oldName = category.name;

    // Prevent self-referential parent
    if (parent && parent.toString() === id) {
      return res.status(400).json({ success: false, message: "Category cannot be its own parent" });
    }

    // Prevent assigning a child of this category as its parent (circular)
    if (parent) {
      const parentCat = await Category.findById(parent);
      if (!parentCat) return res.status(400).json({ success: false, message: "Invalid parent category" });
      if (parentCat.parent?.toString() === id) {
        return res.status(400).json({ success: false, message: "Circular parent relationship detected" });
      }
    }

    let imageUrl = category.image;
    if (req.file && hasCloudinaryConfig()) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    const trimmedName = name?.trim() || category.name;

    await Category.findByIdAndUpdate(id, {
      name: trimmedName,
      description: description?.trim() ?? category.description,
      parent: parent !== undefined ? (parent || null) : category.parent,
      status: status || category.status,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : category.displayOrder,
      image: imageUrl,
    });

    // If name changed, update all products using the old name
    if (trimmedName !== oldName) {
      await Product.updateMany({ category: oldName }, { category: trimmedName });
    }

    const updated = await Category.findById(id).populate("parent", "name").lean();
    res.json({ success: true, category: updated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Category name already exists in this level" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Status Toggle ─────────────────────────────────────────────────────

/**
 * PATCH /api/admin/categories/:id/status
 */
export const updateAdminCategoryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Delete ────────────────────────────────────────────────────────────

/**
 * DELETE /api/admin/categories/:id
 * Blocks deletion if the category has products or subcategories.
 */
export const deleteAdminCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    // Check for subcategories
    const subcategoryCount = await Category.countDocuments({ parent: req.params.id });
    if (subcategoryCount > 0) {
      return res.status(409).json({
        success: false,
        message: `This category has ${subcategoryCount} subcategory(ies). Remove them first.`,
        code: "HAS_SUBCATEGORIES",
        subcategoryCount,
      });
    }

    // Check for products
    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(409).json({
        success: false,
        message: `This category contains ${productCount} product(s). Move them to another category before deleting.`,
        code: "HAS_PRODUCTS",
        productCount,
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Move Products ─────────────────────────────────────────────────────

/**
 * PATCH /api/admin/categories/:id/move-products
 * Move all products from this category to another.
 */
export const moveAdminCategoryProducts = async (req, res) => {
  try {
    const { targetCategoryId } = req.body;

    if (!targetCategoryId) {
      return res.status(400).json({ success: false, message: "Target category is required" });
    }

    const sourceCategory = await Category.findById(req.params.id).lean();
    if (!sourceCategory) return res.status(404).json({ success: false, message: "Source category not found" });

    const targetCategory = await Category.findById(targetCategoryId).lean();
    if (!targetCategory) return res.status(404).json({ success: false, message: "Target category not found" });

    const result = await Product.updateMany(
      { category: sourceCategory.name },
      { category: targetCategory.name }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} product(s) moved to "${targetCategory.name}"`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
