import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSellerOrders, getProductSalesSummary } from "../../services/orderService";
import { Search, Filter, ShoppingBag, Loader2, PackageSearch, PackageOpen, Truck, CheckCircle, XCircle, DollarSign, Users, Package } from "lucide-react";

export default function SellerOrders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders"); // "orders" or "products"
  
  const [orders, setOrders] = useState([]);
  const [productSales, setProductSales] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters for orders
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    uniqueBuyers: 0,
    productsSold: 0,
    totalRevenue: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (activeTab === "orders") {
        const data = await getSellerOrders({ search, status: statusFilter, limit: 50 });
        setOrders(data.orders || []);
      }
      
      // Always fetch product sales summary to get the top-level stats
      const summaryData = await getProductSalesSummary();
      setStats(summaryData.summary || {
        totalOrders: 0,
        uniqueBuyers: 0,
        productsSold: 0,
        totalRevenue: 0
      });
      setProductSales(summaryData.productSales || []);
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter, activeTab]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "processing": return "bg-indigo-100 text-indigo-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders & Sales</h1>
        <p className="text-gray-500">Manage your orders and track product performance</p>
      </div>

      {/* Stats Cards - Now using database aggregated data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-blue-600" },
          { label: "Unique Buyers", value: stats.uniqueBuyers, icon: Users, color: "text-purple-600" },
          { label: "Products Sold", value: stats.productsSold, icon: Package, color: "text-indigo-600" },
          { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-700" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
             <stat.icon className={`w-8 h-8 mb-3 ${stat.color}`} />
             <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
             <div className="text-sm text-gray-500 font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "orders" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          All Orders
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "products" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveTab("products")}
        >
          Product Sales
        </button>
      </div>

      {activeTab === "orders" && (
        <>
          {/* Filters for Orders */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID, Buyer name, Product..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                className="border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders Content */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-gray-500">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl flex flex-col items-center justify-center text-center">
              <XCircle className="w-8 h-8 mb-2" />
              <p className="font-medium">{error}</p>
              <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium">Try Again</button>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 max-w-sm">
                {search || statusFilter !== 'all' 
                  ? "No orders match your current filters. Try adjusting your search." 
                  : "When customers purchase your products, their orders will appear here."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      <th className="p-4">Order ID & Date</th>
                      <th className="p-4">Product(s)</th>
                      <th className="p-4">Buyer</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => {
                      const mainItem = order.items[0];
                      const extraCount = order.items.length - 1;
                      
                      return (
                        <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="p-4 align-top">
                            <div className="font-medium text-gray-900 text-sm">#{order._id.slice(-8).toUpperCase()}</div>
                            <div className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex items-center gap-3">
                              <img src={mainItem.image || "https://placehold.co/100x100"} alt={mainItem.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                              <div>
                                <div className="font-medium text-gray-900 text-sm line-clamp-1">{mainItem.name}</div>
                                <div className="text-xs text-gray-500 mt-0.5">Qty: {mainItem.quantity}</div>
                                {extraCount > 0 && <div className="text-xs text-primary font-medium mt-0.5">+{extraCount} more item(s)</div>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <div className="font-medium text-gray-900 text-sm">{order.user?.name || "Unknown Buyer"}</div>
                            <div className="text-xs text-gray-500 mt-1">{order.user?.email}</div>
                          </td>
                          <td className="p-4 align-top">
                            <div className="font-medium text-gray-900 text-sm">₹{order.sellerSubtotal?.toLocaleString()}</div>
                          </td>
                          <td className="p-4 align-top">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(mainItem.itemStatus)}`}>
                              {mainItem.itemStatus}
                            </span>
                          </td>
                          <td className="p-4 align-top text-right">
                            <button 
                              onClick={() => navigate(`/seller/orders/${order._id}`)}
                              className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "products" && (
        <>
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-gray-500">Loading product sales...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl flex flex-col items-center justify-center text-center">
              <XCircle className="w-8 h-8 mb-2" />
              <p className="font-medium">{error}</p>
              <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium">Try Again</button>
            </div>
          ) : productSales.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No sales yet</h3>
              <p className="text-gray-500 max-w-sm">
                Once customers start buying your products, you'll see a breakdown of sales per product here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      <th className="p-4">Product</th>
                      <th className="p-4 text-right">Unique Buyers</th>
                      <th className="p-4 text-right">Orders</th>
                      <th className="p-4 text-right">Units Sold</th>
                      <th className="p-4 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productSales.map((product) => (
                      <tr 
                        key={product.productId} 
                        className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/seller/orders/product/${product.productId}`)}
                      >
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <img src={product.productImage || "https://placehold.co/100x100"} alt={product.productName} className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                            <div className="font-semibold text-gray-900 text-sm group-hover:text-primary transition-colors line-clamp-2">
                              {product.productName}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <div className="font-medium text-gray-900 text-sm">{product.uniqueBuyers}</div>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <div className="font-medium text-gray-900 text-sm">{product.orders}</div>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <div className="font-medium text-gray-900 text-sm">{product.unitsSold}</div>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <div className="font-bold text-gray-900 text-sm">₹{product.revenue?.toLocaleString()}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
