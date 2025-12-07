// controllers/userController.js

/**
 * 1. changePassword:
 *    - Allows the logged-in member to change their password.
 *    - Requires both the current password and a new password.
 *    - Verifies the current password using bcrypt.
 *    - If correct, hashes the new password and securely updates it.
 *    - Returns a success message once the password is changed.
 *
 * 2. updateMyProfile:
 *    - Lets the logged-in member update their personal profile details.
 *    - Blocks changes to restricted fields such as email and role.
 *    - If a new password is included, it is automatically hashed before saving.
 *    - Saves and returns the updated member profile without exposing the password.
 */

import Parish from "../models/UserparishSchema.js";
import bcrypt from "bcrypt";

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
