import jwt from "jsonwebtoken";

/**
 * protect — Authentication Middleware
 *
 * Verifies a JWT from the Authorization header (Bearer <token>).
 * On success: attaches the decoded user payload to req.user and calls next().
 * On failure: returns 401 Unauthorized with a descriptive JSON error.
 */
const protect = (req, res, next) => {
  try {
    // 1. Extract the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // 2. Isolate the token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token is malformed.",
      });
    }

    // 3. Verify the token against JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the decoded payload to req.user
    // Payload shape (set in authController): { userId, email, role }
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    // 5. Pass control to the next middleware / route handler
    next();
  } catch (error) {
    // Handle specific JWT errors with clear messages
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    }

    // Fallback for any other unexpected errors
    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

export default protect;
