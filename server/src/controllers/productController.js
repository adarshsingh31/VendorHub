import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      price,
      originalPrice,
      images,
      stock,
      sku,
      status,
    } = req.body;

    if (
      !name ||
      !description ||
      !category ||
      price === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (Number(price) < 0 || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price and stock cannot be negative",
      });
    }

    if (originalPrice !== undefined && Number(originalPrice) < Number(price)) {
      return res.status(400).json({
        success: false,
        message: "Original price cannot be less than selling price",
      });
    }

    const product = await Product.create({
      seller: req.user.id,
      name,
      description,
      category,
      subcategory,
      price: Number(price),
      originalPrice:
        originalPrice === undefined ? undefined : Number(originalPrice),
      images: Array.isArray(images) ? images : [],
      stock: Number(stock),
      sku,
      status: status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists",
      });
    }

    console.error("Create Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating product",
    });
  }
};

export const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get Seller Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name email",
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export default {
  createProduct,
  getSellerProducts,
  getProductById,
};
