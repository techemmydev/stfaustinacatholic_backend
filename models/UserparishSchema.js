import mongoose from "mongoose";
const UserAndAdminparishRegistrationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true }, // Make required
    dob: { type: Date }, // Use Date type instead of String
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"], // Add validation
    },
    address: { type: String },
    phone: { type: String },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true, // Auto convert to lowercase
      trim: true, // Remove whitespace
    },
    occupation: { type: String },
    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Widowed", "Divorced"],
    },
    spouseName: { type: String },
    emergencyContactName: { type: String },
    emergencyContactPhone: { type: String },
    baptismDate: { type: Date },
    baptismParish: { type: String },
    communionDate: { type: Date },
    confirmationDate: { type: Date },
    marriageDate: { type: Date },
    previousParish: { type: String },
    ministries: [{ type: String }],
    preferredMass: { type: String },
    accessibility: { type: String },
    password: { type: String, required: true }, // Hide by default
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // REMOVE isLoggedIn - not needed with JWT
  },
  { timestamps: true }
);
export default mongoose.model(
  "ParishRegistrationUserAndAdmin",
  UserAndAdminparishRegistrationSchema
);
