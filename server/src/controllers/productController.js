import mongoose from "mongoose";
import Product from "../models/Product.js";
import cloudinary, { hasCloudinaryConfig } from "../config/cloudinary.js";

const uploadImageToCloudinary = async (file) => {
  if (!file || !file.buffer) {
    throw new Error("Image buffer is missing.");
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "vendorhub/products",
        resource_type: "image",
      },
      (error, uploadResult) => {
        if (error) {
          return reject(error);
        }

        resolve(uploadResult);
      },
    );

    stream.end(file.buffer);
  });

  return result.secure_url;
};

const getCloudinaryPublicId = (imageUrl) => {
  try {
    const parsedUrl = new URL(imageUrl);
    const pathname = decodeURIComponent(parsedUrl.pathname || "");
    const uploadIndex = pathname.indexOf("/upload/");

    if (uploadIndex === -1) {
      return null;
    }

    const resourcePath = pathname.substring(uploadIndex + "/upload/".length);
    if (!resourcePath) {
      return null;
    }

    return resourcePath.replace(/\.[^/.]+$/, "");
  } catch (error) {
    return null;
  }
};

const deleteCloudinaryImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("cloudinary.com")) {
    return;
  }

  const publicId = getCloudinaryPublicId(imageUrl);

  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn(
      "Cloudinary delete skipped for image:",
      imageUrl,
      error.message,
    );
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      price,
      originalPrice,
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

    if (!hasCloudinaryConfig()) {
      return res.status(500).json({
        success: false,
        message:
          "Cloudinary is not configured. Add valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET values to server/.env.",
      });
    }

    const uploadedFiles = Array.isArray(req.files) ? req.files : [];

    if (!uploadedFiles.length) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one product image.",
      });
    }

    const imageUrls = [];

    for (const file of uploadedFiles) {
      const secureUrl = await uploadImageToCloudinary(file);
      imageUrls.push(secureUrl);
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
      images: imageUrls,
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
      message: error.message || "Server error while creating product",
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

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this product",
      });
    }

    const {
      name,
      description,
      category,
      subcategory,
      price,
      originalPrice,
      stock,
      sku,
      status,
      existingImages,
    } = req.body;

    const safeName = name !== undefined ? String(name).trim() : product.name;
    const safeDescription =
      description !== undefined
        ? String(description).trim()
        : product.description;
    const safeCategory =
      category !== undefined ? String(category).trim() : product.category;
    const safePrice =
      price !== undefined ? Number(price) : Number(product.price);
    const safeStock =
      stock !== undefined ? Number(stock) : Number(product.stock);

    if (
      !safeName ||
      !safeDescription ||
      !safeCategory ||
      safePrice === undefined ||
      safeStock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (safePrice < 0 || safeStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Price and stock cannot be negative",
      });
    }

    const parsedExistingImages = (() => {
      if (!existingImages) {
        return product.images || [];
      }

      try {
        const value = JSON.parse(existingImages);
        return Array.isArray(value) ? value : product.images || [];
      } catch (error) {
        return product.images || [];
      }
    })();

    const nextExistingImages = Array.isArray(parsedExistingImages)
      ? parsedExistingImages
      : [];

    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    const newImageUrls = [];

    if (!hasCloudinaryConfig()) {
      return res.status(500).json({
        success: false,
        message:
          "Cloudinary is not configured. Add valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET values to server/.env.",
      });
    }

    for (const file of uploadedFiles) {
      const secureUrl = await uploadImageToCloudinary(file);
      newImageUrls.push(secureUrl);
    }

    const finalImages = [...nextExistingImages, ...newImageUrls];

    if (finalImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please keep at least one product image.",
      });
    }

    if (finalImages.length > 5) {
      return res.status(400).json({
        success: false,
        message: "You can upload up to 5 product images in total.",
      });
    }

    const removedImages = (product.images || []).filter(
      (imageUrl) => !nextExistingImages.includes(imageUrl),
    );

    for (const imageUrl of removedImages) {
      await deleteCloudinaryImage(imageUrl);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: safeName,
        description: safeDescription,
        category: safeCategory,
        subcategory:
          subcategory !== undefined ? subcategory : product.subcategory,
        price: safePrice,
        originalPrice:
          originalPrice === undefined
            ? product.originalPrice
            : Number(originalPrice),
        stock: safeStock,
        sku: sku !== undefined ? String(sku).trim() : product.sku,
        status: status || product.status,
        images: finalImages,
      },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists",
      });
    }

    console.error("Update Product Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error while updating product",
    });
  }
};

export default {
  createProduct,
  getSellerProducts,
  getProductById,
  updateProduct,
};
