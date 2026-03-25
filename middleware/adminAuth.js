import jwt from "jsonwebtoken";
import Admin from "../models/AdminSchema.js";
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

// ── Working hours — reads fresh data from DB so emergency access works ────
export const requireWorkingHours = async (req, res, next) => {
  try {
    // Super Admin always has full access
    if (req.admin?.role === "Super Admin") return next();

    // ── Fetch fresh admin data from DB ──────────────────────────
    // JWT is signed at login time so emergencyAccess granted AFTER
    // login won't be in the token — always check the DB instead
    const admin = await Admin.findById(req.admin.id).select(
      "emergencyAccess emergencyAccessExpiresAt role",
    );

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Check emergency access with expiry validation
    if (admin.emergencyAccess === true) {
      const expiry = admin.emergencyAccessExpiresAt;
      if (expiry && new Date() > new Date(expiry)) {
        // Expired — silently revoke
        await Admin.findByIdAndUpdate(req.admin.id, {
          emergencyAccess: false,
          emergencyAccessGrantedAt: null,
          emergencyAccessExpiresAt: null,
        });
        // Fall through to time check
      } else {
        return next(); // valid emergency access
      }
    }

    // Time check WAT (UTC+1)
    const now = new Date();
    const watTime = new Date(now.getTime() + 60 * 60 * 1000);
    const day = watTime.getUTCDay();
    const minutes = watTime.getUTCHours() * 60 + watTime.getUTCMinutes();

    const isWeekday = day >= 1 && day <= 5;
    const isWorkingHours = minutes >= 450 && minutes < 960;

    if (!isWeekday || !isWorkingHours) {
      return res.status(403).json({
        success: false,
        code: "OUTSIDE_WORKING_HOURS",
        message:
          "Admin portal is only accessible Monday–Friday, 7:30am–4:00pm (WAT). Contact the Super Admin for emergency access.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
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
