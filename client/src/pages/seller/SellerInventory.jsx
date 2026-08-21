import React, { useState, useEffect } from "react";
import { 
  getSellerInventory, 
  updateProductStock, 
  getProductInventoryHistory 
} from "../../services/inventoryService";
import { 
  Search, Filter, Package, Loader2, AlertCircle, TrendingUp, AlertTriangle, XCircle, 
  History, Settings2, Plus, Minus, CheckCircle, ArrowDown, ArrowUp, Store
} from "lucide-react";

export default function SellerInventory() {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalStockUnits: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    inventoryValue: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters and Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST"); // NEWEST, OLDEST, STOCK_LOW, STOCK_HIGH, SALES_HIGH, PRICE_HIGH, PRICE_LOW

  // Modals
  const [updateModal, setUpdateModal] = useState({ isOpen: false, product: null });
  const [historyModal, setHistoryModal] = useState({ isOpen: false, product: null, history: [], loading: false });

  // Update Form State
  const [updateForm, setUpdateForm] = useState({
    mode: "add", // add, remove, exact
    amount: 0,
    threshold: 10,
    reason: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getSellerInventory();
      setInventory(data.inventory || []);
      setSummary(data.summary || {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateStockSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const { product } = updateModal;
      
      let change = undefined;
      let overrideStock = undefined;

      if (updateForm.mode === "add") {
        change = Number(updateForm.amount);
      } else if (updateForm.mode === "remove") {
        change = -Number(updateForm.amount);
      } else if (updateForm.mode === "exact") {
        overrideStock = Number(updateForm.amount);
      }

      const payload = {
        lowStockThreshold: Number(updateForm.threshold),
        reason: updateForm.reason || undefined,
        ...(change !== undefined && { change }),
        ...(overrideStock !== undefined && { overrideStock })
      };

      await updateProductStock(product.productId, payload);
      
      // Close modal and refresh
      setUpdateModal({ isOpen: false, product: null });
      fetchInventory();

    } catch (err) {
      alert(err.response?.data?.message || "Failed to update stock");
    } finally {
      setIsUpdating(false);
    }
  };

  const openHistoryModal = async (product) => {
    setHistoryModal({ isOpen: true, product, history: [], loading: true });
    try {
      const data = await getProductInventoryHistory(product.productId);
      setHistoryModal(prev => ({ ...prev, history: data.history || [], loading: false }));
    } catch (err) {
      alert("Failed to load history");
      setHistoryModal(prev => ({ ...prev, loading: false }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "IN_STOCK": return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">IN STOCK</span>;
      case "LOW_STOCK": return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-yellow-100 text-yellow-800">LOW STOCK</span>;
      case "OUT_OF_STOCK": return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700">OUT OF STOCK</span>;
      default: return null;
    }
  };

  // Derived state for filtering/sorting
  const filteredInventory = inventory.filter(item => {
    if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return item.productName.toLowerCase().includes(s) || item.sku.toLowerCase().includes(s);
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "STOCK_LOW") return a.stock - b.stock;
    if (sortBy === "STOCK_HIGH") return b.stock - a.stock;
    if (sortBy === "SALES_HIGH") return b.totalSold - a.totalSold;
    if (sortBy === "PRICE_LOW") return a.price - b.price;
    if (sortBy === "PRICE_HIGH") return b.price - a.price;
    return 0; // Default NEWEST is original array order from backend
  });

  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
        <p className="text-gray-500">Track and manage your product stock levels in real-time.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Total Products", value: summary.totalProducts, icon: Package, color: "text-blue-600" },
          { label: "Total Stock Units", value: summary.totalStockUnits, icon: Store, color: "text-purple-600" },
          { label: "In Stock", value: summary.inStock, icon: CheckCircle, color: "text-green-600" },
          { label: "Low Stock", value: summary.lowStock, icon: AlertTriangle, color: "text-yellow-600" },
          { label: "Out of Stock", value: summary.outOfStock, icon: XCircle, color: "text-red-600" },
          { label: "Inventory Value", value: `₹${(summary.inventoryValue || 0).toLocaleString()}`, icon: TrendingUp, color: "text-indigo-600" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
             <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
             <div className="text-xl font-bold text-gray-900">{stat.value}</div>
             <div className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts */}
      {summary.lowStock > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-yellow-800">Low Stock Attention Required</h3>
            <p className="text-yellow-700 text-sm mt-1">{summary.lowStock} products are running low on inventory. Consider restocking soon to avoid losing sales.</p>
          </div>
          <button 
            onClick={() => setStatusFilter("LOW_STOCK")}
            className="ml-auto px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm font-bold rounded-lg transition-colors"
          >
            View Low Stock
          </button>
        </div>
      )}
      
      {summary.outOfStock > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-800">Out of Stock Alert</h3>
            <p className="text-red-700 text-sm mt-1">{summary.outOfStock} products are currently out of stock and cannot be purchased by buyers.</p>
          </div>
          <button 
            onClick={() => setStatusFilter("OUT_OF_STOCK")}
            className="ml-auto px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-bold rounded-lg transition-colors"
          >
            View Out of Stock
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products or SKU..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
            <select 
              className="w-full sm:w-auto border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select 
              className="w-full sm:w-auto border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="NEWEST">Sort: Default</option>
              <option value="STOCK_LOW">Stock: Low to High</option>
              <option value="STOCK_HIGH">Stock: High to Low</option>
              <option value="SALES_HIGH">Sales: Highest</option>
              <option value="PRICE_HIGH">Price: High to Low</option>
              <option value="PRICE_LOW">Price: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading inventory data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-xl flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p className="font-bold">{error}</p>
          <button onClick={fetchInventory} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-colors">Try Again</button>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 max-w-sm mb-6">
            {inventory.length === 0 
              ? "You haven't added any products to your store yet. Add products to start managing inventory." 
              : "No products match your current search and filters."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="p-4">Product & SKU</th>
                  <th className="p-4 text-right">Price</th>
                  <th className="p-4 text-right">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Sold</th>
                  <th className="p-4 text-right">Value</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInventory.map((item) => (
                  <tr key={item.productId} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <img src={item.image || "https://placehold.co/100x100"} alt={item.productName} className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                        <div>
                          <div className="font-bold text-gray-900 text-sm line-clamp-2 max-w-xs">{item.productName}</div>
                          <div className="text-xs text-gray-500 mt-1 font-mono">{item.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="font-semibold text-gray-900 text-sm">₹{item.price.toLocaleString()}</div>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="font-bold text-gray-900 text-base">{item.stock}</div>
                      <div className="text-[10px] text-gray-400 mt-1 uppercase">Threshold: {item.lowStockThreshold}</div>
                    </td>
                    <td className="p-4 align-middle">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="font-medium text-gray-900 text-sm">{item.totalSold} units</div>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="font-bold text-gray-900 text-sm">₹{item.inventoryValue.toLocaleString()}</div>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setUpdateForm({ mode: "add", amount: 0, threshold: item.lowStockThreshold, reason: "" });
                            setUpdateModal({ isOpen: true, product: item });
                          }}
                          className="p-2 hover:bg-primary/10 hover:text-primary text-gray-500 rounded-lg transition-colors border border-transparent hover:border-primary/20"
                          title="Update Stock"
                        >
                          <Settings2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => openHistoryModal(item)}
                          className="p-2 hover:bg-gray-100 hover:text-gray-900 text-gray-500 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                          title="View History"
                        >
                          <History className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Stock Modal */}
      {updateModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">Update Inventory</h3>
              <button onClick={() => setUpdateModal({ isOpen: false, product: null })} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateStockSubmit} className="p-6">
              <div className="mb-6 flex gap-4 items-center">
                <img src={updateModal.product.image || "https://placehold.co/100"} alt="" className="w-16 h-16 rounded-xl border border-gray-200 object-cover" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900 line-clamp-2">{updateModal.product.productName}</h4>
                  <p className="text-sm text-gray-500 mt-1">Current Stock: <strong className="text-gray-900">{updateModal.product.stock}</strong></p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Update Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => setUpdateForm({...updateForm, mode: 'add'})} className={`py-2 text-sm font-bold rounded-lg border flex items-center justify-center gap-1 transition-all ${updateForm.mode === 'add' ? 'bg-green-50 border-green-200 text-green-700 ring-2 ring-green-600/20' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      <Plus className="w-4 h-4" /> Add
                    </button>
                    <button type="button" onClick={() => setUpdateForm({...updateForm, mode: 'remove'})} className={`py-2 text-sm font-bold rounded-lg border flex items-center justify-center gap-1 transition-all ${updateForm.mode === 'remove' ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-600/20' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      <Minus className="w-4 h-4" /> Remove
                    </button>
                    <button type="button" onClick={() => setUpdateForm({...updateForm, mode: 'exact'})} className={`py-2 text-sm font-bold rounded-lg border flex items-center justify-center gap-1 transition-all ${updateForm.mode === 'exact' ? 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-600/20' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      <Settings2 className="w-4 h-4" /> Exact
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                    {updateForm.mode === 'exact' ? 'Set Exact Stock To' : 'Quantity'}
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-lg"
                    value={updateForm.amount}
                    onChange={(e) => setUpdateForm({...updateForm, amount: e.target.value})}
                  />
                  {updateForm.mode === 'remove' && Number(updateForm.amount) > updateModal.product.stock && (
                    <p className="text-xs font-bold text-red-500 mt-2">Cannot remove more than current stock ({updateModal.product.stock}).</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Low Stock Threshold</label>
                  <input 
                    type="number" 
                    min="0"
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    value={updateForm.threshold}
                    onChange={(e) => setUpdateForm({...updateForm, threshold: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Alerts you when stock falls to or below this number.</p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Reason (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. Received new shipment"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    value={updateForm.reason}
                    onChange={(e) => setUpdateForm({...updateForm, reason: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setUpdateModal({isOpen: false, product: null})} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdating || (updateForm.mode === 'remove' && Number(updateForm.amount) > updateModal.product.stock)}
                  className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm sm:p-4">
          <div className="bg-white shadow-2xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl max-w-lg flex flex-col animate-in slide-in-from-right-8 sm:slide-in-from-bottom-8">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <div>
                <h3 className="font-bold text-lg">Inventory History</h3>
                <p className="text-xs text-gray-500 font-medium line-clamp-1">{historyModal.product.productName}</p>
              </div>
              <button onClick={() => setHistoryModal({ isOpen: false, product: null, history: [], loading: false })} className="text-gray-400 hover:text-gray-600 p-2">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {historyModal.loading ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                  <p className="text-sm font-medium text-gray-500">Loading history...</p>
                </div>
              ) : historyModal.history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <History className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No inventory changes recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {historyModal.history.map((tx, idx) => (
                    <div key={tx._id} className="relative pl-6 pb-6 border-l-2 border-gray-100 last:border-transparent last:pb-0">
                      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${tx.change > 0 ? 'bg-green-500' : tx.change < 0 ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                      
                      <div className="flex justify-between items-start mb-1">
                        <span className={`inline-flex items-center gap-1 font-bold text-sm ${tx.change > 0 ? 'text-green-600' : tx.change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {tx.change > 0 ? '+' : ''}{tx.change} units
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{new Date(tx.createdAt).toLocaleString()}</span>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                        <div className="flex justify-between text-xs mb-2 pb-2 border-b border-gray-200">
                          <span className="text-gray-500">Reason</span>
                          <span className="font-bold text-gray-700">{tx.reason.replace(/_/g, ' ')}</span>
                        </div>
                        {tx.orderId && (
                          <div className="flex justify-between text-xs mb-2 pb-2 border-b border-gray-200">
                            <span className="text-gray-500">Order ID</span>
                            <span className="font-mono text-gray-700">#{tx.orderId.slice(-8).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs pt-1">
                          <span className="text-gray-500">Stock changed from <strong className="text-gray-700">{tx.previousStock}</strong> to <strong className="text-gray-900">{tx.newStock}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
