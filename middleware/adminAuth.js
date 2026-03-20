import jwt from "jsonwebtoken";

export const authenticateAdmin = (req, res, next) => {
  try {
    // ── 1. Try cookie first (desktop browsers) ─────────────────
    let token = req.cookies.adminToken;

    // ── 2. Fall back to Authorization header (mobile Safari) ───
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

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
