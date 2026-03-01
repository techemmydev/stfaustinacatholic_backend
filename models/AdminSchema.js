import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Super Admin", "Admin", "Staff"],
      default: "Staff",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("Admin", adminSchema);
