import { useState, useEffect, useCallback } from "react";
import {
  Search, Loader2, Filter, X, ChevronLeft, ChevronRight,
  PackageOpen, Heart, ShoppingCart, Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../../services/productService";
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

const CATEGORIES = [
  "Electronics", "Clothing", "Home & Garden", "Beauty",
  "Sports", "Food & Beverage", "Other",
];

const SORT_OPTIONS = [
  { label: "Newest", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

// ─── Toast mini-helper ───────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);
  return { toast, show };
}

// ─── Product Card ────────────────────────────────────────────────────────────
function ProductCard({ product, onNavigate }) {
  const { isInWishlist, toggleWishlist, isInCart, getCartItem, addToCart } = useShop();

  const productId = product._id;
  const inWishlist = isInWishlist(productId);
  const inCart = isInCart(productId);
  const cartItem = getCartItem(productId);
  const cartQty = cartItem?.quantity || 0;

  const [wishlistPending, setWishlistPending] = useState(false);
  const [cartPending, setCartPending] = useState(false);
  const [localMsg, setLocalMsg] = useState(null);

  const showMsg = (msg, type = "ok") => {
    setLocalMsg({ msg, type });
    setTimeout(() => setLocalMsg(null), 2000);
  };

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (wishlistPending) return;
    setWishlistPending(true);
    const res = await toggleWishlist(productId);
    if (!res.success) showMsg(res.error || "Failed", "err");
    setWishlistPending(false);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (cartPending) return;
    setCartPending(true);
    const res = await addToCart(productId);
    if (res.success) showMsg(inCart ? `Quantity updated` : "Added to cart");
    else showMsg(res.error || "Failed", "err");
    setCartPending(false);
  };

  return (
    <div
      className="group bg-white rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
      style={{ borderColor: C.border }}
      onClick={() => onNavigate(productId)}
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        <img
          src={product.images?.[0] || "https://placehold.co/600x400?text=No+Image"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded shadow">
            {discount}% OFF
          </div>
        )}
        {/* Wishlist heart */}
        <button
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all"
          style={{
            background: inWishlist ? "#FEE2E2" : "rgba(255,255,255,0.92)",
            color: inWishlist ? "#EF4444" : C.muted,
          }}
          onClick={handleWishlist}
          disabled={wishlistPending}
          title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wishlistPending
            ? <Loader2 size={16} className="animate-spin" />
            : <Heart size={16} fill={inWishlist ? "currentColor" : "none"} />
          }
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: C.orangeDeep }}>
          {product.category}
        </div>
        <h3 className="font-bold text-base mb-1 line-clamp-2 group-hover:text-orange-500 transition-colors leading-snug">
          {product.name}
        </h3>
        <p className="text-sm mb-3 line-clamp-1" style={{ color: C.navySoft }}>
          {product.seller?.name || "Unknown Store"}
        </p>

        {/* Local toast */}
        {localMsg && (
          <div
            className="text-xs font-semibold rounded-lg px-2 py-1 mb-2"
            style={{
              background: localMsg.type === "err" ? "#FBEAE6" : "#E6F4EA",
              color: localMsg.type === "err" ? C.danger : "#2D7A3A",
            }}
          >
            {localMsg.msg}
          </div>
        )}

        <div className="mt-auto pt-3 border-t" style={{ borderColor: C.border }}>
          {/* Price */}
          <div className="flex items-end gap-2 mb-3">
            <span className="font-bold text-xl">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm line-through opacity-50">₹{product.originalPrice}</span>
            )}
          </div>
          {/* Stock */}
          {product.stock === 0 ? (
            <p className="text-xs font-bold text-gray-400 mb-3">Out of Stock</p>
          ) : product.stock < 5 ? (
            <p className="text-xs font-bold mb-3" style={{ color: C.danger }}>
              Only {product.stock} left!
            </p>
          ) : null}

          {/* Add to Cart */}
          <button
            className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
            style={{
              background: inCart ? C.orangeSofter : C.orange,
              color: C.navyDark,
              opacity: product.stock === 0 ? 0.5 : 1,
            }}
            onClick={handleAddToCart}
            disabled={cartPending || product.stock === 0}
          >
            {cartPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : inCart ? (
              <><Check size={16} /> In Cart ({cartQty})</>
            ) : (
              <><ShoppingCart size={16} /> Add to Cart</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BuyerProductsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = { search, category, sort, page, limit: 12 };
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const data = await getAllProducts(params);
      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } else {
        setError("Failed to fetch products");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const clearFilters = () => {
    setSearch(""); setCategory(""); setMinPrice(""); setMaxPrice(""); setSort(""); setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-12 font-sans" style={{ color: C.navyDark }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-4 md:px-0">
        <div>
          <h1 className="text-3xl font-bold mb-1">Browse Products</h1>
          <p style={{ color: C.navyMed }} className="text-sm">Discover thousands of local products.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            className="md:hidden p-3 rounded-xl border flex items-center justify-center shrink-0"
            style={{ borderColor: C.border, background: C.white }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
          </button>
          <div className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border focus:outline-none"
              style={{ borderColor: C.border, background: C.white }}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 px-4 md:px-0">
        {/* Sidebar Filters */}
        <div className={`md:w-60 shrink-0 space-y-8 ${showFilters ? "block" : "hidden md:block"}`}>
          <div>
            <h3 className="font-bold mb-4 text-xs tracking-widest uppercase" style={{ color: C.navyMed }}>Categories</h3>
            <div className="space-y-1">
              {["", ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setPage(1); }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    background: category === cat ? C.orangeSoft : "transparent",
                    color: category === cat ? C.orangeDeep : C.navySoft,
                    fontWeight: category === cat ? 700 : 400,
                  }}
                >
                  {cat || "All Categories"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-xs tracking-widest uppercase" style={{ color: C.navyMed }}>Price Range</h3>
            <div className="flex items-center gap-2 mb-3">
              <input type="number" placeholder="Min" className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none" style={{ borderColor: C.border }} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <span style={{ color: C.muted }}>–</span>
              <input type="number" placeholder="Max" className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none" style={{ borderColor: C.border }} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
            <button onClick={() => { setPage(1); fetchProducts(); }} className="w-full py-2 rounded-lg text-sm font-bold" style={{ background: C.orange, color: C.navyDark }}>
              Apply
            </button>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-xs tracking-widest uppercase" style={{ color: C.navyMed }}>Sort By</h3>
            <select className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none bg-white cursor-pointer" style={{ borderColor: C.border, color: C.navyDark }} value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <button onClick={clearFilters} className="w-full py-2.5 flex items-center justify-center gap-2 rounded-lg border text-sm font-bold hover:bg-gray-50 transition-colors" style={{ borderColor: C.border, color: C.navySoft }}>
            <X size={15} /> Clear All Filters
          </button>
        </div>

        {/* Main */}
        <div className="flex-1">
          {error ? (
            <div className="rounded-xl p-10 text-center border" style={{ borderColor: "#F2C9C0", color: C.danger }}>
              <X size={36} className="mx-auto mb-3 opacity-50" />
              <p className="font-bold mb-1">Failed to load products</p>
              <p className="text-sm mb-5 opacity-70">{error}</p>
              <button onClick={fetchProducts} className="px-6 py-2 rounded-lg font-bold text-sm border" style={{ color: C.danger, borderColor: "#F2C9C0" }}>
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 size={32} style={{ color: C.orange }} className="animate-spin mb-3" />
              <p style={{ color: C.navyMed }} className="text-sm">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl p-16 text-center border bg-white" style={{ borderColor: C.border }}>
              <PackageOpen size={48} style={{ color: C.muted }} className="mx-auto mb-4" />
              <p className="font-bold text-lg mb-2">No products found</p>
              <p className="text-sm mb-5" style={{ color: C.navyMed }}>Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="px-6 py-2.5 rounded-lg font-bold text-sm" style={{ background: C.orangeSofter, color: C.orangeDeep }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} onNavigate={(id) => navigate(`/buyer/products/${id}`)} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-2 rounded-lg border disabled:opacity-40 hover:bg-gray-50 bg-white" style={{ borderColor: C.border }}>
                    <ChevronLeft size={20} />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)} className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-colors border" style={{ borderColor: page === i + 1 ? C.orange : C.border, background: page === i + 1 ? C.orangeSofter : C.white, color: page === i + 1 ? C.orangeDeep : C.navyDark }}>
                      {i + 1}
                    </button>
                  ))}
                  <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="p-2 rounded-lg border disabled:opacity-40 hover:bg-gray-50 bg-white" style={{ borderColor: C.border }}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
