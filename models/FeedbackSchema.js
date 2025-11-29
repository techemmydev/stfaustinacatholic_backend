import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  review: { type: String, required: true },
  img: { type: String, default: "" }, // Default if no image is provided
});

export const Feedback = mongoose.model("Feedback", FeedbackSchema);
