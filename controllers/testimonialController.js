import Testimonial from "../models/TestimonialSchema.js";

// ============ PUBLIC ENDPOINTS ============

// Submit a new testimonial (from public form)
export const submitTestimonial = async (req, res) => {
  try {
    const { name, role, message } = req.body;

    if (!name || !role || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const testimonial = new Testimonial({
      name,
      role,
      message,
    });

    await testimonial.save();

    res.status(201).json({
      message:
        "Testimonial submitted successfully. It will be reviewed before being published.",
    });
  } catch (error) {
    console.error("Submit testimonial error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Get all approved and visible testimonials (for public display)
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({
      status: "approved",
      isVisible: true,
    }).sort({ createdAt: -1 }); // newest first

    res.json(testimonials);
  } catch (error) {
    console.error("Get testimonials error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ============ ADMIN ENDPOINTS ============

// Get all testimonials (admin - includes all statuses)
export const getAllTestimonialsAdmin = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 }); // newest first
    res.json(testimonials);
  } catch (error) {
    console.error("Get all testimonials admin error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Approve a testimonial
export const approveTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    testimonial.status = "approved";
    testimonial.isVisible = true; // Auto-set to visible when approved
    await testimonial.save();

    res.json(testimonial);
  } catch (error) {
    console.error("Approve testimonial error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Reject a testimonial
export const rejectTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    testimonial.status = "rejected";
    testimonial.isVisible = false;
    await testimonial.save();

    res.json(testimonial);
  } catch (error) {
    console.error("Reject testimonial error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Toggle testimonial visibility
export const toggleTestimonialVisibility = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // Only approved testimonials can be toggled
    if (testimonial.status !== "approved") {
      return res.status(400).json({
        message: "Only approved testimonials can be shown/hidden",
      });
    }

    testimonial.isVisible = !testimonial.isVisible;
    await testimonial.save();

    res.json(testimonial);
  } catch (error) {
    console.error("Toggle visibility error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Delete a testimonial
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error("Delete testimonial error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
