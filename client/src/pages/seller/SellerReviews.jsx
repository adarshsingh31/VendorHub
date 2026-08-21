import React, { useState, useEffect, useCallback } from "react";
import { getSellerReviews } from "../../services/reviewService";
import {
  Star,
  Search,
  Filter,
  CheckCircle,
  MessageSquare,
  Loader2,
  AlertCircle,
  X
} from "lucide-react";

// ─── Rating Stars Component ───────────────────────────────────────────────────
function RatingStars({ rating, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function ReviewDetailModal({ review, onClose }) {
  if (!review) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-lg">Review Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Product */}
          <section>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Product</h4>
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              {review.product?.images?.[0] ? (
                <img src={review.product.images[0]} alt={review.product.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="font-semibold text-gray-900">{review.product?.name || "Unknown Product"}</div>
            </div>
          </section>

          {/* Customer */}
          <section>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                {review.buyer?.avatar ? (
                  <img src={review.buyer.avatar} alt={review.buyer.name} className="w-full h-full object-cover" />
                ) : (
                  review.buyer?.name?.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <div>
                <div className="font-bold text-gray-900">{review.buyer?.name || "Unknown Customer"}</div>
                {review.buyer?.email && <div className="text-sm text-gray-500">{review.buyer.email}</div>}
              </div>
            </div>
          </section>

          {/* Review */}
          <section>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Rating & Review</h4>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <RatingStars rating={review.rating} size={20} />
                <span className="text-sm text-gray-500 font-medium">
                  {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{review.comment}</p>
            </div>
          </section>

          {/* Order Details */}
          <section>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Purchase Verification</h4>
            {review.verifiedPurchase ? (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-bold text-sm">Verified Purchase</div>
                  {review.order && <div className="text-xs mt-0.5 opacity-80">Order #{review.order.toString().slice(-8).toUpperCase()}</div>}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                Unverified purchase or legacy order.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SellerReviews() {
  const [reviews, setReviews] = useState([]);
  const [productSummary, setProductSummary] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [sort, setSort] = useState("newest");
  
  const [selectedReview, setSelectedReview] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await getSellerReviews({
        page,
        limit: 12,
        search,
        productId: filterProduct,
        rating: filterRating,
        sort,
      });
      
      setReviews(data.reviews || []);
      setTotalPages(data.pages || 1);
      setTotalReviews(data.total || 0);
      
      // Update product summary only if we're not currently filtering by product
      // so the dropdown doesn't lose the other products
      if (!filterProduct && data.productSummary) {
        setProductSummary(data.productSummary);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customer reviews.");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterProduct, filterRating, sort]);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchReviews]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, filterProduct, filterRating, sort]);

  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Reviews</h1>
        <p className="text-gray-500">See what buyers are saying about your products.</p>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews by comment, product, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        
        <div className="flex flex-wrap lg:flex-nowrap gap-3">
          {/* Product Filter */}
          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="flex-1 lg:w-48 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Products</option>
            {productSummary.map((p) => (
              <option key={p.productId} value={p.productId}>
                {p.name} ({p.reviewCount})
              </option>
            ))}
          </select>

          {/* Rating Filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="w-36 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Ratings</option>
            <option value="5">★★★★★ (5)</option>
            <option value="4">★★★★☆ (4)</option>
            <option value="3">★★★☆☆ (3)</option>
            <option value="2">★★☆☆☆ (2)</option>
            <option value="1">★☆☆☆☆ (1)</option>
          </select>

          {/* Sort */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <Filter className="w-4 h-4 text-gray-400 hidden lg:block" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full lg:w-40 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating_high">Highest Rating</option>
              <option value="rating_low">Lowest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Review Grid */}
      {loading && reviews.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse">
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-8 rounded-xl flex flex-col items-center text-center">
          <AlertCircle className="w-10 h-10 mb-3" />
          <h3 className="text-lg font-bold">Unable to load reviews</h3>
          <p className="mt-1">{error}</p>
          <button onClick={fetchReviews} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 font-semibold rounded-lg text-sm transition-colors">
            Try Again
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
            <MessageSquare className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews found</h3>
          <p className="text-gray-500 max-w-sm">
            {search || filterProduct || filterRating
              ? "Try adjusting your filters or search terms."
              : "Your customer reviews will appear here when buyers review your products."}
          </p>
          {(search || filterProduct || filterRating) && (
            <button
              onClick={() => { setSearch(""); setFilterProduct(""); setFilterRating(""); setSort("newest"); }}
              className="mt-6 px-5 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="text-sm font-semibold text-gray-500 px-1 mb-2">
            Showing {reviews.length} of {totalReviews} review{totalReviews !== 1 && "s"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                onClick={() => setSelectedReview(review)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col h-full group"
              >
                {/* Product Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
                  {review.product?.images?.[0] ? (
                    <img src={review.product.images[0]} alt={review.product.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                      {review.product?.name || "Unknown Product"}
                    </h4>
                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded mt-1">
                        <CheckCircle className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                </div>

                {/* Review Body */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <RatingStars rating={review.rating} />
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-4 flex-1">
                    "{review.comment}"
                  </p>
                </div>

                {/* Customer Footer */}
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold overflow-hidden shrink-0">
                    {review.buyer?.avatar ? (
                      <img src={review.buyer.avatar} alt={review.buyer.name} className="w-full h-full object-cover" />
                    ) : (
                      review.buyer?.name?.charAt(0).toUpperCase() || "?"
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-600 truncate">
                    {review.buyer?.name || "Customer"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  // Show limited pages (first, last, and around current)
                  if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-lg transition-colors ${
                          page === p ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="w-9 h-9 flex items-center justify-center text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <ReviewDetailModal review={selectedReview} onClose={() => setSelectedReview(null)} />
    </div>
  );
}
