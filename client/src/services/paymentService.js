/**
 * paymentService.js
 *
 * API helpers for the Razorpay payment flow.
 * Uses the shared axiosInstance so every request automatically carries
 * the Authorization: Bearer <token> header.
 */
import api from "./axiosInstance";

export const paymentService = {
  /**
   * POST /api/payment/create-order
   * Fetches cart on server, creates Razorpay order, returns:
   *   { razorpayOrderId, amount, amountInPaise, currency, keyId, subtotal, deliveryFee }
   * RAZORPAY_KEY_SECRET is never included in the response.
   */
  createOrder: async () => {
    const { data } = await api.post("/api/payment/create-order");
    return data;
  },

  /**
   * POST /api/payment/verify
   * Sends Razorpay payment IDs + shippingAddress to the backend for
   * HMAC-SHA256 verification. Only called after Razorpay modal succeeds.
   * payload: { razorpay_order_id, razorpay_payment_id, razorpay_signature, shippingAddress }
   */
  verifyPayment: async (payload) => {
    const { data } = await api.post("/api/payment/verify", payload);
    return data;
  },

  /**
   * GET /api/payment/orders
   * Returns the current user's order history.
   */
  getMyOrders: async () => {
    const { data } = await api.get("/api/payment/orders");
    return data;
  },

  /**
   * GET /api/payment/admin/orders
   * Returns all platform orders for admins.
   */
  getAllAdminOrders: async () => {
    const { data } = await api.get("/api/payment/admin/orders");
    return data;
  },

  /**
   * PUT /api/payment/admin/orders/:id/status
   * Updates the status of an order.
   */
  updateAdminOrderStatus: async (orderId, status) => {
    const { data } = await api.put(`/api/payment/admin/orders/${orderId}/status`, { status });
    return data;
  }
};
