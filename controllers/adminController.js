// controllers/adminController.js
import Parish from "../models/UserparishSchema.js";
import bcrypt from "bcryptjs";

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

// Create a new member (Admin registration)
export const createMember = async (req, res) => {
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

    // Create new parish member
    const newMember = new Parish({
      email,
      password: hashedPassword,
      ...otherFields,
    });

    await newMember.save();

    res.status(201).json({
      message: "Member created successfully",
      member: {
        id: newMember._id,
        fullName: newMember.fullName,
        email: newMember.email,
        role: newMember.role,
      },
    });
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

// Update member role (promote/demote)
export const updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const member = await Parish.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json({
      message: `Member role updated to ${role}`,
      member,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get parish statistics
export const getParishStats = async (req, res) => {
  try {
    const totalMembers = await Parish.countDocuments();

    const genderStats = await Parish.aggregate([
      { $group: { _id: "$gender", count: { $sum: 1 } } },
    ]);

    const maritalStats = await Parish.aggregate([
      { $group: { _id: "$maritalStatus", count: { $sum: 1 } } },
    ]);

    const ministryStats = await Parish.aggregate([
      { $unwind: "$ministries" },
      { $group: { _id: "$ministries", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recentMembers = await Parish.find()
      .select("fullName email createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const ageRanges = await Parish.aggregate([
      {
        $addFields: {
          age: {
            $subtract: [{ $year: new Date() }, { $year: { $toDate: "$dob" } }],
          },
        },
      },
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 18, 30, 45, 60, 100],
          default: "Unknown",
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    res.status(200).json({
      totalMembers,
      genderStats,
      maritalStats,
      ministryStats,
      recentMembers,
      ageRanges,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Bulk operations - Export members to CSV format
export const exportMembers = async (req, res) => {
  try {
    const members = await Parish.find().select("-password -__v");

    res.status(200).json({
      message: "Members data exported",
      count: members.length,
      members,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
