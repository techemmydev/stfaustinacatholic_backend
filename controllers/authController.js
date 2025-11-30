// controllers/authController.js
import Parish from "../models/UserparishSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register a new parish member
export const register = async (req, res) => {
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

    // Generate JWT token
    const token = jwt.sign(
      { id: newMember._id, role: newMember.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
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

// Login parish member
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find member by email
    const member = await Parish.findOne({ email });
    if (!member) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, member.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: member._id, role: member.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      member: {
        id: member._id,
        fullName: member.fullName,
        email: member.email,
        role: member.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Logout (client-side token removal, optional endpoint)
export const logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
