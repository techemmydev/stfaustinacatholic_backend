import mongoose from "mongoose";

const priestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    photo: { type: String, default: "" }, // URL
    bio: { type: String, default: "" },
    specializations: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["Available", "On Leave", "Unavailable"],
      default: "Available",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Priest", priestSchema);
