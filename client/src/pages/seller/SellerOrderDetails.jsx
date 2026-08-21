import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSellerOrderDetails, updateSellerItemStatus } from "../../services/orderService";
import { ArrowLeft, MapPin, User, Package, CreditCard, Clock, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function SellerOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await getSellerOrderDetails(id);
      setOrder(data.order);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (itemId, newStatus) => {
    try {
      setUpdatingItemId(itemId);
      await updateSellerItemStatus(id, itemId, newStatus);
      // Optimistic update
      setOrder(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item._id === itemId ? { ...item, itemStatus: newStatus } : item
        )
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto w-full p-6 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-2xl flex flex-col items-center">
          <AlertCircle className="w-12 h-12 mb-3" />
          <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
          <p className="mb-6 max-w-md">{error || "The order you're looking for doesn't exist or you don't have access to it."}</p>
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

  const { shippingAddress, user } = order;

  return (
    <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate("/seller/orders")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content - Products */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-400" />
                Purchased Products
              </h2>
              <span className="text-sm font-medium text-gray-500">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item._id} className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <img 
                      src={item.image || "https://placehold.co/200x200"} 
                      alt={item.name} 
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-gray-100 shadow-sm"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">Price: ₹{item.price.toLocaleString()} &times; {item.quantity}</p>
                          <div className="text-lg font-black text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</div>
                        </div>
                        
                        <div className="flex flex-col gap-2 shrink-0">
                           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                           <div className="relative">
                             <select 
                               className="appearance-none w-full sm:w-40 bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-lg focus:ring-primary focus:border-primary block p-2.5 pr-8 capitalize"
                               value={item.itemStatus}
                               onChange={(e) => handleStatusUpdate(item._id, e.target.value)}
                               disabled={updatingItemId === item._id}
                             >
                               <option value="pending">Pending</option>
                               <option value="confirmed">Confirmed</option>
                               <option value="processing">Processing</option>
                               <option value="shipped">Shipped</option>
                               <option value="delivered">Delivered</option>
                               <option value="cancelled">Cancelled</option>
                             </select>
                             {updatingItemId === item._id ? (
                               <Loader2 className="absolute right-2 top-3 w-4 h-4 animate-spin text-gray-400" />
                             ) : (
                               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                 <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                               </div>
                             )}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline representation for item */}
                  <div className="mt-6 pt-6 border-t border-gray-50">
                     <div className="relative flex justify-between items-center px-2">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
                        
                        {/* Calculate progress percentage */}
                        {(() => {
                           const statuses = ["pending", "confirmed", "processing", "shipped", "delivered"];
                           const currentIndex = statuses.indexOf(item.itemStatus);
                           const isCancelled = item.itemStatus === "cancelled";
                           
                           if (isCancelled) {
                             return <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-red-100 rounded-full z-0"></div>;
                           }
                           
                           if (currentIndex > -1) {
                             const progress = (currentIndex / (statuses.length - 1)) * 100;
                             return <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500" style={{ width: `${progress}%` }}></div>;
                           }
                           return null;
                        })()}

                        {["pending", "confirmed", "processing", "shipped", "delivered"].map((step, idx) => {
                           const isCancelled = item.itemStatus === "cancelled";
                           const statuses = ["pending", "confirmed", "processing", "shipped", "delivered"];
                           const currentIndex = statuses.indexOf(item.itemStatus);
                           const isCompleted = !isCancelled && idx <= currentIndex;
                           const isCurrent = !isCancelled && idx === currentIndex;
                           
                           return (
                             <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                               <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                                 isCancelled ? 'bg-red-50 border-red-200' :
                                 isCurrent ? 'bg-primary border-primary text-white ring-4 ring-primary/20' : 
                                 isCompleted ? 'bg-primary border-primary text-white' : 
                                 'bg-white border-gray-200'
                               }`}>
                                 {isCompleted && !isCurrent && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                               </div>
                               <span className={`text-[10px] sm:text-xs font-semibold capitalize hidden sm:block ${
                                 isCancelled ? 'text-red-400' :
                                 isCurrent ? 'text-primary' : 
                                 isCompleted ? 'text-gray-900' : 
                                 'text-gray-400'
                               }`}>{step}</span>
                             </div>
                           )
                        })}
                     </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50/50 p-5 border-t border-gray-100 flex justify-between items-center">
              <span className="font-semibold text-gray-500">Seller Subtotal</span>
              <span className="text-xl font-black text-gray-900">₹{order.sellerSubtotal?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Sidebar - Details */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-400" />
              Customer Details
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 font-medium text-xs uppercase tracking-wide mb-1">Name</p>
                <p className="font-semibold text-gray-900">{shippingAddress.fullName}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-xs uppercase tracking-wide mb-1">Email</p>
                <p className="font-semibold text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-xs uppercase tracking-wide mb-1">Phone</p>
                <p className="font-semibold text-gray-900">{shippingAddress.phone}</p>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-400" />
              Shipping Address
            </h2>
            <div className="text-sm font-medium text-gray-700 leading-relaxed space-y-1">
              <p>{shippingAddress.fullName}</p>
              <p>{shippingAddress.addressLine1}</p>
              {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
              <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
              <p className="text-gray-500 mt-2 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Expected delivery in 3-5 days
              </p>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-400" />
              Payment Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Method</span>
                <span className="text-sm font-bold text-gray-900 capitalize">{order.paymentMethod || 'razorpay'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Status</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                  order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.razorpayPaymentId && (
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-medium">Txn ID</span>
                  <span className="text-xs text-gray-600 font-mono">{order.razorpayPaymentId}</span>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
