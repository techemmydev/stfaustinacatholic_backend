import mongoose from "mongoose";

const SubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // Ensures no duplicate emails
      trim: true, // Removes extra spaces
      lowercase: true, // Converts email to lowercase
    },
  },
  { timestamps: true }
);

export const Subscriber = mongoose.model("Subscriber", SubscriberSchema);
