import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    clientPhone: { type: String, required: true },
    message: {
      type: String,
      required: true,
    },
    checkbox: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

export const Contact = mongoose.model("Contact", ContactSchema);
