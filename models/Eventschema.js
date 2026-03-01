import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Event", "Retreat", "Festival", "Study", "Service"],
      default: "Event",
    },
    attendees: {
      type: Number,
      default: 0,
    },
    maxAttendees: {
      type: Number,
      required: true,
      default: 50,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Event", eventSchema);
