import Contact from "../models/ContactSchema.js";

// ── Public ──────────────────────────────────────────────────────────────────

export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    const contact = new Contact({ name, email, phone, subject, message });
    await contact.save();

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ── Admin ───────────────────────────────────────────────────────────────────

/** GET /contact  — fetch all messages, newest first */
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/** PATCH /contact/:id/read  — mark a message as read */
export const markAsRead = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: "read" },
      { new: true },
    );
    if (!contact) return res.status(404).json({ message: "Message not found" });
    res.status(200).json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/** PATCH /contact/:id/responded  — mark a message as responded */
export const markAsResponded = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: "responded" },
      { new: true },
    );
    if (!contact) return res.status(404).json({ message: "Message not found" });
    res.status(200).json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/** DELETE /contact/:id  — permanently delete a message */
export const deleteContactById = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: "Message not found" });
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};
