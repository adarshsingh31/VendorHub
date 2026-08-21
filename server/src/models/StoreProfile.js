import mongoose from "mongoose";

const storeProfileSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Store Profile
    storeName: { type: String, default: "" },
    storeSlug: { type: String, unique: true, sparse: true },
    storeDescription: { type: String, default: "" },
    storeLogo: { type: String, default: "" },
    storeBanner: { type: String, default: "" },
    storeCategory: { type: String, default: "" },
    location: {
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "India" },
    },
    
    // Visibility
    storeStatus: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    storeClosedMessage: { type: String, default: "" },

    // Shipping Settings
    shippingEnabled: { type: Boolean, default: true },
    shippingFee: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number, default: 0 },
    estimatedDeliveryTime: { type: String, default: "3-7 days" },

    // Order Settings
    processingTime: { type: Number, default: 2 },
    autoConfirmOrders: { type: Boolean, default: true },
    allowCustomerCancellation: { type: Boolean, default: true },

    // Policies
    returnPolicy: { type: String, default: "" },
    refundPolicy: { type: String, default: "" },
    cancellationPolicy: { type: String, default: "" },
    shippingPolicy: { type: String, default: "" },

    // Business Info
    businessEmail: { type: String, default: "" },
    businessPhone: { type: String, default: "" },
    businessHours: {
      type: Map,
      of: new mongoose.Schema({
        enabled: { type: Boolean, default: true },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "18:00" }
      }, { _id: false }),
      default: {
        monday: { enabled: true, open: "09:00", close: "18:00" },
        tuesday: { enabled: true, open: "09:00", close: "18:00" },
        wednesday: { enabled: true, open: "09:00", close: "18:00" },
        thursday: { enabled: true, open: "09:00", close: "18:00" },
        friday: { enabled: true, open: "09:00", close: "18:00" },
        saturday: { enabled: false, open: "10:00", close: "16:00" },
        sunday: { enabled: false, open: "10:00", close: "16:00" }
      }
    },

    // Notifications
    notificationPreferences: {
      newOrder: { type: Boolean, default: true },
      orderCancelled: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      newReview: { type: Boolean, default: true },
      paymentReceived: { type: Boolean, default: true },
      payoutCompleted: { type: Boolean, default: true },
    },

    // Payout Settings
    payoutMethod: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("StoreProfile", storeProfileSchema);
