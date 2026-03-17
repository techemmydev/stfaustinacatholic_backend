import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    // Donor details
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },

    // Donation details
    amount: { type: Number, required: true }, // in Naira (NGN)
    project: {
      type: String,
      required: true,
      enum: ["general", "building", "education", "outreach"],
      default: "general",
    },
    donationType: {
      type: String,
      enum: ["one-time", "recurring"],
      default: "one-time",
    },
    frequency: {
      type: String,
      enum: ["weekly", "monthly", "yearly", "none"],
      default: "none",
    },
    message: { type: String, default: "" }, // optional personal note

    // Paystack details
    paystackReference: { type: String, unique: true, sparse: true },
    paystackAccessCode: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "abandoned"],
      default: "pending",
    },

    // Verified by webhook / verify endpoint
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Index for fast admin queries
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ email: 1 });

export default mongoose.model("Donation", donationSchema);
