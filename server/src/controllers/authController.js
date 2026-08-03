import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Regex for basic email format validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shared JWT signing helper — keeps all tokens consistent
const signToken = (user) =>
  jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "fallback_jwt_secret",
    { expiresIn: "7d" }
  );

// Google OAuth2 client — initialized once with the server-side Client ID
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


/**
 * Handle new user signup
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // 2. Validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // 3. Validate password length (at least 8 characters)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // 4. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create user in database
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user", // default role
    });

    // 7. Generate JWT using the shared helper
    const token = signToken(user);

    // 8. Return response (excluding password)
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasPassword: !!user.password,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Handle user login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // 2. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Guard: Google-only accounts have no password set
    if (!user.password) {
      return res.status(400).json({
        success: false,
        authProvider: user.authProvider,
        message:
          "This account was created with Google. Please sign in with Google or visit Settings to set a password.",
      });
    }

    // 4. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4. Generate JWT using the shared helper
    const token = signToken(user);

    // 5. Return response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasPassword: !!user.password,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * POST /api/auth/google
 *
 * Google One Tap / OAuth flow:
 *   1. Frontend receives a credential (Google ID token) after the user
 *      clicks "Continue with Google".
 *   2. This endpoint verifies that token with Google's servers.
 *   3. Extracts the user profile (sub = Google UID, email, name, picture).
 *   4. Upserts the user in MongoDB:
 *        - First-time: creates a new document (no password needed).
 *        - Returning: finds by googleId OR email and updates the record.
 *   5. Issues a VendorHub JWT and returns it alongside the user object.
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    // 1. Ensure the credential token is present
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential token is required",
      });
    }

    // 2. Verify the ID token with Google's public keys
    //    audience = our Client ID, so we reject tokens minted for other apps
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // 3. Extract verified user data from the token payload
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account does not have a public email address",
      });
    }

    // 4. Upsert the user:
    //    findOneAndUpdate with upsert:true will INSERT if no match is found.
    //    We match on googleId first; if a user signed up with the same email
    //    previously, we also patch their record with the googleId.
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Case B — existing local account: link Google credentials
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        // User now has BOTH local password AND Google — reflect that
        user.authProvider = "both";
        await user.save();
      }
      // Case C — already linked: nothing to update, just log in
    } else {
      // Brand-new Google user — create the record (no password)
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        authProvider: "google",
        role: "user",
      });
    }

    // 5. Issue a VendorHub JWT using the shared helper
    const token = signToken(user);

    // 6. Return the token and public user fields
    return res.status(200).json({
      success: true,
      message: "Google authentication successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        hasPassword: !!user.password,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);

    // Google will throw an error if the token is tampered, expired, or has
    // the wrong audience — return a clear 401 instead of 500 in those cases.
    const isTokenError =
      error.message?.includes("Invalid token") ||
      error.message?.includes("Token used too late") ||
      error.message?.includes("Wrong recipient");

    return res.status(isTokenError ? 401 : 500).json({
      success: false,
      message: isTokenError
        ? "Invalid or expired Google token. Please try again."
        : "Internal server error",
    });
  }
};

/**
 * POST /api/auth/set-password  (protected — JWT required)
 *
 * Allows a Google-only user (authProvider = "google") to add a local
 * password so they can also sign in with email/password in the future.
 * Also works for any authenticated user who wants to change their password.
 *
 * Body: { password, confirmPassword }
 */
export const setPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Please provide both password and confirmPassword" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.password = await bcrypt.hash(password, 10);
    if (user.authProvider === "google") user.authProvider = "both";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password set successfully. You can now sign in with email and password.",
      hasPassword: true,
    });
  } catch (error) {
    console.error("Set Password Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PUT /api/auth/change-password  (protected — JWT required)
 *
 * Allows users who already have a password (authProvider = "local" | "both")
 * to change it after verifying their current password.
 *
 * Body: { currentPassword, newPassword, confirmPassword }
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // 1. Validate all fields are present
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide currentPassword, newPassword, and confirmPassword",
      });
    }

    // 2. Validate new password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    // 3. Confirm new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    // 4. Load user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // 5. Guard: cannot change password if none is set
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "No password is set on this account. Use Set Password instead.",
      });
    }

    // 6. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // 7. Prevent reusing the same password
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password",
      });
    }

    // 8. Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
