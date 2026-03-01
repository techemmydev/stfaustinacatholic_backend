import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isVisible: { type: Boolean, default: false }, // only approved and visible ones show on frontend
  },
  { timestamps: true },
);

export default mongoose.model("Testimonial", testimonialSchema);
