import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    appointmentType: {
      type: String,
      required: true,
      enum: [
        "mass",
        "baptism",
        "first-communion",
        "confirmation",
        "confession",
        "wedding",
        "general",
      ],
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Appointment", appointmentSchema);
