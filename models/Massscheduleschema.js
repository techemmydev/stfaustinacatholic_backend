import mongoose from "mongoose";

const massScheduleSchema = new mongoose.Schema(
  {
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
        "Monday - Friday",
        "First Friday",
        "Holy Days",
      ],
    },
    time: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "Sunday Mass",
        "Weekday Mass",
        "Vigil Mass",
        "Evening Mass",
        "Special",
      ],
    },
    language: {
      type: String,
      default: "English",
    },
    location: {
      type: String,
      default: "Main Church",
    },
    notes: {
      type: String,
      default: "",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("MassSchedule", massScheduleSchema);
