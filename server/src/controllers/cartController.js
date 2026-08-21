import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @route   GET /api/cart
// @desc    Get user cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.product",
      populate: { path: "seller", select: "name storeName" }
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Get Cart Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @route   POST /api/cart
// @desc    Add item to cart or increase quantity
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Product exists in cart, update quantity
      cart.items[itemIndex].quantity += Number(quantity);
      // update price to current price
      cart.items[itemIndex].price = product.price;
    } else {
      // Product does not exist in cart, add new item
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        price: product.price,
      });
    }

    await cart.save();
    
    // Populate for response
    await cart.populate({
      path: "items.product",
      populate: { path: "seller", select: "name storeName" }
    });

    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @route   PUT /api/cart/:productId
// @desc    Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      await cart.populate({
        path: "items.product",
        populate: { path: "seller", select: "name storeName" }
      });
      return res.status(200).json({ success: true, cart });
    } else {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }
  } catch (error) {
    console.error("Update Cart Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();
    
    await cart.populate({
      path: "items.product",
      populate: { path: "seller", select: "name storeName" }
    });

    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Remove from Cart Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
