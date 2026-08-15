import { Loader2, Heart, ShoppingCart, Trash2, PackageOpen, Check, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { useState } from "react";

const C = {
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

export default function WishlistPage() {
  const navigate = useNavigate();
  const {
    wishlistItems, wishlistLoading, toggleWishlist,
    isInCart, getCartItem, addToCart,
  } = useShop();

  const [pendingWishlist, setPendingWishlist] = useState(new Set());
  const [pendingCart, setPendingCart] = useState(new Set());
  const [msgs, setMsgs] = useState({});

  const showMsg = (id, msg, type = "ok") => {
    setMsgs((prev) => ({ ...prev, [id]: { msg, type } }));
    setTimeout(() => setMsgs((prev) => { const n = { ...prev }; delete n[id]; return n; }), 2500);
  };

  const handleRemove = async (productId) => {
    if (pendingWishlist.has(productId)) return;
    setPendingWishlist((s) => new Set([...s, productId]));
    const res = await toggleWishlist(productId);
    if (!res.success) showMsg(productId, res.error || "Failed to remove", "err");
    setPendingWishlist((s) => { const n = new Set(s); n.delete(productId); return n; });
  };

  const handleAddToCart = async (productId) => {
    if (pendingCart.has(productId)) return;
    setPendingCart((s) => new Set([...s, productId]));
    const res = await addToCart(productId);
    if (res.success) showMsg(productId, "Added to cart!");
    else showMsg(productId, res.error || "Failed to add", "err");
    setPendingCart((s) => { const n = new Set(s); n.delete(productId); return n; });
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-12 font-sans" style={{ color: C.navyDark }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.orangeSofter }}>
            <Heart size={20} style={{ color: C.orangeDeep }} fill={C.orangeDeep} />
          </div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
        </div>
        <p style={{ color: C.navyMed }} className="text-sm ml-13">
          {wishlistItems.length} saved product{wishlistItems.length !== 1 ? "s" : ""}
        </p>
      </div>

      {wishlistLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 size={32} style={{ color: C.orange }} className="animate-spin mb-3" />
          <p style={{ color: C.navyMed }} className="text-sm">Loading wishlist...</p>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="rounded-2xl p-16 text-center border bg-white flex flex-col items-center" style={{ borderColor: C.border }}>
          <Heart size={48} style={{ color: C.muted }} className="mb-4" />
          <p className="font-bold text-xl mb-2">Your wishlist is empty</p>
          <p className="text-sm mb-6" style={{ color: C.navyMed }}>Browse products and save your favourites here.</p>
          <button
            onClick={() => navigate("/buyer/products")}
            className="px-6 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: C.orange, color: C.navyDark }}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {wishlistItems.map((product) => {
            const pid = product._id;
            const inCart = isInCart(pid);
            const cartItem = getCartItem(pid);
            const cartQty = cartItem?.quantity || 0;
            const discount = product.originalPrice > product.price
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;
            const msg = msgs[pid];

            return (
              <div
                key={pid}
                className="flex gap-4 bg-white rounded-2xl border p-4 hover:shadow-md transition-shadow"
                style={{ borderColor: C.border }}
              >
                {/* Image */}
                <div
                  className="w-28 h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/buyer/products/${pid}`)}
                >
                  <img
                    src={product.images?.[0] || "https://placehold.co/200x200?text=No+Image"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: C.orangeDeep }}>
                        {product.category}
                      </p>
                      <h3
                        className="font-bold text-base mb-1 cursor-pointer hover:underline line-clamp-2"
                        onClick={() => navigate(`/buyer/products/${pid}`)}
                      >
                        {product.name}
                      </h3>
                      <p className="text-sm" style={{ color: C.navySoft }}>
                        {product.seller?.name || "Unknown Store"}
                      </p>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(pid)}
                      disabled={pendingWishlist.has(pid)}
                      className="p-2 rounded-lg transition-colors hover:bg-red-50 shrink-0"
                      style={{ color: C.danger }}
                      title="Remove from wishlist"
                    >
                      {pendingWishlist.has(pid)
                        ? <Loader2 size={18} className="animate-spin" />
                        : <Trash2 size={18} />}
                    </button>
                  </div>

                  <div className="flex items-end gap-2 mt-2 mb-3">
                    <span className="font-bold text-xl">₹{product.price}</span>
                    {discount > 0 && (
                      <>
                        <span className="text-sm line-through opacity-50">₹{product.originalPrice}</span>
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{discount}% OFF</span>
                      </>
                    )}
                  </div>

                  {product.stock === 0 && (
                    <p className="text-xs font-bold text-gray-400 mb-2">Out of Stock</p>
                  )}

                  {/* Inline message */}
                  {msg && (
                    <p className="text-xs font-semibold mb-2" style={{ color: msg.type === "err" ? C.danger : "#2D7A3A" }}>
                      {msg.msg}
                    </p>
                  )}

                  {/* Cart button */}
                  <button
                    onClick={() => handleAddToCart(pid)}
                    disabled={pendingCart.has(pid) || product.stock === 0}
                    className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                    style={{
                      background: inCart ? C.orangeSofter : C.orange,
                      color: C.navyDark,
                      opacity: product.stock === 0 ? 0.5 : 1,
                    }}
                  >
                    {pendingCart.has(pid)
                      ? <Loader2 size={15} className="animate-spin" />
                      : inCart
                        ? <><Check size={15} /> In Cart ({cartQty})</>
                        : <><ShoppingCart size={15} /> Add to Cart</>
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
