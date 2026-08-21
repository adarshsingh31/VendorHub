import Product from "../models/Product.js";
import InventoryTransaction from "../models/InventoryTransaction.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

/**
 * GET /api/inventory/seller
 * Fetches all products for the seller with dynamic inventory status and total sales.
 */
export const getSellerInventory = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Fetch products
    const products = await Product.find({ seller: sellerId })
      .select("name images sku price stock lowStockThreshold status")
      .sort({ createdAt: -1 });

    // 2. Fetch aggregate total sold per product
    const salesAggregation = await Order.aggregate([
      { $match: { "items.seller": sellerId } },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId } },
      {
        $group: {
          _id: "$items.product",
          unitsSold: { $sum: "$items.quantity" }
        }
      }
    ]);

    const salesMap = {};
    salesAggregation.forEach(item => {
      salesMap[item._id.toString()] = item.unitsSold;
    });

    // 3. Map to UI format
    let totalStockUnits = 0;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let inventoryValue = 0;

    const inventoryList = products.map(product => {
      const stock = product.stock;
      const threshold = product.lowStockThreshold || 10;
      
      let stockStatus = "IN_STOCK";
      if (stock === 0) {
        stockStatus = "OUT_OF_STOCK";
        outOfStock++;
      } else if (stock <= threshold) {
        stockStatus = "LOW_STOCK";
        lowStock++;
      } else {
        inStock++;
      }

      totalStockUnits += stock;
      inventoryValue += (stock * product.price);

      return {
        productId: product._id,
        productName: product.name,
        image: product.images?.[0] || "",
        sku: product.sku || "N/A",
        price: product.price,
        stock: stock,
        lowStockThreshold: threshold,
        status: stockStatus,
        totalSold: salesMap[product._id.toString()] || 0,
        inventoryValue: stock * product.price
      };
    });

    res.status(200).json({
      success: true,
      summary: {
        totalProducts: products.length,
        totalStockUnits,
        inStock,
        lowStock,
        outOfStock,
        inventoryValue
      },
      inventory: inventoryList
    });

  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * PATCH /api/inventory/seller/:productId
 * Updates product stock and creates a transaction
 */
export const updateProductStock = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { productId } = req.params;
    const { change, reason, lowStockThreshold, overrideStock } = req.body;

    const product = await Product.findOne({ _id: productId, seller: sellerId });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
    }

    if (lowStockThreshold !== undefined) {
      product.lowStockThreshold = lowStockThreshold;
    }

    let actualChange = 0;
    const previousStock = product.stock;

    if (overrideStock !== undefined) {
      if (overrideStock < 0) return res.status(400).json({ success: false, message: "Stock cannot be negative" });
      actualChange = overrideStock - previousStock;
      product.stock = overrideStock;
    } else if (change !== undefined) {
      if (product.stock + change < 0) return res.status(400).json({ success: false, message: `Only ${product.stock} units available to remove.` });
      actualChange = change;
      product.stock += change;
    }

    await product.save();

    if (actualChange !== 0) {
      await InventoryTransaction.create({
        product: product._id,
        seller: sellerId,
        previousStock,
        change: actualChange,
        newStock: product.stock,
        reason: reason || (actualChange > 0 ? "RESTOCK" : "MANUAL_ADJUSTMENT"),
        user: req.user.id
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold
    });

  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * GET /api/inventory/seller/:productId/history
 * Fetch inventory history for a product
 */
export const getProductInventoryHistory = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { productId } = req.params;

    // Verify ownership
    const product = await Product.findOne({ _id: productId, seller: sellerId });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
    }

    const history = await InventoryTransaction.find({ product: productId, seller: sellerId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      history
    });

  } catch (error) {
    console.error("Error fetching inventory history:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
