import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { paymentService } from '../../services/paymentService';
import api from '../../services/axiosInstance';

// ─── Razorpay script loader (idempotent) ──────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-checkout-js')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Form field component ─────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text', required = true }) {
  return (
    <div>
      <label className="block text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-text"
      />
    </div>
  );
}

// ─── Order Success Screen ─────────────────────────────────────────────────────
function OrderSuccess({ order, onViewOrders }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-10">
      <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-soft max-w-md w-full">
        <div className="w-20 h-20 rounded-full bg-[#E6F2E9] flex items-center justify-center mx-auto mb-5">
          <span className="material-symbols-outlined text-4xl text-[#1E7A3E]">check_circle</span>
        </div>
        <h2 className="text-2xl font-display font-bold text-text mb-2">Order Confirmed!</h2>
        <p className="text-text-soft mb-2">
          Your payment of <span className="font-bold text-text">₹{order?.totalAmount?.toLocaleString('en-IN')}</span> was successful.
        </p>
        <p className="text-sm text-text-muted mb-1">
          Order ID: <span className="font-mono font-semibold text-text">{order?._id?.slice(-8).toUpperCase()}</span>
        </p>
        {order?.razorpayPaymentId && (
          <p className="text-xs text-text-muted mb-6">
            Payment ID: <span className="font-mono">{order.razorpayPaymentId}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onViewOrders}
            className="bg-primary text-primary-content font-bold px-6 py-2.5 rounded-lg hover:bg-primary-hover transition-colors"
          >
            View My Orders
          </button>
          <button
            onClick={() => window.location.href = '/buyer/products'}
            className="bg-surface text-text-soft border border-border font-semibold px-6 py-2.5 rounded-lg hover:bg-surface-sunken transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main CheckoutPage ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Cart state
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState('');

  // Shipping address form
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Payment states
  const [paying, setPaying] = useState(false);   // waiting for create-order or SDK
  const [payError, setPayError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const DELIVERY_FEE = 49;

  // ── Fetch cart on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setCartLoading(true);
        const res = await api.get('/api/cart');
        if (!cancelled) setCart(res.data.cart);
      } catch {
        if (!cancelled) setCartError('Failed to load cart. Please go back and try again.');
      } finally {
        if (!cancelled) setCartLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Derived values ───────────────────────────────────────────────────────────
  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalAmount = subtotal + DELIVERY_FEE;

  // ── Address field setter ─────────────────────────────────────────────────────
  const setField = useCallback((key) => (val) => {
    setAddress((prev) => ({ ...prev, [key]: val }));
    setPayError('');
  }, []);

  // ── Validate address ─────────────────────────────────────────────────────────
  const validateAddress = () => {
    if (!address.fullName.trim()) return 'Please enter your full name.';
    if (!address.phone.trim()) return 'Please enter your phone number.';
    if (!address.addressLine1.trim()) return 'Please enter your address.';
    if (!address.city.trim()) return 'Please enter your city.';
    if (!address.state.trim()) return 'Please enter your state.';
    if (!address.postalCode.trim()) return 'Please enter your postal code.';
    return null;
  };

  // ── Main pay handler ──────────────────────────────────────────────────────────
  const handlePay = async () => {
    setPayError('');
    const addrError = validateAddress();
    if (addrError) { setPayError(addrError); return; }
    if (items.length === 0) { setPayError('Your cart is empty.'); return; }

    setPaying(true);

    try {
      // 1. Load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPayError('Failed to load Razorpay checkout. Please check your internet connection.');
        setPaying(false);
        return;
      }

      // 2. Create Razorpay order on backend (amount is computed server-side)
      let orderData;
      try {
        orderData = await paymentService.createOrder();
      } catch (err) {
        setPayError(
          err?.response?.data?.message || 'Failed to initiate payment. Please try again.'
        );
        setPaying(false);
        return;
      }

      // 3. Open Razorpay checkout modal
      const options = {
        key: orderData.keyId,                     // PUBLIC key only
        amount: orderData.amountInPaise,           // in paise
        currency: orderData.currency,
        name: 'VendorHub',
        description: `Order of ${orderData.itemCount} item(s)`,
        image: '',                                 // optional logo URL
        order_id: orderData.razorpayOrderId,

        // Pre-fill with authenticated user details
        prefill: {
          name: user?.name || address.fullName,
          email: user?.email || '',
          contact: address.phone,
        },

        theme: { color: '#f2a93b' },              // VendorHub orange

        // ── Payment success handler ──────────────────────────────────────────
        handler: async (response) => {
          // response = { razorpay_order_id, razorpay_payment_id, razorpay_signature }
          try {
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress: address,
            });
            setConfirmedOrder(verifyRes.order);
          } catch (err) {
            setPayError(
              err?.response?.data?.message ||
              'Payment was received but verification failed. Please contact support with your Payment ID: ' +
              response.razorpay_payment_id
            );
          } finally {
            setPaying(false);
          }
        },

        modal: {
          // User closes modal without paying
          ondismiss: () => {
            setPayError('Payment was cancelled. Your cart has not been charged.');
            setPaying(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      // ── Payment failure handler ──────────────────────────────────────────────
      razorpayInstance.on('payment.failed', (response) => {
        setPayError(
          `Payment failed: ${response.error.description || 'Unknown error'}. Please try again.`
        );
        setPaying(false);
      });

      razorpayInstance.open();

    } catch (err) {
      console.error('Pay handler error:', err);
      setPayError('Something went wrong. Please try again.');
      setPaying(false);
    }
  };

  // ── Order confirmed → show success screen ────────────────────────────────────
  if (confirmedOrder) {
    return (
      <OrderSuccess
        order={confirmedOrder}
        onViewOrders={() => navigate('/buyer/orders')}
      />
    );
  }

  // ── Loading cart ─────────────────────────────────────────────────────────────
  if (cartLoading) {
    return (
      <div className="max-w-5xl mx-auto py-2 animate-pulse space-y-4">
        <div className="h-8 w-48 bg-border rounded-lg" />
        <div className="grid md:grid-cols-[1fr_380px] gap-6">
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-border rounded-lg" />)}
          </div>
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 bg-border rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  // ── Cart fetch error ─────────────────────────────────────────────────────────
  if (cartError) {
    return (
      <div className="max-w-5xl mx-auto py-2">
        <div className="bg-danger-bg border border-danger/20 rounded-xl px-5 py-4 text-danger-content font-semibold text-sm">
          {cartError}
        </div>
      </div>
    );
  }

  // ── Empty cart ───────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl">shopping_cart</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-text mb-2">Your cart is empty</h2>
        <p className="text-text-muted mb-6">Add items to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/buyer/products')}
          className="bg-primary text-primary-content font-bold px-6 py-2.5 rounded-lg hover:bg-primary-hover transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  // ── Main checkout layout ──────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto py-2">
      {/* Page header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/buyer/cart')}
          className="flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-text transition-colors mb-3"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Cart
        </button>
        <h1 className="text-2xl font-display font-bold text-text">Checkout</h1>
        <p className="text-text-soft mt-1">Review your order and complete payment securely via Razorpay.</p>
      </div>

      <div className="grid md:grid-cols-[1fr_360px] gap-6 items-start">

        {/* ── Left: Delivery Address ─────────────────────────────────────── */}
        <div className="space-y-5">
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-soft">
            <h2 className="font-display text-[17px] font-bold text-text mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">location_on</span>
              Delivery Address
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" value={address.fullName} onChange={setField('fullName')} placeholder="e.g. Priya Sharma" />
              <Field label="Phone Number" value={address.phone} onChange={setField('phone')} placeholder="e.g. 9876543210" type="tel" />
            </div>

            <div className="mt-4">
              <Field label="Address Line 1" value={address.addressLine1} onChange={setField('addressLine1')} placeholder="House no., building, street" />
            </div>

            <div className="mt-4">
              <Field label="Address Line 2" value={address.addressLine2} onChange={setField('addressLine2')} placeholder="Landmark, area (optional)" required={false} />
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <Field label="City" value={address.city} onChange={setField('city')} placeholder="e.g. Mumbai" />
              <Field label="State" value={address.state} onChange={setField('state')} placeholder="e.g. Maharashtra" />
              <Field label="Postal Code" value={address.postalCode} onChange={setField('postalCode')} placeholder="e.g. 400001" />
            </div>
          </div>

          {/* ── Order Items ─────────────────────────────────────────────── */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-soft">
            <h2 className="font-display text-[17px] font-bold text-text mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">inventory_2</span>
              Order Items ({items.length})
            </h2>

            <div className="space-y-3">
              {items.map((item) => {
                const product = item.product;
                const name = product?.name || 'Product';
                const image = product?.images?.[0];
                const price = item.price;
                const qty = item.quantity;
                return (
                  <div key={item._id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        className="w-14 h-14 rounded-lg object-cover bg-background shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary">inventory_2</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text text-[13.5px] truncate">{name}</p>
                      <p className="text-text-muted text-[12px]">Qty: {qty}</p>
                    </div>
                    <p className="font-bold text-text text-[14px] shrink-0">
                      ₹{(price * qty).toLocaleString('en-IN')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right: Order Summary + Pay Button ─────────────────────────────── */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-soft sticky top-20">
          <h2 className="font-display text-[17px] font-bold text-text mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">receipt_long</span>
            Order Summary
          </h2>

          <div className="space-y-2.5 text-[13.5px]">
            <div className="flex justify-between text-text-soft">
              <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
              <span className="font-semibold text-text">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-text-soft">
              <span>Delivery fee</span>
              <span className="font-semibold text-text">₹{DELIVERY_FEE}</span>
            </div>
            <div className="h-px bg-border my-1" />
            <div className="flex justify-between font-bold text-text text-[15px]">
              <span>Total</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Razorpay badge */}
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2.5 mt-5 mb-4">
            <span className="material-symbols-outlined text-[18px] text-[#1E7A3E]">lock</span>
            <span className="text-[12px] text-text-muted">
              Secured by <span className="font-bold text-text">Razorpay</span> — Test Mode
            </span>
          </div>

          {/* Error message */}
          {payError && (
            <div className="bg-danger-bg border border-danger/20 rounded-lg px-3 py-2.5 text-danger-content text-[12.5px] font-semibold mb-4">
              <span className="material-symbols-outlined text-[15px] align-middle mr-1">error</span>
              {payError}
            </div>
          )}

          {/* Pay Now button */}
          <button
            onClick={handlePay}
            disabled={paying || items.length === 0}
            className="w-full bg-primary text-primary-content font-bold py-3 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-soft text-[15px]"
          >
            {paying ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-content border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">payment</span>
                Pay ₹{totalAmount.toLocaleString('en-IN')}
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-text-muted mt-3">
            By placing this order you agree to VendorHub's terms. This is a test payment.
          </p>

          {/* Test mode card hint */}
          <div className="mt-4 bg-[#FBEFDA] border border-primary/20 rounded-lg px-3 py-2.5 text-[11.5px] text-[#B9791C]">
            <p className="font-bold mb-0.5">🧪 Test Mode Card</p>
            <p className="font-mono">4111 1111 1111 1111</p>
            <p>Expiry: any future date · CVV: any 3 digits</p>
          </div>
        </div>
      </div>
    </div>
  );
}
