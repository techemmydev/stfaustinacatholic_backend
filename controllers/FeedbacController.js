import { Feedback } from "../models/FeedbackSchema.js";

// GET /api/feedbacks - Fetch all client feedback
export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find(); // Fetch all feedbacks
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/feedbacks - Add new feedback
export const postFeedback = async (req, res) => {
  try {
    const { name, review, img } = req.body;

    // Validate required fields
    if (!name || !review) {
      return res.status(400).json({
        success: false,
        message: "Name and review are required",
      });
    }
    // If no image is provided, use a default avatar
    const imagePath = img ? `/uploads/${img}` : "/uploads/default-avatar.png";
    // Create a new feedback entry
    const newFeedback = new Feedback({
      name,
      review,
      img: imagePath || "/default-avatar.png", // Provide default if no image
    });

    // Save to database
    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback added successfully",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
