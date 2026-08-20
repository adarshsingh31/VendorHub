import { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import { Loader2, Package } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getAllAdminOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      const data = await paymentService.updateAdminOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
    } catch (err) {
      console.error(err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 size={32} className="text-primary animate-spin mb-3" />
        <p className="text-sm text-text-muted">Loading all orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="font-sans text-text">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">receipt_long</span>
            Platform Orders
          </h1>
          <p className="text-sm text-text-muted mt-1">Manage and track all customer orders</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl p-16 text-center border bg-surface flex flex-col items-center shadow-soft">
          <Package size={48} className="text-border mb-4" />
          <h2 className="font-bold text-xl mb-2 text-text">No orders found</h2>
          <p className="text-sm text-text-muted mb-6">There are currently no orders on the platform.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-background border-b border-border text-text-muted uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 font-mono">{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-text">{order.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-text-muted">{order.user?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 font-bold text-text">
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border bg-gray-100 text-gray-800 border-gray-200">
                        {order.orderStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        disabled={updating === order._id}
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-primary cursor-pointer disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {updating === order._id && <Loader2 size={14} className="inline-block ml-2 animate-spin text-primary" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
