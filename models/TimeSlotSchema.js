import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true, // e.g. "9:00 AM"
    },
    maxCapacity: {
      type: Number,
      required: true,
      default: 5, // how many appointments allowed in this slot
    },
    bookedCount: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true, // admin can manually disable a slot
    },
  },
  { timestamps: true },
);

// Compound index: one slot per date+time combination
timeSlotSchema.index({ date: 1, time: 1 }, { unique: true });

export default mongoose.model("TimeSlot", timeSlotSchema);
