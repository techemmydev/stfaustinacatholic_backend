// controllers/adminSettingsController.js
import Admin from "../models/AdminSchema.js";

// ── GET current admin profile ─────────────────────────────────
export const getAdminProfile = async (req, res) => {
  try {
    // req.admin.id comes from the decoded JWT cookie (set by verifyAdmin middleware)
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found." });
    res.status(200).json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── UPDATE profile (name, email, notifications, systemConfig) ─
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, notifications, systemConfig } = req.body;

    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ message: "Admin not found." });

    if (name !== undefined) admin.name = name.trim();
    if (email !== undefined) admin.email = email.toLowerCase().trim();

    if (notifications !== undefined) {
      // Spread-merge so a partial update doesn't wipe existing prefs.
      // notifications may not exist yet on old docs, so fall back to {}
      const existing =
        admin.notifications?.toObject?.() ?? admin.notifications ?? {};
      admin.notifications = { ...existing, ...notifications };
    }

    if (systemConfig !== undefined) {
      const existing =
        admin.systemConfig?.toObject?.() ?? admin.systemConfig ?? {};
      admin.systemConfig = { ...existing, ...systemConfig };
    }

    await admin.save();
    const result = admin.toObject();
    delete result.password;
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── UPDATE password ────────────────────────────────────────────
export const updateAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ message: "All password fields are required." });

    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters." });

    // Fetch WITH password so comparePassword works
    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ message: "Admin not found." });

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });

    // Assigning plain text + save() triggers the pre-save bcrypt hook
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
