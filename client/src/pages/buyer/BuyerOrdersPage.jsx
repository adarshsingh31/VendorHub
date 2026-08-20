import { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import { Loader2, Package, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const C = {
  white: "#FFFFFF",
  navyDark: "#1E2A47",
  navyMed: "#3D4A66",
  navySoft: "#5B6785",
  orange: "#E8A33D",
  border: "#E6E0D2",
  muted: "#948F82",
};

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getMyOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load your orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 size={32} style={{ color: C.orange }} className="animate-spin mb-3" />
        <p style={{ color: C.navyMed }} className="text-sm">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 font-sans text-text">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">receipt_long</span>
            My Orders
          </h1>
          <p className="text-sm text-text-muted mt-1">View and track your previous purchases</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl p-16 text-center border bg-surface flex flex-col items-center shadow-soft">
          <Package size={48} className="text-border mb-4" />
          <h2 className="font-bold text-xl mb-2 text-text">No orders yet</h2>
          <p className="text-sm text-text-muted mb-6">Looks like you haven't made your first purchase yet.</p>
          <button
            onClick={() => navigate('/buyer/products')}
            className="bg-primary text-primary-content font-bold px-6 py-2.5 rounded-xl hover:bg-primary-hover transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-surface rounded-2xl border border-border shadow-soft overflow-hidden">
              {/* Order Header */}
              <div className="bg-background px-6 py-4 border-b border-border flex flex-wrap gap-4 items-center justify-between text-sm">
                <div className="flex flex-wrap gap-8">
                  <div>
                    <p className="text-text-muted text-xs font-bold mb-0.5">ORDER PLACED</p>
                    <p className="font-semibold text-text">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs font-bold mb-0.5">TOTAL</p>
                    <p className="font-semibold text-text">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs font-bold mb-0.5">SHIP TO</p>
                    <p className="font-semibold text-primary cursor-help" title={order.shippingAddress?.addressLine1}>
                      {order.shippingAddress?.fullName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-text-muted text-xs font-bold mb-0.5">ORDER # {order._id.slice(-8).toUpperCase()}</p>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Body / Items */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-bold text-text">Delivery Status:</h3>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-20 h-20 rounded-xl bg-background border border-border overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-border">
                            <Package size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-text text-[15px]">{item.name}</h4>
                        <div className="mt-1 text-sm text-text-muted">
                          <p>Qty: <span className="font-medium text-text">{item.quantity}</span></p>
                          <p>Price: <span className="font-medium text-text">₹{item.price?.toLocaleString('en-IN')}</span></p>
                        </div>
                      </div>
                      <div className="text-right font-bold text-text">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Footer */}
              {order.razorpayPaymentId && (
                <div className="bg-background px-6 py-3 border-t border-border flex justify-between items-center text-xs text-text-muted">
                  <span>Paid securely via Razorpay</span>
                  <span className="font-mono bg-surface border border-border px-2 py-0.5 rounded">ID: {order.razorpayPaymentId}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
