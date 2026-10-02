import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
// ─── Helpers ──────────────────────────────────────────────────────────────────

// Regex for basic email format validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shared JWT signing helper — keeps all tokens consistent
const signToken = (user) =>
  jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "fallback_jwt_secret",
    { expiresIn: "7d" },
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
      role: "buyer", // default role — all new users start as buyers
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
        avatar: user.avatar,
        role: user.role,
        hasPassword: !!user.password,
        authProvider: user.authProvider,
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
        avatar: user.avatar,
        role: user.role,
        hasPassword: !!user.password,
        authProvider: user.authProvider,
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
        role: "buyer",
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
        authProvider: user.authProvider,
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
      return res.status(400).json({
        success: false,
        message: "Please provide both password and confirmPassword",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const user = await User.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.password) {
      return res.status(400).json({
        success: false,
        message: "Password is already set. Use Change Password instead.",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    if (user.authProvider === "google") user.authProvider = "both";
    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password set successfully. You can now sign in with email and password.",
      hasPassword: true,
    });
  } catch (error) {
    console.error("Set Password Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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
        message:
          "Please provide currentPassword, newPassword, and confirmPassword",
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
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // 5. Guard: cannot change password if none is set
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "No password is set on this account. Use Set Password instead.",
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
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    // 1. Get email from request
    const { email } = req.body;

    // 2. Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 3. Generate random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 4. Hash the token before saving it
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 5. Save hashed token in database
    user.resetPasswordToken = hashedToken;

    // 6. Token expires after 15 minutes
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    // 7. Save changes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your VendorHub Password</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f7fb;
  font-family: Arial, Helvetica, sans-serif;
">

  <div style="
    max-width: 600px;
    margin: 40px auto;
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  ">

    <!-- Header -->
    <div style="
      background: #111827;
      padding: 28px;
      text-align: center;
    ">
      <h1 style="
        margin: 0;
        color: #ffffff;
        font-size: 28px;
      ">
        VendorHub
      </h1>

      <p style="
        margin: 8px 0 0;
        color: #9ca3af;
        font-size: 14px;
      ">
        Your trusted vendor platform
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 35px;">

      <h2 style="
        margin-top: 0;
        color: #111827;
        font-size: 24px;
      ">
        Reset Your Password 🔐
      </h2>

      <p style="
        color: #4b5563;
        font-size: 15px;
        line-height: 1.7;
      ">
        We received a request to reset your VendorHub account password.
        Click the button below to create a new password.
      </p>

      <!-- Button -->
      <div style="
        text-align: center;
        margin: 32px 0;
      ">
        <a href="${resetUrl}" style="
          display: inline-block;
          padding: 14px 28px;
          background-color: #2563eb;
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: bold;
        ">
          Reset My Password
        </a>
      </div>

      <p style="
        color: #6b7280;
        font-size: 14px;
        line-height: 1.6;
      ">
        This password reset link will expire in
        <strong>15 minutes</strong>.
      </p>

      <div style="
        margin: 25px 0;
        padding: 15px;
        background-color: #f9fafb;
        border-left: 4px solid #2563eb;
      ">
        <p style="
          margin: 0;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.5;
        ">
          If you didn't request a password reset, you can safely ignore
          this email. Your password will remain unchanged.
        </p>
      </div>

      <p style="
        color: #4b5563;
        font-size: 14px;
        line-height: 1.6;
      ">
        If the button doesn't work, copy and paste the following link
        into your browser:
      </p>

      <p style="
        word-break: break-all;
        font-size: 12px;
        color: #2563eb;
      ">
        ${resetUrl}
      </p>

    </div>

    <!-- Footer -->
    <div style="
      padding: 20px 30px;
      background-color: #f9fafb;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    ">
      <p style="
        margin: 0;
        color: #9ca3af;
        font-size: 12px;
      ">
        © ${new Date().getFullYear()} VendorHub. All rights reserved.
      </p>

      <p style="
        margin: 6px 0 0;
        color: #9ca3af;
        font-size: 12px;
      ">
        This is an automated email. Please do not reply.
      </p>
    </div>

  </div>

</body>
</html>
`;

    try {
      await sendEmail({
        email: user.email,
        subject: "VendorHub Password Reset",
        message: message,
      });

      res.status(200).json({
        message: "Password reset email sent",
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.error("Email Error:", emailError);
      return res.status(500).json({
        message: "Email could not be sent",
      });
    }
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    // Get token from URL
    const { token } = req.params;

    // Get new password
    const { password } = req.body;

    // Hash the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    // Token invalid or expired
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Hash the new password
    user.password = await bcrypt.hash(password, 10); // Using standard bcrypt hashing

    // Remove reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save user
    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
