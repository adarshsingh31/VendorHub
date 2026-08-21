import Order from "../models/Order.js";
import Product from "../models/Product.js";
import InventoryTransaction from "../models/InventoryTransaction.js";
import mongoose from "mongoose";

/**
 * GET /api/orders/seller
 * Authenticate seller, return orders containing their products
 */
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = { "items.seller": sellerId };
    
    let orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    // We need to filter items in each order to ONLY include the seller's items.
    let mappedOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(item => item.seller.toString() === sellerId);
      
      // Calculate seller's partial total
      orderObj.sellerSubtotal = orderObj.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      return orderObj;
    });

    // Apply item status filter
    if (status && status !== 'all') {
      mappedOrders = mappedOrders.filter(order => order.items.some(item => item.itemStatus === status));
    }

    // Apply search filter (order ID, buyer name, etc)
    if (search) {
      const s = search.toLowerCase();
      mappedOrders = mappedOrders.filter(order => 
        order._id.toString().toLowerCase().includes(s) ||
        (order.user && order.user.name.toLowerCase().includes(s)) ||
        order.items.some(item => item.name.toLowerCase().includes(s))
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedOrders = mappedOrders.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      count: mappedOrders.length,
      page: Number(page),
      pages: Math.ceil(mappedOrders.length / limit),
      orders: paginatedOrders
    });

  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * GET /api/orders/seller/:id
 */
export const getSellerOrderById = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const orderId = req.params.id;

    const order = await Order.findOne({ _id: orderId, "items.seller": sellerId })
      .populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found or no items belong to you" });
    }

    const orderObj = order.toObject();
    orderObj.items = orderObj.items.filter(item => item.seller.toString() === sellerId);
    orderObj.sellerSubtotal = orderObj.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    res.status(200).json({ success: true, order: orderObj });

  } catch (error) {
    console.error("Error fetching seller order details:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * PATCH /api/orders/seller/:id/item/:itemId/status
 */
export const updateSellerOrderItemStatus = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { id: orderId, itemId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    // Find the order that has this item belonging to this seller
    const order = await Order.findOne({ _id: orderId, "items._id": itemId, "items.seller": sellerId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order item not found or you are not authorized" });
    }

    // Update the specific item's status
    const item = order.items.id(itemId);
    const oldStatus = item.itemStatus;
    item.itemStatus = status;
    
    await order.save();

    // If status changed to cancelled, restore stock
    if (status === "cancelled" && oldStatus !== "cancelled") {
      const updatedProduct = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { new: false } // Returns old document
      );

      if (updatedProduct) {
        await InventoryTransaction.create({
          product: updatedProduct._id,
          seller: updatedProduct.seller,
          previousStock: updatedProduct.stock,
          change: item.quantity,
          newStock: updatedProduct.stock + item.quantity,
          reason: "ORDER_CANCELLED",
          orderId: order._id,
          user: req.user.id
        });
      }
    }

    res.status(200).json({ success: true, message: "Item status updated successfully", itemStatus: item.itemStatus });

  } catch (error) {
    console.error("Error updating item status:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * GET /api/orders/seller/product-sales
 */
export const getProductSalesSummary = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    const aggregation = await Order.aggregate([
      { $match: { "items.seller": sellerId } },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId } },
      {
        $group: {
          _id: "$items.product",
          productName: { $first: "$items.name" },
          productImage: { $first: "$items.image" },
          buyersSet: { $addToSet: "$user" },
          ordersSet: { $addToSet: "$_id" },
          unitsSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: 1,
          productImage: 1,
          uniqueBuyers: { $size: "$buyersSet" },
          orders: { $size: "$ordersSet" },
          unitsSold: 1,
          revenue: 1
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const topLevelAggregation = await Order.aggregate([
      { $match: { "items.seller": sellerId } },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId } },
      {
        $group: {
          _id: null,
          totalOrdersSet: { $addToSet: "$_id" },
          uniqueBuyersSet: { $addToSet: "$user" },
          totalUnitsSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      }
    ]);

    const summary = topLevelAggregation.length > 0 ? {
      totalOrders: topLevelAggregation[0].totalOrdersSet.length,
      uniqueBuyers: topLevelAggregation[0].uniqueBuyersSet.length,
      productsSold: topLevelAggregation[0].totalUnitsSold,
      totalRevenue: topLevelAggregation[0].totalRevenue
    } : { totalOrders: 0, uniqueBuyers: 0, productsSold: 0, totalRevenue: 0 };

    res.status(200).json({
      success: true,
      summary,
      productSales: aggregation
    });

  } catch (error) {
    console.error("Error fetching product sales summary:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * GET /api/orders/seller/product-sales/:productId
 */
export const getProductSalesDetails = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);
    const productId = new mongoose.Types.ObjectId(req.params.productId);

    const orders = await Order.find({
      "items.product": productId,
      "items.seller": sellerId
    }).populate("user", "name email").sort({ createdAt: -1 });

    const buyers = [];
    let uniqueBuyersSet = new Set();
    let totalOrders = 0;
    let unitsSold = 0;
    let revenue = 0;
    let productName = "";
    let productImage = "";

    orders.forEach(order => {
      const item = order.items.find(i => 
        i.product.toString() === productId.toString() && 
        i.seller.toString() === sellerId.toString()
      );

      if (item) {
        if (!productName) productName = item.name;
        if (!productImage) productImage = item.image;

        uniqueBuyersSet.add(order.user._id.toString());
        totalOrders++;
        unitsSold += item.quantity;
        const amount = item.price * item.quantity;
        revenue += amount;

        buyers.push({
          buyerName: order.user.name,
          buyerEmail: order.user.email,
          quantity: item.quantity,
          amount: amount,
          orderId: order._id,
          orderDate: order.createdAt,
          paymentStatus: order.paymentStatus,
          orderStatus: item.itemStatus
        });
      }
    });

    res.status(200).json({
      success: true,
      productDetails: {
        productId,
        productName,
        productImage,
        uniqueBuyers: uniqueBuyersSet.size,
        orders: totalOrders,
        unitsSold,
        revenue
      },
      buyers
    });

  } catch (error) {
    console.error("Error fetching product sales details:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
