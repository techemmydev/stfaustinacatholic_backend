// Handle form submission

import { Contact } from "../models/ContactSchema.js";
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, message, checkbox, clientPhone } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const contactEntry = new Contact({
      name,
      email,
      message,
      checkbox,
      clientPhone,
    });
    await contactEntry.save();

    res.status(201).json({ message: "Contact form submitted successfully" });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};
