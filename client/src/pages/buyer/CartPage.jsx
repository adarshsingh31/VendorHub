import { Loader2, ShoppingCart, Trash2, Plus, Minus, PackageOpen, ArrowRight } from "lucide-react";
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

function groupBySeller(items) {
  const map = new Map();
  for (const item of items) {
    const sellerName = item.product?.seller?.name || "Unknown Store";
    const sellerId = item.product?.seller?._id || "unknown";
    if (!map.has(sellerId)) map.set(sellerId, { sellerName, items: [] });
    map.get(sellerId).items.push(item);
  }
  return [...map.values()];
}

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, cartLoading, updateQuantity, removeFromCart, cartCount } = useShop();
  const [pending, setPending] = useState(new Set());

  const setItemPending = (id, val) =>
    setPending((s) => { const n = new Set(s); val ? n.add(id) : n.delete(id); return n; });

  const handleQty = async (productId, newQty) => {
    if (pending.has(productId)) return;
    setItemPending(productId, true);
    if (newQty < 1) await removeFromCart(productId);
    else await updateQuantity(productId, newQty);
    setItemPending(productId, false);
  };

  const handleRemove = async (productId) => {
    if (pending.has(productId)) return;
    setItemPending(productId, true);
    await removeFromCart(productId);
    setItemPending(productId, false);
  };

  const totalPrice = cartItems.reduce((acc, item) => {
    const price = item.price || item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const grouped = groupBySeller(cartItems);

  return (
    <div className="max-w-5xl mx-auto w-full pb-12 font-sans" style={{ color: C.navyDark }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.orangeSofter }}>
            <ShoppingCart size={20} style={{ color: C.orangeDeep }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Cart</h1>
            <p className="text-sm" style={{ color: C.navyMed }}>
              {cartCount} item{cartCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {cartLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 size={32} style={{ color: C.orange }} className="animate-spin mb-3" />
          <p style={{ color: C.navyMed }} className="text-sm">Loading cart...</p>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="rounded-2xl p-16 text-center border bg-white flex flex-col items-center" style={{ borderColor: C.border }}>
          <PackageOpen size={48} style={{ color: C.muted }} className="mb-4" />
          <p className="font-bold text-xl mb-2">Your cart is empty</p>
          <p className="text-sm mb-6" style={{ color: C.navyMed }}>Add products from Browse Products to get started.</p>
          <button
            onClick={() => navigate("/buyer/products")}
            className="px-6 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: C.orange, color: C.navyDark }}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items — grouped by seller */}
          <div className="flex-1 space-y-6">
            {grouped.map((group) => (
              <div key={group.sellerName} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
                {/* Seller header */}
                <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: C.border, background: C.orangeSofter }}>
                  <span className="text-sm font-bold" style={{ color: C.orangeDeep }}>🏪 {group.sellerName}</span>
                </div>

                {/* Items */}
                <div className="divide-y" style={{ borderColor: C.border }}>
                  {group.items.map((item) => {
                    const prod = item.product;
                    const pid = (prod?._id || item.product)?.toString();
                    const price = item.price || prod?.price || 0;
                    const isPending = pending.has(pid);

                    return (
                      <div key={pid} className="flex gap-4 p-4 items-center">
                        {/* Image */}
                        <div
                          className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 cursor-pointer"
                          onClick={() => navigate(`/buyer/products/${pid}`)}
                        >
                          <img
                            src={prod?.images?.[0] || "https://placehold.co/200x200?text=No+Image"}
                            alt={prod?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-bold text-sm mb-1 cursor-pointer hover:underline line-clamp-2"
                            onClick={() => navigate(`/buyer/products/${pid}`)}
                          >
                            {prod?.name || "Product"}
                          </p>
                          <p className="text-sm font-bold" style={{ color: C.orangeDeep }}>
                            ₹{price} <span className="font-normal text-xs" style={{ color: C.muted }}>each</span>
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors hover:bg-gray-50"
                            style={{ borderColor: C.border }}
                            onClick={() => handleQty(pid, item.quantity - 1)}
                            disabled={isPending}
                          >
                            {item.quantity === 1 ? <Trash2 size={14} style={{ color: C.danger }} /> : <Minus size={14} />}
                          </button>
                          <span className="w-8 text-center font-bold text-sm">
                            {isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : item.quantity}
                          </span>
                          <button
                            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors hover:bg-gray-50"
                            style={{ borderColor: C.border }}
                            onClick={() => handleQty(pid, item.quantity + 1)}
                            disabled={isPending}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Line total */}
                        <div className="text-right shrink-0 w-20">
                          <p className="font-bold text-base">₹{(price * item.quantity).toLocaleString()}</p>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => handleRemove(pid)}
                          disabled={isPending}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                          style={{ color: C.danger }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Panel */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border p-6 sticky top-6" style={{ borderColor: C.border }}>
              <h2 className="font-bold text-lg mb-5">Order Summary</h2>

              <div className="space-y-3 mb-6 text-sm">
                {cartItems.map((item) => {
                  const price = item.price || item.product?.price || 0;
                  return (
                    <div key={(item.product?._id || item.product)?.toString()} className="flex justify-between gap-2">
                      <span className="line-clamp-1 flex-1" style={{ color: C.navySoft }}>
                        {item.product?.name || "Product"} × {item.quantity}
                      </span>
                      <span className="font-semibold shrink-0">₹{(price * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 mb-6" style={{ borderColor: C.border }}>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-xs mt-1" style={{ color: C.muted }}>Inclusive of all taxes</p>
              </div>

              <button
                onClick={() => navigate("/buyer/checkout")}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                style={{ background: C.orange, color: C.navyDark }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <button
                onClick={() => navigate("/buyer/products")}
                className="w-full py-2.5 rounded-xl font-bold text-sm mt-3 border hover:bg-gray-50 transition-colors"
                style={{ borderColor: C.border, color: C.navySoft }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
