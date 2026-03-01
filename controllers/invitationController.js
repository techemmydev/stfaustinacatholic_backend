import Invitation from "../models/InvitationSchema.js";

// ============ PUBLIC ENDPOINTS ============

// Submit a new invitation (from public form)
export const submitInvitation = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const invitation = new Invitation({
      name,
      email,
      message,
    });

    await invitation.save();

    res.status(201).json({
      message: "Invitation sent successfully! We'll be in touch soon.",
    });
  } catch (error) {
    console.error("Submit invitation error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ============ ADMIN ENDPOINTS ============

// Get all invitations (admin - includes all statuses)
export const getAllInvitationsAdmin = async (req, res) => {
  try {
    const invitations = await Invitation.find().sort({ createdAt: -1 }); // newest first
    res.json(invitations);
  } catch (error) {
    console.error("Get all invitations admin error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Accept an invitation
export const acceptInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    const invitation = await Invitation.findById(id);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    invitation.status = "accepted";
    await invitation.save();

    res.json(invitation);
  } catch (error) {
    console.error("Accept invitation error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Reject an invitation
export const rejectInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    const invitation = await Invitation.findById(id);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    invitation.status = "rejected";
    await invitation.save();

    res.json(invitation);
  } catch (error) {
    console.error("Reject invitation error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Delete an invitation
export const deleteInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    const invitation = await Invitation.findByIdAndDelete(id);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    res.json({ message: "Invitation deleted successfully" });
  } catch (error) {
    console.error("Delete invitation error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
