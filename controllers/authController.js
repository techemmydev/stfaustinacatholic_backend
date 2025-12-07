// this is my parish member registration controller
// parishioner can register themselves on the website and also login with their credentials password and email address.
import Parish from "../models/UserparishSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Register a new parish member
export const userAndAdminParishregistration = async (req, res) => {
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
      role: "user", // default role is user
      ...otherFields,
    });
    // Save to database
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
        isLoggedIn: newMember.isLoggedIn,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//userAndAdminParishlogin controller
// LOGIN (both user & admin)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const member = await Parish.findOne({ email });
    if (!member)
      return res.status(404).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Mark user as logged in
    member.isLoggedIn = true;
    await member.save();

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
        isLoggedIn: member.isLoggedIn, // now true
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Logout (both user & admin)
export const logoutforAdminandUser = async (req, res) => {
  try {
    const memberId = req.user._id;

    const member = await Parish.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "User not found" });
    }

    member.isLoggedIn = false;
    await member.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
