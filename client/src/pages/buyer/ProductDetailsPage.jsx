import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2, ArrowLeft, Store, Check, AlertCircle,
  Heart, ShoppingCart, Minus, Plus,
} from "lucide-react";
import { getProductById } from "../../services/productService";
import { useShop } from "../../context/ShopContext";

const C = {
  cream: "#F5F1E8",
  white: "#FFFFFF",
  navyDark: "#1E2A47",
  navyMed: "#3D4A66",
  navySoft: "#5B6785",
  orange: "#E8A33D",
  orangeDeep: "#D4922E",
  orangeSoft: "#FBE9CF",
  orangeSofter: "#FCEFDA",
  border: "#E6E0D2",
  muted: "#948F82",
  danger: "#C1543C",
};

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  const {
    isInWishlist, toggleWishlist,
    isInCart, getCartItem, addToCart,
  } = useShop();

  const [wishlistPending, setWishlistPending] = useState(false);
  const [cartPending, setCartPending] = useState(false);
  const [msg, setMsg] = useState(null);

  const showMsg = (text, type = "ok") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 2500);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        if (data.success) setProduct(data.product);
        else setError("Failed to load product details.");
      } catch (err) {
        setError(err.response?.data?.message || "Product not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 size={32} style={{ color: C.orange }} className="animate-spin mb-4" />
        <p style={{ color: C.navyMed }} className="text-sm">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.navyDark }}>Product Not Found</h2>
        <p className="mb-6" style={{ color: C.navyMed }}>{error}</p>
        <button onClick={() => navigate("/buyer/products")} className="px-6 py-2.5 rounded-lg font-bold text-sm bg-white border shadow-sm hover:bg-gray-50" style={{ borderColor: C.border, color: C.navyDark }}>
          Back to Products
        </button>
      </div>
    );
  }

  const inWishlist = isInWishlist(id);
  const inCart = isInCart(id);
  const cartItem = getCartItem(id);
  const cartQty = cartItem?.quantity || 0;
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleWishlist = async () => {
    if (wishlistPending) return;
    setWishlistPending(true);
    const res = await toggleWishlist(id);
    if (res.success) showMsg(res.added ? "Added to wishlist!" : "Removed from wishlist.");
    else showMsg(res.error || "Failed.", "err");
    setWishlistPending(false);
  };

  const handleAddToCart = async () => {
    if (cartPending) return;
    setCartPending(true);
    const res = await addToCart(id, qty);
    if (res.success) showMsg(inCart ? `Quantity increased to ${cartQty + qty}` : `Added ${qty} to cart!`);
    else showMsg(res.error || "Failed to add.", "err");
    setCartPending(false);
  };

  return (
    <div className="max-w-6xl mx-auto w-full pb-12 font-sans" style={{ color: C.navyDark }}>
      <button
        onClick={() => navigate("/buyer/products")}
        className="flex items-center gap-2 text-sm font-bold mb-6 hover:underline"
        style={{ color: C.navySoft }}
      >
        <ArrowLeft size={16} /> Back to Products
      </button>

      <div className="bg-white rounded-2xl border overflow-hidden p-6 md:p-10" style={{ borderColor: C.border }}>
        <div className="flex flex-col md:flex-row gap-10">

          {/* Images */}
          <div className="md:w-1/2 flex flex-col gap-4">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border" style={{ borderColor: C.border }}>
              <img
                src={product.images?.[activeImage] || "https://placehold.co/800x800?text=No+Image"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors"
                    style={{ borderColor: activeImage === idx ? C.orange : "transparent", opacity: activeImage === idx ? 1 : 0.6 }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:w-1/2 flex flex-col">
            <div className="mb-2 text-sm font-bold uppercase tracking-wider" style={{ color: C.orangeDeep }}>
              {product.category}
            </div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-center flex-wrap gap-3 mb-6 pb-6 border-b" style={{ borderColor: C.border }}>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-gray-50 border" style={{ borderColor: C.border, color: C.navyMed }}>
                {product.storeProfile?.storeLogo ? (
                  <img src={product.storeProfile.storeLogo} alt="Store Logo" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <Store size={15} />
                )}
                <span className="font-semibold">{product.storeProfile?.storeName || product.seller?.name || "Unknown Store"}</span>
              </div>
              {product.stock > 0 ? (
                <div className="text-sm font-semibold flex items-center gap-1 text-green-600">
                  <Check size={15} /> In Stock ({product.stock} available)
                </div>
              ) : (
                <div className="text-sm font-semibold text-gray-500">Out of Stock</div>
              )}
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-4xl font-bold">₹{product.price}</span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-xl line-through opacity-50">₹{product.originalPrice}</span>
                    <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">{discount}% OFF</span>
                  </>
                )}
              </div>
              <p className="text-xs" style={{ color: C.muted }}>Inclusive of all taxes</p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-bold mb-2">Description</h3>
              <p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: C.navySoft }}>
                {product.description}
              </p>
            </div>

            {/* Feedback message */}
            {msg && (
              <div className="rounded-lg px-3 py-2 text-sm font-semibold mb-4" style={{ background: msg.type === "err" ? "#FBEAE6" : "#E6F4EA", color: msg.type === "err" ? C.danger : "#2D7A3A" }}>
                {msg.text}
              </div>
            )}

            {/* Actions */}
            <div className="mt-auto pt-5 border-t flex flex-wrap items-center gap-3" style={{ borderColor: C.border }}>
              {/* Qty picker */}
              <div className="flex items-center gap-1 border rounded-xl p-1" style={{ borderColor: C.border }}>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={14} /></button>
                <span className="w-8 text-center font-bold text-sm">{qty}</span>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100" onClick={() => setQty((q) => q + 1)}><Plus size={14} /></button>
              </div>

              {/* Add to cart */}
              {product.storeProfile?.storeStatus === "closed" ? (
                <div className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200">
                  <AlertCircle size={18} /> Store Closed
                </div>
              ) : (
                <button
                  disabled={cartPending || product.stock === 0}
                  onClick={handleAddToCart}
                  className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ background: inCart ? C.orangeSofter : C.orange, color: C.navyDark, opacity: product.stock === 0 ? 0.5 : 1 }}
                >
                  {cartPending ? <Loader2 size={18} className="animate-spin" /> : inCart ? <><Check size={18} /> In Cart ({cartQty})</> : <><ShoppingCart size={18} /> Add to Cart</>}
                </button>
              )}

              {/* Wishlist */}
              <button
                disabled={wishlistPending}
                onClick={handleWishlist}
                className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all"
                style={{
                  background: inWishlist ? "#FEE2E2" : C.white,
                  borderColor: inWishlist ? "#FECACA" : C.border,
                  color: inWishlist ? "#EF4444" : C.muted,
                }}
                title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                {wishlistPending ? <Loader2 size={18} className="animate-spin" /> : <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />}
              </button>
            </div>

            {inCart && (
              <button className="mt-3 text-sm font-bold underline" style={{ color: C.orangeDeep }} onClick={() => navigate("/buyer/cart")}>
                View Cart →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Store Policies Section */}
      {product.storeProfile && (
        <div className="mt-8 bg-white rounded-2xl border overflow-hidden p-6 md:p-10" style={{ borderColor: C.border }}>
          <h2 className="text-2xl font-bold mb-6">Store Policies & Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {product.storeProfile.returnPolicy && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Return Policy</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{product.storeProfile.returnPolicy}</p>
              </div>
            )}
            {product.storeProfile.refundPolicy && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Refund Policy</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{product.storeProfile.refundPolicy}</p>
              </div>
            )}
            {product.storeProfile.shippingPolicy && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Shipping Policy</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{product.storeProfile.shippingPolicy}</p>
              </div>
            )}
            {product.storeProfile.cancellationPolicy && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Cancellation Policy</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{product.storeProfile.cancellationPolicy}</p>
              </div>
            )}
            {product.storeProfile.storeClosedMessage && product.storeProfile.storeStatus === "closed" && (
              <div className="col-span-1 md:col-span-2 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <h3 className="font-bold text-yellow-800 mb-1">Message from Seller</h3>
                <p className="text-sm text-yellow-700">{product.storeProfile.storeClosedMessage}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
