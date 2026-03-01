import jwt from "jsonwebtoken";

export const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireSuperAdmin = (req, res, next) => {
  if (req.admin.role !== "Super Admin") {
    return res.status(403).json({ message: "Super Admin access required" });
  }
  next();
};

export const requireAdminOrAbove = (req, res, next) => {
  if (req.admin.role !== "Admin" && req.admin.role !== "Super Admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
