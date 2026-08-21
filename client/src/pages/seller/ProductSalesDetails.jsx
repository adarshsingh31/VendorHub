import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductSalesDetails } from "../../services/orderService";
import { ArrowLeft, Loader2, Users, ShoppingBag, Package, DollarSign, AlertCircle } from "lucide-react";

export default function ProductSalesDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [productDetails, setProductDetails] = useState(null);
  const [buyers, setBuyers] = useState([]);

  useEffect(() => {
    fetchDetails();
  }, [productId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getProductSalesDetails(productId);
      setProductDetails(data.productDetails);
      setBuyers(data.buyers || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load product sales details");
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading sales data...</p>
      </div>
    );
  }

  if (error || !productDetails) {
    return (
      <div className="max-w-4xl mx-auto w-full p-6 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-2xl flex flex-col items-center">
          <AlertCircle className="w-12 h-12 mb-3" />
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <p className="mb-6 max-w-md">{error || "Failed to load sales information for this product."}</p>
          <button 
            onClick={() => navigate("/seller/orders")}
            className="px-5 py-2.5 bg-white text-gray-700 font-semibold rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate("/seller/orders")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-4">
          {productDetails.productImage && (
            <img 
              src={productDetails.productImage} 
              alt={productDetails.productName} 
              className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-sm"
            />
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{productDetails.productName}</h1>
            <p className="text-gray-500 text-sm mt-1">Product Sales Details</p>
          </div>
        </div>
      </div>

      {/* Summary Cards for the Specific Product */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Unique Buyers", value: productDetails.uniqueBuyers, icon: Users, color: "text-purple-600" },
          { label: "Orders", value: productDetails.orders, icon: ShoppingBag, color: "text-blue-600" },
          { label: "Units Sold", value: productDetails.unitsSold, icon: Package, color: "text-indigo-600" },
          { label: "Revenue", value: `₹${productDetails.revenue.toLocaleString()}`, icon: DollarSign, color: "text-green-700" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
             <stat.icon className={`w-8 h-8 mb-3 ${stat.color}`} />
             <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
             <div className="text-sm text-gray-500 font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Buyers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Buyer List</h2>
          <span className="text-sm font-medium text-gray-500">{buyers.length} purchases found</span>
        </div>
        
        {buyers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No buyers found for this product.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4">Buyer</th>
                  <th className="p-4 text-right">Quantity</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {buyers.map((buyer, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 align-top">
                      <div className="font-medium text-gray-900 text-sm">{buyer.buyerName || "Unknown"}</div>
                      <div className="text-xs text-gray-500 mt-1">{buyer.buyerEmail}</div>
                    </td>
                    <td className="p-4 align-top text-right">
                      <div className="font-medium text-gray-900 text-sm">{buyer.quantity}</div>
                    </td>
                    <td className="p-4 align-top text-right">
                      <div className="font-medium text-gray-900 text-sm">₹{buyer.amount.toLocaleString()}</div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-medium text-gray-600 text-xs font-mono">#{buyer.orderId.slice(-8).toUpperCase()}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(buyer.orderDate).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 align-top">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                        buyer.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {buyer.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(buyer.orderStatus)}`}>
                        {buyer.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 align-top text-right">
                      <button 
                        onClick={() => navigate(`/seller/orders/${buyer.orderId}`)}
                        className="text-primary hover:text-primary/80 text-sm font-semibold transition-colors"
                      >
                        View Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
