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
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
