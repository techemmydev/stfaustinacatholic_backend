import Admin from "../models/AdminSchema.js";
import jwt from "jsonwebtoken";

// Login admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (admin.status === "Inactive") {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Login successful",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout admin
export const logoutAdmin = async (req, res) => {
  res.clearCookie("adminToken");
  res.json({ message: "Logged out successfully" });
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id; // From JWT token

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    admin.password = newPassword; // Will be hashed by pre-save hook
    await admin.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new admin
export const createAdmin = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const admin = new Admin({
      name,
      email,
      password,
      role: role || "Staff",
    });

    await admin.save();

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update admin
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Prevent changing Super Admin role
    if (admin.role === "Super Admin" && role !== "Super Admin") {
      return res
        .status(403)
        .json({ message: "Cannot change Super Admin role" });
    }

    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.role = role || admin.role;

    await admin.save();

    res.json({
      message: "Admin updated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle admin status
export const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role === "Super Admin") {
      return res.status(403).json({ message: "Cannot deactivate Super Admin" });
    }

    admin.status = admin.status === "Active" ? "Inactive" : "Active";
    await admin.save();

    res.json({
      message: `Admin ${admin.status === "Active" ? "activated" : "deactivated"} successfully`,
      admin: {
        id: admin._id,
        status: admin.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role === "Super Admin") {
      return res
        .status(403)
        .json({ message: "Cannot delete Super Admin account" });
    }

    await Admin.findByIdAndDelete(id);

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current admin (from token)
export const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
