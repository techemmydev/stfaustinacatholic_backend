// middleware/auth.js
import jwt from "jsonwebtoken";
import Parish from "../models/UserparishSchema.js";

// Verify JWT token and authenticate user
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    const user = await Parish.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user info to request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.user = user;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Check if user is accessing their own resource
export const isSelfOrAdmin = (req, res, next) => {
  try {
    const requestedUserId = req.params.id;

    if (req.userRole === "admin" || req.userId === requestedUserId) {
      next();
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
