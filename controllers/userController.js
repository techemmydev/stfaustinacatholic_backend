// controllers/userController.js
import Parish from "../models/UserparishSchema.js";
import bcrypt from "bcryptjs";

// Get logged-in member's profile
export const getMyProfile = async (req, res) => {
  try {
    const member = await Parish.findById(req.userId).select("-password");
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json({ member });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update logged-in member's profile
export const updateMyProfile = async (req, res) => {
  try {
    const { email, role, ...updateFields } = req.body;

    // Prevent updating email and role
    const member = await Parish.findById(req.userId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // If password is being updated
    if (updateFields.password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(updateFields.password, salt);
    }

    const updatedMember = await Parish.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      member: updatedMember,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Please provide both current and new password" });
    }

    const member = await Parish.findById(req.userId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      member.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    member.password = hashedPassword;
    await member.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete own account
export const deleteMyAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ message: "Please provide password to confirm deletion" });
    }

    const member = await Parish.findById(req.userId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, member.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    await Parish.findByIdAndDelete(req.userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
