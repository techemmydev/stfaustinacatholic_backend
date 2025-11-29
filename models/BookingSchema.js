import mongoose from "mongoose";
import validator from "email-validator";

const BookingSchema = new mongoose.Schema(
  {
    clientFirstName: { type: String },
    clientLastName: { type: String },
    clientEmail: {
      type: String,
      required: true,
      validate: {
        validator: (email) => validator.validate(email),
        message: "Invalid email format",
      },
    },
    clientPhone: { type: String, required: true },
    eventDate: { type: Date, required: true },

    eventType: {
      type: String,
      required: true,
      enum: ["wedding", "conference", "birthday", "corporate"],
    },
    eventMessage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", BookingSchema);
