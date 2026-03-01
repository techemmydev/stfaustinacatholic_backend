import mongoose from "mongoose";

const massSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      required: true,
      enum: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },
    maxThanksgivings: {
      type: Number,
      default: 5,
      min: 1,
    },
    currentThanksgivings: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

// Compound index to prevent duplicate mass times
massSchema.index({ day: 1, time: 1 }, { unique: true });

export default mongoose.model("MassBooking", massSchema);
