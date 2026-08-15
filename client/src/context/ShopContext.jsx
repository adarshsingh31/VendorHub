import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import * as cartSvc from "../services/cartService";
import * as wishlistSvc from "../services/wishlistService";

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const { isAuthenticated, role } = useAuth();

  const [cartItems, setCartItems] = useState([]); // [{ product, quantity, price }]
  const [wishlistProductIds, setWishlistProductIds] = useState(new Set()); // Set of product ids
  const [wishlistItems, setWishlistItems] = useState([]); // full product objects

  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Track in-flight per-product actions to prevent double clicks
  const pendingCartRef = useRef(new Set());
  const pendingWishlistRef = useRef(new Set());

  const isBuyer = isAuthenticated && role === "buyer";

  // ─── Initial Load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isBuyer) {
      setCartItems([]);
      setWishlistProductIds(new Set());
      setWishlistItems([]);
      return;
    }
    fetchCart();
    fetchWishlist();
  }, [isBuyer]);

  const fetchCart = useCallback(async () => {
    try {
      setCartLoading(true);
      const data = await cartSvc.getCart();
      if (data.success) setCartItems(data.cart.items || []);
    } catch {
      // silently fail on initial load
    } finally {
      setCartLoading(false);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    try {
      setWishlistLoading(true);
      const data = await wishlistSvc.getWishlist();
      if (data.success) {
        const products = data.wishlist.products || [];
        setWishlistItems(products);
        setWishlistProductIds(new Set(products.map((p) => (p._id || p).toString())));
      }
    } catch {
      // silently fail on initial load
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  // ─── Cart Derived State ──────────────────────────────────────────────────────
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const getCartItem = useCallback(
    (productId) => cartItems.find((i) => (i.product?._id || i.product)?.toString() === productId?.toString()),
    [cartItems]
  );

  const isInCart = useCallback(
    (productId) => !!getCartItem(productId),
    [getCartItem]
  );

  // ─── Wishlist Derived State ──────────────────────────────────────────────────
  const wishlistCount = wishlistProductIds.size;

  const isInWishlist = useCallback(
    (productId) => wishlistProductIds.has(productId?.toString()),
    [wishlistProductIds]
  );

  // ─── Actions ────────────────────────────────────────────────────────────────

  /**
   * Add to cart or increment quantity if already present.
   * Returns { success, error }
   */
  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (!isBuyer) return { success: false, error: "Please login as a buyer." };
      if (pendingCartRef.current.has(productId)) return { success: false, error: "Request in progress." };

      pendingCartRef.current.add(productId);

      // Optimistic update
      setCartItems((prev) => {
        const idx = prev.findIndex((i) => (i.product?._id || i.product)?.toString() === productId);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
          return updated;
        }
        return [...prev, { product: { _id: productId }, quantity, price: 0 }];
      });

      try {
        const data = await cartSvc.addToCart(productId, quantity);
        if (data.success) {
          setCartItems(data.cart.items || []);
          pendingCartRef.current.delete(productId);
          return { success: true };
        } else {
          throw new Error(data.message || "Failed to add to cart");
        }
      } catch (err) {
        // Rollback – re-fetch from server
        await fetchCart();
        pendingCartRef.current.delete(productId);
        return { success: false, error: err.response?.data?.message || "Failed to add to cart." };
      }
    },
    [isBuyer, fetchCart]
  );

  /**
   * Update the quantity of an existing cart item.
   * Returns { success, error }
   */
  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (!isBuyer) return { success: false, error: "Not authenticated." };
      if (quantity < 1) return removeFromCart(productId);

      // Optimistic update
      setCartItems((prev) =>
        prev.map((item) =>
          (item.product?._id || item.product)?.toString() === productId
            ? { ...item, quantity }
            : item
        )
      );

      try {
        const data = await cartSvc.updateCartItem(productId, quantity);
        if (data.success) {
          setCartItems(data.cart.items || []);
          return { success: true };
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        await fetchCart();
        return { success: false, error: err.response?.data?.message || "Failed to update cart." };
      }
    },
    [isBuyer, fetchCart]
  );

  /**
   * Remove a product from the cart.
   * Returns { success, error }
   */
  const removeFromCart = useCallback(
    async (productId) => {
      if (!isBuyer) return { success: false, error: "Not authenticated." };

      // Optimistic remove
      setCartItems((prev) =>
        prev.filter((i) => (i.product?._id || i.product)?.toString() !== productId)
      );

      try {
        const data = await cartSvc.removeFromCart(productId);
        if (data.success) {
          setCartItems(data.cart.items || []);
          return { success: true };
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        await fetchCart();
        return { success: false, error: err.response?.data?.message || "Failed to remove from cart." };
      }
    },
    [isBuyer, fetchCart]
  );

  /**
   * Toggle wishlist for a product.
   * Returns { success, added, error }
   */
  const toggleWishlist = useCallback(
    async (productId) => {
      if (!isBuyer) return { success: false, error: "Please login as a buyer." };
      if (pendingWishlistRef.current.has(productId)) return { success: false, error: "Request in progress." };

      pendingWishlistRef.current.add(productId);
      const wasInWishlist = wishlistProductIds.has(productId);

      // Optimistic update
      setWishlistProductIds((prev) => {
        const next = new Set(prev);
        wasInWishlist ? next.delete(productId) : next.add(productId);
        return next;
      });

      try {
        const data = await wishlistSvc.toggleWishlist(productId);
        if (data.success) {
          const products = data.wishlist.products || [];
          setWishlistItems(products);
          setWishlistProductIds(new Set(products.map((p) => (p._id || p).toString())));
          pendingWishlistRef.current.delete(productId);
          return { success: true, added: !wasInWishlist };
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        // Rollback
        setWishlistProductIds((prev) => {
          const next = new Set(prev);
          wasInWishlist ? next.add(productId) : next.delete(productId);
          return next;
        });
        pendingWishlistRef.current.delete(productId);
        return { success: false, error: err.response?.data?.message || "Failed to update wishlist." };
      }
    },
    [isBuyer, wishlistProductIds]
  );

  return (
    <ShopContext.Provider
      value={{
        // Cart
        cartItems,
        cartCount,
        cartLoading,
        isInCart,
        getCartItem,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart: fetchCart,
        // Wishlist
        wishlistItems,
        wishlistProductIds,
        wishlistCount,
        wishlistLoading,
        isInWishlist,
        toggleWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider>");
  return ctx;
}
