import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    // password is optional for Google-authenticated users
    password: {
      type: String,
      required: false,
      default: null,
    },
    // Stores the Google user ID for OAuth login — null for email/password users
    googleId: {
      type: String,
      default: null,
      index: true,
    },
    // Stores the Google profile picture URL
    avatar: {
      type: String,
      default: null,
    },
    // Indicates how the user authenticates: local-only, Google-only, or both
    authProvider: {
      type: String,
      enum: ["local", "google", "both"],
      default: "local",
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    // Admin-managed account status — suspended users cannot place orders
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    // Optional top-level phone number (separate from address phones)
    phone: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    addresses: [
      {
        type: {
          type: String,
          enum: ["Home", "Work", "Other"],
          required: true,
        },
        fullName: {
          type: String,
          required: true,
          trim: true,
        },
        phone: {
          type: String,
          required: true,
          trim: true,
        },
        addressLine1: {
          type: String,
          required: true,
          trim: true,
        },
        addressLine2: {
          type: String,
          default: "",
          trim: true,
        },
        city: {
          type: String,
          required: true,
          trim: true,
        },
        state: {
          type: String,
          required: true,
          trim: true,
        },
        postalCode: {
          type: String,
          required: true,
          trim: true,
        },
        country: {
          type: String,
          default: "India",
        },
        deliveryInstructions: {
          type: String,
          default: "",
          trim: true,
        },
        location: {
          latitude: {
            type: Number,
          },
          longitude: {
            type: Number,
          },
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Compound indexes for common query patterns
userSchema.index({ role: 1, status: 1 });   // Admin user filtering
userSchema.index({ role: 1, createdAt: -1 }); // New users dashboard

const User = mongoose.model("User", userSchema);

export default User;
