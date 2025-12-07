// controllers/adminController.js
import Parish from "../models/UserparishSchema.js";
import bcrypt from "bcrypt";

// Create a new member (Admin registration)
export const createAdmin = async (req, res) => {
  try {
    const { email, password, ...otherFields } = req.body;

    // Check if email already exists
    const existingMember = await Parish.findOne({ email });
    if (existingMember) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new admin member
    const newAdmin = new Parish({
      email,
      role: "admin", // force admin
      password: hashedPassword,
      ...otherFields,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: newAdmin._id,
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all parish members with pagination and search
export const getAllMembers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      gender,
      maritalStatus,
      ministry,
    } = req.query;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (gender) query.gender = gender;
    if (maritalStatus) query.maritalStatus = maritalStatus;
    if (ministry) query.ministries = { $in: [ministry] };

    const members = await Parish.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Parish.countDocuments(query);

    res.status(200).json({
      members,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalMembers: count,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single member by ID
export const getMemberById = async (req, res) => {
  try {
    const member = await Parish.findById(req.params.id).select("-password");
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json({ member });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update any member's profile
export const updateMember = async (req, res) => {
  try {
    const { password, ...updateFields } = req.body;

    const member = await Parish.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // If password is being updated
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const updatedMember = await Parish.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      message: "Member updated successfully",
      member: updatedMember,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a member
export const deleteMember = async (req, res) => {
  try {
    const member = await Parish.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
