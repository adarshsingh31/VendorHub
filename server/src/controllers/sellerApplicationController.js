import jwt from "jsonwebtoken";
import SellerApplication from "../models/SellerApplication.js";
import User from "../models/User.js";

// ─── Helper: sign a fresh JWT (mirrors authController.signToken) ───────────────
const signToken = (user) =>
  jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "fallback_jwt_secret",
    { expiresIn: "7d" }
  );

// ─── Buyer Endpoints ──────────────────────────────────────────────────────────

/**
 * POST /api/seller/apply
 *
 * Submit a new seller application.
 * - Validates required fields
 * - Blocks submission if a pending application already exists
 * - Creates the application with status = 'pending'
 * - Does NOT change the user's role
 */
export const submitApplication = async (req, res) => {
  try {
    const { shopName, shopDescription, phone, city, shopAddress } = req.body;

    // 1. Validate required fields
    if (!shopName || !shopDescription || !phone || !city || !shopAddress) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: shopName, shopDescription, phone, city, shopAddress",
      });
    }

    // 2. Check for an existing pending application
    const existing = await SellerApplication.findOne({
      user: req.user.id,
      status: "pending",
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "You already have a pending seller application. Please wait for admin review.",
      });
    }

    // 3. Create the application
    const application = await SellerApplication.create({
      user: req.user.id,
      shopName: shopName.trim(),
      shopDescription: shopDescription.trim(),
      phone: phone.trim(),
      city: city.trim(),
      shopAddress: shopAddress.trim(),
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message:
        "Application submitted successfully. Our admin team will review it shortly.",
      application,
    });
  } catch (error) {
    // Handle MongoDB duplicate key error from the partial unique index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "You already have a pending seller application. Please wait for admin review.",
      });
    }
    console.error("Submit Application Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/seller/application
 *
 * Returns the latest seller application for the logged-in user.
 * Returns null if no application exists (not an error).
 */
export const getMyApplication = async (req, res) => {
  try {
    const application = await SellerApplication.findOne({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      application: application || null,
    });
  } catch (error) {
    console.error("Get Application Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─── Admin Endpoints ──────────────────────────────────────────────────────────

/**
 * GET /api/admin/seller-applications
 *
 * Returns all seller applications, populated with applicant name and email.
 * Sorted by createdAt descending (newest first).
 */
export const getAllApplications = async (req, res) => {
  try {
    const applications = await SellerApplication.find()
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get All Applications Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * PATCH /api/admin/seller-applications/:id/approve
 *
 * Approve a seller application:
 *   1. Sets application.status = 'approved' and reviewedAt = now
 *   2. Updates User.role = 'seller'
 *   3. Issues a fresh JWT reflecting the new role
 *   4. Returns the updated application + fresh token + updated user
 */
export const approveApplication = async (req, res) => {
  try {
    const application = await SellerApplication.findById(req.params.id);

    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}`,
      });
    }

    // 1. Update application status
    application.status = "approved";
    application.reviewedAt = new Date();
    await application.save();

    // 2. Upgrade user role to seller
    const user = await User.findByIdAndUpdate(
      application.user,
      { role: "seller" },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Associated user not found" });
    }

    // 3. Issue fresh JWT with new seller role
    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: `Application approved. ${user.name} is now a seller.`,
      application,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        hasPassword: !!user.password,
      },
    });
  } catch (error) {
    console.error("Approve Application Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * PATCH /api/admin/seller-applications/:id/reject
 *
 * Reject a seller application:
 *   1. Sets application.status = 'rejected'
 *   2. Saves admin's rejection reason in adminNote
 *   3. Sets reviewedAt = now
 *   4. Does NOT change the user's role
 */
export const rejectApplication = async (req, res) => {
  try {
    const { adminNote } = req.body;

    const application = await SellerApplication.findById(req.params.id);

    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}`,
      });
    }

    application.status = "rejected";
    application.adminNote = adminNote?.trim() || null;
    application.reviewedAt = new Date();
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Application rejected.",
      application,
    });
  } catch (error) {
    console.error("Reject Application Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
