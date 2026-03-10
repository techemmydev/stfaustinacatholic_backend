// middleware/verifyAdmin.js
import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
  try {
    // Token comes from cookie (set during login)
    const token = req.cookies?.adminToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: admin._id, role: admin.role }

    req.admin = decoded; // req.admin.id and req.admin.role are now available
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired, please login again" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Optional: restrict to specific roles
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin?.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};
