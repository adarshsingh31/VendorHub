import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

const ADDRESS_TYPES = ["Home", "Work", "Other"];

/**
 * GET /api/users/addresses
 * Get all addresses for the authenticated user
 */
export const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/addresses
 * Add a new address for the authenticated user
 */
export const addAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      type,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      location,
      isDefault,
    } = req.body;

    // Validate required fields
    if (
      !type ||
      !fullName ||
      !phone ||
      !addressLine1 ||
      !city ||
      !state ||
      !postalCode
    ) {
      return next(new ApiError("Missing required address fields", 400));
    }

    // Validate address type
    if (!ADDRESS_TYPES.includes(type)) {
      return next(
        new ApiError("Address type must be Home, Work, or Other", 400),
      );
    }

    // Validate phone format (basic check)
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      return next(new ApiError("Phone number must be at least 10 digits", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    const existingType = user.addresses.find((addr) => addr.type === type);
    if (existingType) {
      return res.status(409).json({
        success: false,
        message: `You already have a ${type} address. Please edit the existing ${type} address instead.`,
      });
    }

    // If this is the default address, unset all others
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Create new address
    const newAddress = {
      type,
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || "",
      city,
      state,
      postalCode,
      country: country || "India",
      location: location || {},
      isDefault: isDefault || false,
      createdAt: new Date(),
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: user.addresses[user.addresses.length - 1],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/addresses/:addressId
 * Update an existing address
 */
export const updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const {
      type,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      location,
      isDefault,
    } = req.body;

    // Validate required fields
    if (type && !ADDRESS_TYPES.includes(type)) {
      return next(
        new ApiError("Address type must be Home, Work, or Other", 400),
      );
    }

    if (phone && !/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      return next(new ApiError("Phone number must be at least 10 digits", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    // Find the address to update
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId,
    );

    if (addressIndex === -1) {
      return next(new ApiError("Address not found", 404));
    }

    if (type) {
      const conflictingType = user.addresses.find(
        (addr) => addr.type === type && addr._id.toString() !== addressId,
      );
      if (conflictingType) {
        return res.status(409).json({
          success: false,
          message: `A ${type} address already exists. Please edit the existing ${type} address instead.`,
        });
      }
    }

    // If setting as default, unset all others
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Update address fields
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      type: type || user.addresses[addressIndex].type,
      fullName: fullName || user.addresses[addressIndex].fullName,
      phone: phone || user.addresses[addressIndex].phone,
      addressLine1: addressLine1 || user.addresses[addressIndex].addressLine1,
      addressLine2:
        addressLine2 !== undefined
          ? addressLine2
          : user.addresses[addressIndex].addressLine2,
      city: city || user.addresses[addressIndex].city,
      state: state || user.addresses[addressIndex].state,
      postalCode: postalCode || user.addresses[addressIndex].postalCode,
      country: country || user.addresses[addressIndex].country,
      location: location || user.addresses[addressIndex].location,
      isDefault:
        isDefault !== undefined
          ? isDefault
          : user.addresses[addressIndex].isDefault,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: user.addresses[addressIndex],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/addresses/:addressId
 * Delete an address
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId,
    );

    if (addressIndex === -1) {
      return next(new ApiError("Address not found", 404));
    }

    const wasDefault = user.addresses[addressIndex].isDefault;

    // Remove address
    user.addresses.splice(addressIndex, 1);

    // If deleted address was default and there are remaining addresses, set first one as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/addresses/:addressId/default
 * Set an address as the default address
 */
export const setDefaultAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId,
    );

    if (addressIndex === -1) {
      return next(new ApiError("Address not found", 404));
    }

    // Set all addresses to not default
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });

    // Set the selected address as default
    user.addresses[addressIndex].isDefault = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: user.addresses[addressIndex],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/addresses/default
 * Get the default address for the authenticated user
 */
export const getDefaultAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    const defaultAddress = user.addresses.find((addr) => addr.isDefault);

    res.status(200).json({
      success: true,
      data: defaultAddress || null,
    });
  } catch (error) {
    next(error);
  }
};
