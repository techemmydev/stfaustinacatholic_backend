import mongoose from "mongoose";
const parishSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    dob: { type: String },
    gender: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { type: String, unique: true, required: true },
    occupation: { type: String },
    maritalStatus: { type: String },
    spouseName: { type: String },
    emergencyContactName: { type: String },
    emergencyContactPhone: { type: String },
    baptismDate: { type: String },
    baptismParish: { type: String },
    communionDate: { type: String },
    confirmationDate: { type: String },
    marriageDate: { type: String },
    previousParish: { type: String },
    ministries: [{ type: String }],
    preferredMass: { type: String },
    accessibility: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);
export default mongoose.model("ParishRegistration", parishSchema);
