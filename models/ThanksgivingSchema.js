import mongoose from "mongoose";

const thanksgivingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    intention: {
      type: String,
      required: true,
    },
    mass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MassBooking", // ← matches mongoose.model("MassBooking", ...) in MassModel.js
      required: true,
    },
    weekKey: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Prevent duplicate submissions per person per mass per week
thanksgivingSchema.index({ email: 1, mass: 1, weekKey: 1 }, { unique: true });

export default mongoose.model("Thanksgiving", thanksgivingSchema);
