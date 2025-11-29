import mongoose from "mongoose";

const HallSchema = new mongoose.Schema(
  {
    hallName: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    price: { type: Number, required: true }, // Price per event
    description: { type: String },
    available: { type: Boolean, default: true }, // Check if the hall is available for booking
  },
  { timestamps: true }
);

export const Hall = mongoose.model("Hall", HallSchema);
